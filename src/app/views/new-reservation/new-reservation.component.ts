import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import { debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap, of } from 'rxjs';
import { Patient } from '../../models/patients'; // Asegúrate de que la ruta sea correcta
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BusinessServiceService } from '../../services/business-service.service';
import { BusinessService } from '../../models/business-service';
import { Appointment } from '../../models/appointment';

interface Profesional {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-new-reservation',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule    
  ],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.scss',
  standalone: true
})
export class NewReservationComponent implements OnInit {

  @Input() appointmentSelected!: Appointment | null;
  @Input() isOpen: boolean = false;
  @Input() patientId!: number | null;
  @Input() selectedDate: Date | null = null;
  @Input() selectedTime: string | null = null;
  @Input() fromUrl: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() reservaGuardada = new EventEmitter<any>();
  searchResults$!: Observable<Patient[]> | undefined;
  filteredPatients$!: Observable<Patient[]>;
  reservaForm: FormGroup;
  profesionales: Profesional[] = [
    { id: 1, nombre: 'Merlyn' }
  ];
  servicios: BusinessService[] = [];

  selectedPatient: Patient | null = null; // Cambiado a un solo paciente
  constructor(private fb: FormBuilder, private patientService: PatientsService, private businessService: BusinessServiceService) {
    this.reservaForm = this.fb.group({
      fecha: [null, Validators.required],
      horaInicio: [null, Validators.required],
      horaFin: [null, Validators.required],
      pacientes: [null, Validators.required], // Cambiado a un solo paciente
      searchPaciente: [''],      
      servicio: [null, Validators.required],
      repetirReserva: [false],
      informacionAdicional: [''],
      precio: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.fillSelectedDate();
    this.setHourForAppointment();    
    this.fillFormWhenPatientAppointmentIsSelected();
    this.listenFieldService();
    this.listenFieldSearchPaciente();     
    this.getAllServices();
  }

  getAllServices() {
    this.businessService.getAllServices()
    .subscribe(business => {
      this.servicios = business;
    });
  }

  listenFieldSearchPaciente() {
    this.searchResults$ = this.reservaForm.get('searchPaciente')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term?.length >= 2),
      switchMap(term => this.patientService.getPatientByName(term))
    );
  }
  listenFieldService() {
    this.reservaForm.get('servicio')?.valueChanges.subscribe(servicioId => {
      const servicioSeleccionado = this.servicios.find(s => s.id === servicioId);
      this.reservaForm.patchValue({ precio: servicioSeleccionado?.price });
    });
  }

  fillFormWhenPatientAppointmentIsSelected() {
     if(this.appointmentSelected?.service.id) {
      this.reservaForm.get('servicio')?.patchValue(this.appointmentSelected?.service.id);      
      this.reservaForm.get('precio')?.patchValue(this.appointmentSelected.service.price);                  
    }

    if (this.thereIsPatientSelected()) {
      if (this.appointmentSelected?.patient.patientId) {
        this.patientId = this.appointmentSelected.patient.patientId;
      }
      this.reservaForm.get('searchPaciente')
      ?.disable({onlySelf: true});

      this.fieldNamePatientSelected();
   
    } else {
      this.reservaForm.get('pacientes')?.patchValue(null);
      this.reservaForm.get('searchPaciente')?.setValue('');
    }

  }

  thereIsPatientSelected() {
    return this.patientId || (this.appointmentSelected !== null && this.appointmentSelected?.patient);
  }

  fieldNamePatientSelected() {
    if (this.patientId) {
           this.patientService.getPatientById(this.patientId)
        .subscribe(patient => {
          this.selectedPatient = patient;
          this.reservaForm.get('pacientes')?.patchValue(patient);
          this.reservaForm.get('searchPaciente')?.setValue(this.getPatientDisplayName(patient));
        });
      }
  }


  
  fillSelectedDate() {
    if (this.selectedDate) {
      this.reservaForm.patchValue({ fecha: this.selectedDate });
    }    
  }
  setHourForAppointment() {
    if(this.selectedTime) {            
      const [hora, minutos] = this.selectedTime.split(':').map(Number);
      const startTime = new Date(this.selectedDate!);
      startTime.setHours(hora, minutos, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hora + 1, minutos, 0, 0);
    
      console.log('Estableciendo horaInicio manualmente:', `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`);

      this.reservaForm.patchValue({
        horaInicio: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
        horaFin: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
      });
    }
  }

  onCloseModal(): void {
    this.closeModal.emit();
    this.reservaForm.reset();
    this.selectedPatient = null;
  }

  onGuardarReserva(): void {
    if (this.reservaForm.valid) {
      const fecha = this.reservaForm.get('fecha')?.value;
      const horaInicio = this.reservaForm.get('horaInicio')?.value;
      const horaFin = this.reservaForm.get('horaFin')?.value;
      const paciente = this.reservaForm.get('pacientes')?.value;
      const serviceId = this.reservaForm.get('servicio')?.value;

      if (fecha && horaInicio && horaFin && paciente && serviceId) {
        const [startHour, startMinute] = horaInicio.split(':').map(Number);
        const [endHour, endMinute] = horaFin.split(':').map(Number);

        const appointmentStart = new Date(fecha);
        appointmentStart.setHours(startHour, startMinute, 0, 0);

        const appointmentEnd = new Date(fecha);
        appointmentEnd.setHours(endHour, endMinute, 0, 0);

        const newReservationData = {
          patientId: this.patientId ? this.patientId : this.selectedPatient?.patientId,
          appointmentStart: appointmentStart, // Envía en formato ISO 8601
          appointmentEnd: appointmentEnd,
          service: {
            id: serviceId
          }
          // Otros datos del formulario si son necesarios
        };

        this.reservaGuardada.emit(newReservationData);
        this.onCloseModal();
      } else {
        this.reservaForm.markAllAsTouched();
      }
    } else {
      this.reservaForm.markAllAsTouched();
    }
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.reservaForm.get('pacientes')?.setValue(patient);
    this.reservaForm.get('searchPaciente')?.setValue(''); 
  }

  removePatient(): void {
    this.selectedPatient = null;
    this.reservaForm.get('pacientes')?.setValue(null);
    this.reservaForm.get('searchPaciente')?.setValue('');
  }

  getPatientDisplayName(patient: Patient): string {
    return `${patient.person?.firstName || ''} ${patient.person?.lastName || ''}`;
  }

dateOrHourOfAppointmentChange(): boolean {
  if (!this.appointmentSelected) {
    return false;
  }

  const formHoraInicio = this.reservaForm.get('horaInicio')?.value; // string: "13:00"
  const formHoraFin = this.reservaForm.get('horaFin')?.value;       // string: "14:00"

  const appointmentStart = new Date(this.appointmentSelected.appointmentStart); // Date
  const appointmentEnd = new Date(this.appointmentSelected.appointmentEnd);     // Date

  // Extraer fecha del form (suponiendo que ya tienes selectedDate)
  const selectedDate = this.appointmentSelected.appointmentStart ?? appointmentStart; // Fallback si no hay selectedDate

  const [horaInicioH, horaInicioM] = formHoraInicio.split(':').map(Number);
  const [horaFinH, horaFinM] = formHoraFin.split(':').map(Number);

  // Crear objetos Date con fecha + hora del formulario
  const formStartDate = new Date(selectedDate);
  formStartDate.setHours(horaInicioH, horaInicioM, 0, 0);

  const formEndDate = new Date(selectedDate);
  formEndDate.setHours(horaFinH, horaFinM, 0, 0);

  // Validar si la fecha-hora de inicio o fin cambió
  const startChanged = formStartDate.getTime() !== appointmentStart.getTime();
  const endChanged = formEndDate.getTime() !== appointmentEnd.getTime();

  if (startChanged || endChanged) {
    console.log('Cambio detectado en la reserva:');
    if (startChanged) {
      console.log('Hora de inicio diferente:', formStartDate, 'vs', appointmentStart);
    }
    if (endChanged) {
      console.log('Hora de fin diferente:', formEndDate, 'vs', appointmentEnd);
    }
    return true;
  }

  return false;
}

}