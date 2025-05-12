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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  MatMenuModule,
  RouterModule
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
 lastPatientName: string | null = null;

 constructor(
  private route: ActivatedRoute,
  private appointmentService: AppointmentsService,
  private businessScheduleService: BusinessScheduleService,
  private router: Router
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
      nombrePaciente: appointmet.fullName || '',
      patientId: appointmet.patientId,
      service: appointmet.businessServiceEntity
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
    const horaFinCita = citaExistente.end;
    const nuevaHoraInicio = new Date(horaFinCita);
    nuevaHoraInicio.setSeconds(0, 0);

    // Redondear hacia la próxima hora o media hora
    const minutos = nuevaHoraInicio.getMinutes();
    if (minutos === 0) {
      nuevaHoraInicio.setMinutes(30);
    } else {
      nuevaHoraInicio.setHours(nuevaHoraInicio.getHours() + 1);
      nuevaHoraInicio.setMinutes(0);
    }

    const nuevaHoraInicioStr = `${nuevaHoraInicio.getHours().toString().padStart(2, '0')}:${nuevaHoraInicio.getMinutes().toString().padStart(2, '0')}`;

    // Verificar si está dentro del rango de la agenda
    const [horaInicioAgenda, minutosInicioAgenda] = this.horasDia[0].split(':').map(Number);
    const [horaFinAgenda, minutosFinAgenda] = this.horasDia[this.horasDia.length - 1].split(':').map(Number);
    const nuevaHoraInicioNumero = this.convertirHoraANumero(nuevaHoraInicioStr);
    const horaInicioAgendaNumero = horaInicioAgenda * 60 + minutosInicioAgenda;
    const horaFinAgendaNumero = horaFinAgenda * 60 + minutosFinAgenda;

    if (nuevaHoraInicioNumero >= horaInicioAgendaNumero && nuevaHoraInicioNumero <= horaFinAgendaNumero) {
      const diaSemana = this.obtenerDiaSemanaString(dia);
      const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);

      if (schedule && schedule.breakStartTime && schedule.breakEndTime) {
        const inicioDescanso = this.convertirHoraANumero(schedule.breakStartTime.substring(0, 5));
        const finDescanso = this.convertirHoraANumero(schedule.breakEndTime.substring(0, 5));

        if ((inicioDescanso < finDescanso && nuevaHoraInicioNumero >= inicioDescanso && nuevaHoraInicioNumero < finDescanso) ||
            (inicioDescanso > finDescanso && (nuevaHoraInicioNumero >= inicioDescanso || nuevaHoraInicioNumero < finDescanso))) {
          alert('La siguiente hora disponible cae dentro del descanso. No se puede reservar.');
          return;
        }
      }

      // Mostrar el modal con la siguiente hora disponible
      this.isModalOpen = true;
      this.selectedDateForModal = dia;
      this.selectedTimeForModal = nuevaHoraInicioStr;
    } else {
      alert('No se puede crear una reserva fuera del horario de la agenda.');
    }

    return;
  }

  // Si no hay cita, abrir directamente el modal si no está en descanso
  const diaSemana = this.obtenerDiaSemanaString(dia);
  const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);

  if (schedule && schedule.breakStartTime && schedule.breakEndTime) {
    const horaSeleccionada = this.convertirHoraANumero(hora);
    const inicioDescanso = this.convertirHoraANumero(schedule.breakStartTime.substring(0, 5));
    const finDescanso = this.convertirHoraANumero(schedule.breakEndTime.substring(0, 5));

    if ((inicioDescanso < finDescanso && horaSeleccionada >= inicioDescanso && horaSeleccionada < finDescanso) ||
        (inicioDescanso > finDescanso && (horaSeleccionada >= inicioDescanso || horaSeleccionada < finDescanso))) {
      alert('No se puede reservar durante el descanso.');
      return;
    }
  }

  this.isModalOpen = true;
  this.selectedDateForModal = dia;
  this.selectedTimeForModal = hora;
}


lastCitaEndTime: number | null = null;

obtenerCitaEnHoraConDetalle(dia: Date, hora: string, citas: any[], patientFilter: string = ''): any | null {
  if (!hora) return null;

  const [horaInicioSlot, minutosInicioSlot] = hora.split(':').map(Number);
  const inicioSlot = new Date(dia);
  inicioSlot.setHours(horaInicioSlot, minutosInicioSlot, 0, 0);

  // Verificar si hay una cita en la hora anterior
  const horaAnterior = new Date(inicioSlot.getTime() - 60 * 60 * 1000); // 1 hora antes
  const citaEnHoraAnterior = citas.find(cita => {
    const nombrePaciente = cita.nombrePaciente?.toLowerCase() || '';
    const filtro = patientFilter.toLowerCase();
    return cita.start < new Date(horaAnterior.getTime() + 60 * 60 * 1000) &&
           cita.end > horaAnterior &&
           nombrePaciente.includes(filtro);
  });

  // Buscar la cita en la hora actual
  const citaEnSlot = citas.find(cita => {
    const nombrePaciente = cita.nombrePaciente?.toLowerCase() || '';
    const filtro = patientFilter.toLowerCase();

    return cita.start < new Date(inicioSlot.getTime() + 60 * 60 * 1000) &&
           cita.end > inicioSlot &&
           nombrePaciente.includes(filtro);
  });

  if (citaEnSlot) {
    const citaStartTimeMs = citaEnSlot.start.getTime();
    const citaEndTimeMs = citaEnSlot.end.getTime();

    // Comprobamos si la cita anterior termina justo cuando esta comienza
    if (this.lastCitaEndTime && this.lastCitaEndTime === citaStartTimeMs) {
      return null; // Si la cita es consecutiva a la anterior, no la pintamos
    }

    // Guardamos el tiempo de fin de esta cita para compararlo con la próxima
    this.lastCitaEndTime = citaEndTimeMs;

    // Verificar si el paciente tiene una cita en la hora anterior y poner una flag
    const isConsecutive = !!citaEnHoraAnterior;
    const citaFlag = isConsecutive ? 'consecutive' : 'normal';

    // Calcular la duración de la cita en milisegundos y minutos
    const diferenciaMs = citaEndTimeMs - citaStartTimeMs;
    const duracionEnMinutos = diferenciaMs / (1000 * 60);

    // Calcular el costo de la consulta
    let costoTotal = 0;
    if (duracionEnMinutos > 60) {
      const minutosExtras = duracionEnMinutos - 60;
      const horasOFraccionesExtras = Math.ceil(minutosExtras / 60);
      costoTotal = horasOFraccionesExtras * 40;
    }

    // Calcular la posición visual (top y height)
    const slotStartMs = inicioSlot.getTime();
    const slotEndMs = slotStartMs + 60 * 60 * 1000;

    const citaStartMs = citaStartTimeMs;
    const citaEndMs = citaEndTimeMs;

    const overlapStartMs = Math.max(slotStartMs, citaStartMs);
    const overlapEndMs = Math.min(slotEndMs, citaEndMs);

    const overlapDurationMs = overlapEndMs - overlapStartMs;
    const slotDurationMs = slotEndMs - slotStartMs;

    // Si la cita dura más de una hora, solo mostrar la primera hora visualmente
    if (citaEndMs > slotEndMs) {
      const firstHourEndMs = slotStartMs + 60 * 60 * 1000;
      const firstHourOverlapDurationMs = firstHourEndMs - overlapStartMs;
      const firstHourTopPercentage = (firstHourOverlapDurationMs / slotDurationMs) * 100;
      const firstHourHeightPercentage = (firstHourOverlapDurationMs / slotDurationMs) * 100;

      return {
        ...citaEnSlot,
        patient: citaEnSlot,
        top: `${firstHourTopPercentage.toFixed(2)}%`,
        height: `${firstHourHeightPercentage.toFixed(2)}%`,
        flag: citaFlag,
        costo: costoTotal
      };
    }

    const topOffsetMs = overlapStartMs - slotStartMs;
    const topPercentage = (topOffsetMs / slotDurationMs) * 100;
    const heightPercentage = (overlapDurationMs / slotDurationMs) * 100;

    return {
      ...citaEnSlot,
      patient: citaEnSlot,
      top: `${topPercentage.toFixed(2)}%`,
      height: `${heightPercentage.toFixed(2)}%`,
      flag: citaFlag,
      costo: costoTotal
    };
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
   appointmentEnd: reservaData.appointmentEnd,
   service: reservaData.service
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


   viewPatientDetails(patientId: number) {    
     this.router.navigate(['patient-details', patientId]);
   }

}