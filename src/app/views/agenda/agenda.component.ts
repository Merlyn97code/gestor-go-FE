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
import { BusinessScheduleService } from '../../services/business-schedule.service';
import { BusinessSchedule } from '../../models/tenant-user';
import {MatMenuModule} from '@angular/material/menu';


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
  MatMenuModule
 ],
 templateUrl: './agenda.component.html',
 styleUrl: './agenda.component.scss',
 standalone: true,
})
export class AgendaComponent implements OnInit, OnDestroy {
 patientId!: number;
 fechaActual: Date = new Date();
 diasSemana: Date[] = [];
 horasDia: string[] = [];
 citas: any[] = [];
 isModalOpen: boolean = false;
 selectedDateForModal: Date | null = null;
 selectedTimeForModal: string | null = null;
 patientFilter: string = '';
 businessSchedules: BusinessSchedule[] = [];
 private routeSubscription: Subscription | undefined;
 private appointmentSubscription: Subscription | undefined;
 private saveAppointmentSubscription: Subscription | undefined;
 fromUrl: boolean = false;

 constructor(
  private route: ActivatedRoute,
  private appointmentService: AppointmentsService,
  private businessScheduleService: BusinessScheduleService
 ) {}

 ngOnInit(): void {
  this.businessScheduleService.retrieveBusinessSchedule()
   .subscribe(data => {
    this.businessSchedules = data;
    this.cargarHorasDia();
   });
  this.cargarSemana();
  this.cargarCitasDeLaSemana();

  this.routeSubscription = this.route.params.subscribe(params => {
   this.patientId = params['id'] ? +params['id'] : 0;
   this.fromUrl = params['id'] ? true : false;
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

 cargarHorasDia(): void {
  this.horasDia = [];
  for (let hour = 7; hour <= 22; hour++) {
   const formattedHour = `${hour.toString().padStart(2, '0')}:00`;
   this.horasDia.push(formattedHour);
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
     const startDateTime = new Date(appointmet.appointmentStart);
     const endDateTime = new Date(appointmet.appointmentEnd);

     return {
      id: appointmet.appointmentId,
      start: startDateTime,
      end: endDateTime,
      nombrePaciente: appointmet.fullName || 'test',
     };
    });
   }
  );
 }

 obtenerCitaEnHora(dia: Date, hora: string, citas: any[], patientFilter: string = ''): any | undefined {
  if (hora) {
    const [horaInicioSlot, minutosInicioSlot] = hora.split(':').map(Number);
    const inicioSlot = new Date(dia);
    inicioSlot.setHours(horaInicioSlot, minutosInicioSlot, 0, 0);

    const finSlot = new Date(inicioSlot);
    finSlot.setMinutes(finSlot.getMinutes() + 60); // un slot de una hora

    return citas.find(cita => {
      const nombrePaciente = cita.nombrePaciente.toLowerCase();
      const filtro = patientFilter.toLowerCase();

      // Ajuste clave: permitir reservar en el minuto exacto que termina la cita
      return cita.start < finSlot && cita.end > inicioSlot && nombrePaciente.includes(filtro);
    });
  } else {
    return undefined;
  }
}


 abrirModalNuevaReserva(dia: Date, hora: string): void {
  const citaExistente = this.obtenerCitaEnHora(dia, hora, this.citas, this.patientFilter);

  if (citaExistente) {
   // Si hay una cita existente en este slot
   const horaFinCita = citaExistente.end;
   const minutosFinCita = horaFinCita.getMinutes();
   let nuevaHoraInicio = new Date(horaFinCita);

   if (minutosFinCita === 0) {
    nuevaHoraInicio.setMinutes(30);
   } else if (minutosFinCita > 0 && minutosFinCita <= 30) {
    nuevaHoraInicio.setHours(horaFinCita.getHours() + 1, 0, 0, 0);
   } else {
    // Si la cita termina después de la media hora, la siguiente reserva sería en la hora siguiente
    nuevaHoraInicio.setHours(horaFinCita.getHours() + 1, 0, 0, 0);
   }

   // Formatear la nueva hora de inicio al formato 'HH:mm'
   const nuevaHoraInicioStr = `<span class="math-inline">\{nuevaHoraInicio\.getHours\(\)\.toString\(\)\.padStart\(2, '0'\)\}\:</span>{nuevaHoraInicio.getMinutes().toString().padStart(2, '0')}`;

   // Verificar si la nueva hora de inicio está dentro del horario de la agenda
   const [horaInicioAgenda, minutosInicioAgenda] = this.horasDia[0].split(':').map(Number);
   const [horaFinAgenda, minutosFinAgenda] = this.horasDia[this.horasDia.length - 1].split(':').map(Number);

   const nuevaHoraInicioNumero = this.convertirHoraANumero(nuevaHoraInicioStr);
   const horaInicioAgendaNumero = horaInicioAgenda * 60 + minutosInicioAgenda;
   const horaFinAgendaNumero = horaFinAgenda * 60 + minutosFinAgenda + 59; // Considerar hasta el final de la última hora

   if (nuevaHoraInicioNumero >= horaInicioAgendaNumero && nuevaHoraInicioNumero <= horaFinAgendaNumero) {
    this.isModalOpen = true;
    this.selectedDateForModal = dia;
    this.selectedTimeForModal = nuevaHoraInicioStr;
   } else {
    alert('No se puede crear una reserva fuera del horario de la agenda.');
   }

   return; // No abrir el modal con la hora original
  }

  // Si no hay cita existente, abrir el modal con la hora clickeada
  const diaSemana = this.obtenerDiaSemanaString(dia);
  const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);

  if (schedule) {
   if (schedule.breakStartTime && schedule.breakEndTime) {
    const horaInicioDescanso = schedule.breakStartTime.substring(0, 5);
    const horaFinDescanso = schedule.breakEndTime.substring(0, 5);

    const horaSeleccionada = this.convertirHoraANumero(hora);
    const inicioDescanso = this.convertirHoraANumero(horaInicioDescanso);
    const finDescanso = this.convertirHoraANumero(horaFinDescanso);

    if (inicioDescanso > finDescanso) {
     if (horaSeleccionada >= inicioDescanso || horaSeleccionada < finDescanso) {
      alert('No se puede reservar durante el descanso.');
      return;
     }
    } else {
     if (horaSeleccionada >= inicioDescanso && horaSeleccionada < finDescanso) {
      alert('No se puede reservar durante el descanso.');
      return;
     }
    }
   }
  }

  this.isModalOpen = true;
  this.selectedDateForModal = dia;
  this.selectedTimeForModal = hora;
 }

 obtenerCitaEnHoraConDetalle(dia: Date, hora: string, citas: any[], patientFilter: string = ''): any | null {  
   if (hora) {
     const [horaInicioSlot, minutosInicioSlot] = hora.split(':').map(Number);
     const inicioSlot = new Date(dia);
     inicioSlot.setHours(horaInicioSlot, minutosInicioSlot, 0, 0);

     const finSlot = new Date(dia);
     finSlot.setHours(horaInicioSlot + 1, minutosInicioSlot, 0, 0);     
     const citaEnSlot = citas.find(cita => {
       const nombrePaciente = cita.nombrePaciente.toLowerCase();
       const filtro = patientFilter.toLowerCase();
       return cita.start < finSlot && cita.end > inicioSlot && nombrePaciente.includes(filtro);
     });
     
     if (citaEnSlot) {
       const startTimeSlotMs = inicioSlot.getTime();
       const endTimeSlotMs = finSlot.getTime();
       const citaStartTimeMs = citaEnSlot.start.getTime();
       const citaEndTimeMs = citaEnSlot.end.getTime();

       const overlapStartMs = Math.max(startTimeSlotMs, citaStartTimeMs);
       const overlapEndMs = Math.min(endTimeSlotMs, citaEndTimeMs);

       const overlapDurationMs = overlapEndMs - overlapStartMs;
       const slotDurationMs = endTimeSlotMs - startTimeSlotMs;

       const topOffsetMs = overlapStartMs - startTimeSlotMs;
       const topPercentage = (topOffsetMs / slotDurationMs) * 100;
       const heightPercentage = (overlapDurationMs / slotDurationMs) * 100;

       console.log("log on 232");
       
       return {
         patient: citaEnSlot,
         topPercentage: Math.max(0, topPercentage),
         heightPercentage: Math.max(0, heightPercentage),
       };
     }
   }   
   return null;
 }
 convertirHoraANumero(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
 }

 cerrarModalNuevaReserva(): void {
  this.isModalOpen = false;
  this.selectedDateForModal = null;
  this.selectedTimeForModal = null;
 }

 guardarNuevaReserva(reservaData: any): void {
  const body: Appointment = {
   patient: {
    patientId: (this.patientId) ? this.patientId : reservaData.patientId,
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

 obtenerDiaSemanaString(date: Date): string {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[date.getDay()];
 }

 esHoraDeDescanso(dia: Date, hora: string): boolean {
  const diaSemana = this.obtenerDiaSemanaString(dia);
  const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);

  if (schedule && schedule.breakStartTime && schedule.breakEndTime) {
   const horaInicioDescanso = schedule.breakStartTime.substring(0, 5);
   const horaFinDescanso = schedule.breakEndTime.substring(0, 5);

   const horaSeleccionada = this.convertirHoraANumero(hora);
   const inicioDescanso = this.convertirHoraANumero(horaInicioDescanso);
   const finDescanso = this.convertirHoraANumero(horaFinDescanso);

   if (inicioDescanso > finDescanso) {
    return horaSeleccionada >= inicioDescanso || horaSeleccionada < finDescanso;
   } else {
    return horaSeleccionada >= inicioDescanso && horaSeleccionada < finDescanso;
   }
  }

  return false;
 }

 esDiaNoLaborable(dia: Date): boolean {
  const diaSemana = this.obtenerDiaSemanaString(dia);
  const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);
  return !!schedule && schedule.nonWorkingDay;
 }

}