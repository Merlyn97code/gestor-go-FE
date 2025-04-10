import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Appointment } from '../../models/appointment';
import { AppointmentsService } from '../../services/appointments.service';
import { NewReservationComponent } from '../new-reservation/new-reservation.component';
import { MontViewComponent } from '../../components/mont-view/mont-view.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agenda',
  imports: [
    FormsModule,
    CommonModule,
    MontViewComponent,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule,
    NewReservationComponent,
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  standalone: true,
})
export class AgendaComponent implements OnInit, OnDestroy {
  patientId!: number;
  fechaActual: Date = new Date();
  diasSemana: Date[] = [];
  horasDia: string[] = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00',
  ];
  citas: any[] = [];
  isModalOpen: boolean = false;
  selectedDateForModal: Date | null = null;
  selectedTimeForModal: string | null = null;

  private routeSubscription: Subscription | undefined;
  private appointmentSubscription: Subscription | undefined;
  private saveAppointmentSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.cargarSemana();
    this.cargarCitasDeLaSemana();

    this.routeSubscription = this.route.params.subscribe(params => {
      this.patientId = params['id'] ? +params['id'] : 0;
      // Puedes realizar alguna acción si el ID cambia aquí, como recargar citas para el paciente.
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
    if (this.saveAppointmentSubscription) {
      this.saveAppointmentSubscription.unsubscribe();
    }
  }

  cargarSemana(): void {
    this.diasSemana = [];
    const primerDiaSemana = this.obtenerPrimerDiaDeLaSemana(this.fechaActual);
    for (let i = 0; i < 7; i++) {
      const dia = new Date(primerDiaSemana);
      dia.setDate(primerDiaSemana.getDate() + i);
      this.diasSemana.push(dia);
    }
  }

  obtenerPrimerDiaDeLaSemana(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  navegarSemana(delta: number): void {
    const primerDiaActual = this.diasSemana[0];
    const nuevoPrimerDia = new Date(primerDiaActual);
    nuevoPrimerDia.setDate(primerDiaActual.getDate() + delta * 7);
    this.fechaActual = nuevoPrimerDia;
    this.cargarSemana();
    this.cargarCitasDeLaSemana();
  }

  cargarCitasDeLaSemana(): void {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
    this.appointmentSubscription = this.appointmentService.getAllAppointment().subscribe(
      appointmets => {
        this.citas = appointmets.map(appointmet => {
          // Asumiendo que appointmentStart es un string en formato ISO 8601 o similar
          const startDateTime = new Date(appointmet.appointmentStart);
          const endDateTime = new Date(appointmet.appointmentEnd);
  
          return {
            id: appointmet.appointmentId,
            start: startDateTime,
            end: endDateTime,
            nombrePaciente: appointmet.patient.person?.firstName || 'test',
          };
        });
      }
    );
  }

  obtenerCitaEnHora(dia: Date, hora: string, citas: any[]): any | undefined {
    const [horaInicioSlot] = hora.split(':').map(Number);
    const inicioDiaSlot = new Date(dia);
    inicioDiaSlot.setHours(horaInicioSlot, 0, 0, 0);

    const finDiaSlot = new Date(dia);
    finDiaSlot.setHours(horaInicioSlot + 1, 0, 0, 0);

    return citas.find(cita => {
      const horaInicioCita = cita.start.getHours();
      return horaInicioCita === horaInicioSlot && cita.start >= inicioDiaSlot && cita.start < finDiaSlot;
    });
  }

  abrirModalNuevaReserva(dia: Date, hora: string): void {
    this.isModalOpen = true;
    this.selectedDateForModal = dia;
    this.selectedTimeForModal = hora;
  }

  cerrarModalNuevaReserva(): void {
    this.isModalOpen = false;
    this.selectedDateForModal = null;
    this.selectedTimeForModal = null;
  }

  guardarNuevaReserva(reservaData: any): void {
    console.log('====================================');
    console.log("reserva data ", reservaData);
    console.log('====================================');
    const body: Appointment = {
      patient: {
        patientId: this.patientId,
      },
      appointmentStart: reservaData.appointmentStart,
      appointmentEnd: reservaData.appointmentEnd
    };

    if (this.saveAppointmentSubscription) {
      this.saveAppointmentSubscription.unsubscribe();
    }
    this.saveAppointmentSubscription = this.appointmentService.saveAppointment(body).subscribe(() => {
      this.cargarCitasDeLaSemana();
    });
  }
}