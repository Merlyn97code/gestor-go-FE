import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import { debounceTime, distinctUntilChanged, filter, Observable, Subject, switchMap } from 'rxjs';
import { Patient } from '../../models/patients'; // Asegúrate de que la ruta sea correcta
import { AppointmentsService } from '../../services/appointments.service';

interface Profesional {
  id: number;
  nombre: string;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-new-reservation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.scss',
  standalone: true
})
export class NewReservationComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() patientId!: number | null;
  @Input() selectedDate: Date | null = null;
  @Input() selectedTime: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() reservaGuardada = new EventEmitter<any>();
  searchResults$!: Observable<Patient[]> | undefined;
  private searchTerms$ = new Subject<string>();
  reservaForm: FormGroup;
  profesionales: Profesional[] = [
    { id: 1, nombre: 'Merlyn' }
  ];
  servicios: Servicio[] = [
    { id: 1, nombre: 'Consulta Médica', precio: 5250 }
  ];

  selectedPatients: Patient[] = [];
  constructor(private fb: FormBuilder, private patientService: PatientsService, private appointmentService: AppointmentsService) {
    this.reservaForm = this.fb.group({
      fecha: [null, Validators.required],
      horaInicio: [null, Validators.required],
      horaFin: [null, Validators.required],
      pacientes: [[], Validators.required],
      searchPaciente: [''],
      profesional: [null, Validators.required],
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
      this.reservaForm.patchValue({ precio: servicioSeleccionado?.precio });
    });

    this.searchResults$ = this.reservaForm.get('searchPaciente')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 2),
      switchMap(term => this.patientService.getPatientByName(term))
    );

    if (this.patientId) {
      this.patientService.getPatientById(this.patientId)
        .subscribe(patient => {
          this.selectedPatients = [patient];
          this.reservaForm.get('pacientes')?.patchValue(this.selectedPatients);
        });
    } else {
      this.reservaForm.get('pacientes')?.patchValue([]);
    }
  }

  onCloseModal(): void {
    this.closeModal.emit();
    this.reservaForm.reset();
    this.selectedPatients = [];
  }

  onGuardarReserva(): void {
    if (this.reservaForm.valid) {
      const fecha = this.reservaForm.get('fecha')?.value;
      const horaInicio = this.reservaForm.get('horaInicio')?.value;
      const horaFin = this.reservaForm.get('horaFin')?.value;
      const pacientes = this.reservaForm.get('pacientes')?.value;

      if (fecha && horaInicio && horaFin && pacientes.length > 0 && this.patientId) {
        const [startHour, startMinute] = horaInicio.split(':').map(Number);
        const [endHour, endMinute] = horaFin.split(':').map(Number);

        const appointmentStart = new Date(fecha);
        console.log('====================================');
        console.log("fecha ", fecha);
        console.log('====================================');
        appointmentStart.setHours(startHour, startMinute, 0, 0);

        const appointmentEnd = new Date(fecha);
        appointmentEnd.setHours(endHour, endMinute, 0, 0);

        const newReservationData = {
          patientId: this.patientId,
          appointmentStart: appointmentStart, // Envía en formato ISO 8601
          appointmentEnd: appointmentEnd
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
    if (!this.selectedPatients.some(p => p.patientId === patient.patientId)) {
      this.selectedPatients = [...this.selectedPatients, patient];
      this.reservaForm.get('pacientes')?.setValue(this.selectedPatients);
      this.reservaForm.get('searchPaciente')?.setValue('');
    }  
  }

  removePatient(patient: Patient): void {
    this.selectedPatients = this.selectedPatients.filter(p => p.patientId !== patient.patientId);
    this.reservaForm.get('pacientes')?.setValue(this.selectedPatients);
  }

  getPatientDisplayName(patient: Patient): string {
    return `${patient.person?.firstName || ''} ${patient.person?.lastName || ''}`;
  }
}