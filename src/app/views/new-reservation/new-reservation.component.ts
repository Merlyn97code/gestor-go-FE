import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import { debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap, of } from 'rxjs';
import { Patient } from '../../models/patients'; // Asegúrate de que la ruta sea correcta
import { AppointmentsService } from '../../services/appointments.service';
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
    if (this.selectedDate) {
      this.reservaForm.patchValue({ fecha: this.selectedDate });
    }
    if (this.selectedTime) {
      const [hora, minutos] = this.selectedTime.split(':').map(Number);
      const startTime = new Date(this.selectedDate!);
      startTime.setHours(hora, minutos, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hora + 1, minutos, 0, 0);

      this.reservaForm.patchValue({
        horaInicio: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
        horaFin: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
      });
    }

    this.reservaForm.get('servicio')?.valueChanges.subscribe(servicioId => {
      const servicioSeleccionado = this.servicios.find(s => s.id === servicioId);
      this.reservaForm.patchValue({ precio: servicioSeleccionado?.price });
    });

    this.searchResults$ = this.reservaForm.get('searchPaciente')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 2),
      switchMap(term => this.patientService.getPatientByName(term))
    );

    if (this.patientId) {
      this.reservaForm.get('searchPaciente')
      ?.disable({onlySelf: true});
      this.patientService.getPatientById(this.patientId)
        .subscribe(patient => {
          this.selectedPatient = patient;
          this.reservaForm.get('pacientes')?.patchValue(patient);
          this.reservaForm.get('searchPaciente')?.setValue(this.getPatientDisplayName(patient));
        });
    } else {
      this.reservaForm.get('pacientes')?.patchValue(null);
      this.reservaForm.get('searchPaciente')?.setValue('');
    }

    this.businessService.getAllServices()
    .subscribe(business => {
      this.servicios = business;
    });
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
}