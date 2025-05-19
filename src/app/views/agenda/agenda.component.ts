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
citasPorDiaYHora = new Map<string, any[]>();
appointmentSelected!: Appointment | null;
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
    const primerDiaSemana = this.obtenerPrimerDiaDeLaSemana(this.fechaActual);
    this.diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(primerDiaSemana);
      dia.setDate(primerDiaSemana.getDate() + i);
      return dia;
    });
  }


 obtenerPrimerDiaDeLaSemana(date: Date): Date {
  const day = date.getDay();    
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);  
  return new Date(date.setDate(diff));
 }

  navegarSemana(delta: number): void {
    const nuevoPrimerDia = new Date(this.diasSemana[0]);
    nuevoPrimerDia.setDate(nuevoPrimerDia.getDate() + delta * 7);
    this.fechaActual = nuevoPrimerDia;
    this.cargarSemana();
    this.cargarCitasDeLaSemana();
  }

  cargarCitasDeLaSemana(): void {
    this.appointmentSubscription?.unsubscribe();
    this.appointmentSubscription = this.appointmentService.getAllAppointment().subscribe(
      appointments => {
        this.citas = appointments.map(appointment => ({
          id: appointment.appointmentId,
          start: new Date(appointment.appointmentStart),
          end: new Date(appointment.appointmentEnd),
          nombrePaciente: appointment.fullName || '',
          patientId: appointment.patientId,
          service: appointment.businessServiceEntity,
        }));
      }
    );
  }


  obtenerCitaEnHora(dia: Date, hora: string, citas: any[], patientFilter: string = ''): any | undefined {
    if (!hora) return undefined;

    const [horaInicioSlot, minutosInicioSlot] = hora.split(':').map(Number);
    const inicioSlot = new Date(dia);
    inicioSlot.setHours(horaInicioSlot, minutosInicioSlot, 0, 0);

    const finSlot = new Date(inicioSlot);
    finSlot.setMinutes(finSlot.getMinutes() + 60);

    return citas.find(cita => {
      const nombrePaciente = cita.nombrePaciente.toLowerCase();
      const filtro = patientFilter.toLowerCase();
      return cita.start < finSlot && cita.end > inicioSlot && nombrePaciente.includes(filtro);
    });
  }



  abrirModalNuevaReserva(dia: Date, hora: string): void {
    const diaSemana = this.obtenerDiaSemanaString(dia);
    const schedule = this.businessSchedules.find(s => s.dayOfWeek === diaSemana);

    const verificarDescanso = (horaNumero: number): boolean => {
      if (!schedule || !schedule.breakStartTime || !schedule.breakEndTime) return false;
      const inicioDescanso = this.convertirHoraANumero(schedule.breakStartTime);
      const finDescanso = this.convertirHoraANumero(schedule.breakEndTime);
      return (inicioDescanso < finDescanso && horaNumero >= inicioDescanso && horaNumero < finDescanso) ||
             (inicioDescanso > finDescanso && (horaNumero >= inicioDescanso || horaNumero < finDescanso));
    };
    
      const citaExistente = this.obtenerCitaEnHora(dia, hora, this.citas, this.patientFilter);
      if (citaExistente) {
        const nuevaHoraInicio = new Date(citaExistente.end);
        nuevaHoraInicio.setSeconds(0, 0);
        const minutos = nuevaHoraInicio.getMinutes();
        nuevaHoraInicio.setMinutes(minutos === 0 ? 30 : 0);
        if (minutos !== 0) nuevaHoraInicio.setHours(nuevaHoraInicio.getHours() + 1);

        const nuevaHoraInicioStr = `${nuevaHoraInicio.getHours().toString().padStart(2, '0')}:${nuevaHoraInicio.getMinutes().toString().padStart(2, '0')}`;
        const nuevaHoraInicioNum = this.convertirHoraANumero(nuevaHoraInicioStr);
        const horaInicioAgenda = this.convertirHoraANumero(this.horasDia[0]);
        const horaFinAgenda = this.convertirHoraANumero(this.horasDia[this.horasDia.length - 1]);

        if (nuevaHoraInicioNum >= horaInicioAgenda && nuevaHoraInicioNum <= horaFinAgenda) {
          if (verificarDescanso(nuevaHoraInicioNum)) {
            alert('La siguiente hora disponible cae dentro del descanso. No se puede reservar.');
            return;
          }
          this.isModalOpen = true;
          this.selectedDateForModal = dia;
          this.selectedTimeForModal = nuevaHoraInicioStr;
        } else {
          alert('No se puede crear una reserva fuera del horario de la agenda.');
        }
        return;
      }
    const horaSeleccionada = this.convertirHoraANumero(hora);
    if (verificarDescanso(horaSeleccionada)) {
      alert('No se puede reservar durante el descanso.');
      return;
    }

    this.isModalOpen = true;
    this.selectedDateForModal = dia;
    this.selectedTimeForModal = hora;
  }


lastCitaEndTime: number | null = null;

obtenerCitasEnHoraConDetalle(dia: Date, hora: string, citas: any[], patientFilter: string = ''): any[] { 
  if (!hora) return [];

  const [horaInicioSlot, minutosInicioSlot] = hora.split(':').map(Number);
  const inicioSlot = new Date(dia);
  inicioSlot.setHours(horaInicioSlot, minutosInicioSlot, 0, 0);

  const horaAnterior = new Date(inicioSlot.getTime() - 60 * 60 * 1000);
  const filtro = patientFilter.toLowerCase();

  const citasEnSlot = citas.filter(cita => {
    const nombrePaciente = cita.nombrePaciente?.toLowerCase() || '';
    return cita.start < new Date(inicioSlot.getTime() + 60 * 60 * 1000) &&
           cita.end > inicioSlot &&
           nombrePaciente.includes(filtro);
  });

  return citasEnSlot.map((cita, index) => {
    const citaStartTimeMs = cita.start.getTime();
    const citaEndTimeMs = cita.end.getTime();

    const citaEnHoraAnterior = citas.find(c =>
      c.start < new Date(horaAnterior.getTime() + 60 * 60 * 1000) &&
      c.end > horaAnterior &&
      c.patientId === cita.patientId
    );

    const isConsecutive = !!citaEnHoraAnterior && citaEnHoraAnterior.patientId === cita.patientId;
    const citaFlag = isConsecutive ? 'consecutive' : 'normal';

    const diferenciaMs = citaEndTimeMs - citaStartTimeMs;
    const duracionEnMinutos = diferenciaMs / (1000 * 60);

    let costoTotal = 0;
    if (duracionEnMinutos > 60) {
      const minutosExtras = duracionEnMinutos - 60;
      const horasOFraccionesExtras = minutosExtras / 60;
      costoTotal = horasOFraccionesExtras * 40;
    }

    const slotStartMs = inicioSlot.getTime();
    const slotEndMs = slotStartMs + 60 * 60 * 1000;

    const overlapStartMs = Math.max(slotStartMs, citaStartTimeMs);
    const overlapEndMs = Math.min(slotEndMs, citaEndTimeMs);
    const overlapDurationMs = overlapEndMs - overlapStartMs;
    const slotDurationMs = slotEndMs - slotStartMs;

    let topPercentage = 0;
    let heightPercentage = 0;

    if (citaEndTimeMs > slotEndMs) {
      const firstHourEndMs = slotStartMs + 60 * 60 * 1000;
      const firstHourOverlapDurationMs = firstHourEndMs - overlapStartMs;
      topPercentage = (firstHourOverlapDurationMs / slotDurationMs) * 100;
      heightPercentage = (firstHourOverlapDurationMs / slotDurationMs) * 100;
    } else {
      const topOffsetMs = overlapStartMs - slotStartMs;
      topPercentage = (topOffsetMs / slotDurationMs) * 100;
      heightPercentage = (overlapDurationMs / slotDurationMs) * 100;
    }

    const width = index === 0 ? '100%' : '50%';

    return {
      ...cita,
      patient: cita,
      top: `${topPercentage.toFixed(2)}%`,
      height: `${heightPercentage.toFixed(2)}%`,
      flag: citaFlag,
      costo: costoTotal,
      width
    };
  });
}





  convertirHoraANumero(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

 cerrarModalNuevaReserva(): void {
  this.isModalOpen = false;
  this.selectedDateForModal = null;
  this.selectedTimeForModal = null;
  this.appointmentSelected = null;
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


   viewPatientDetails(appointmentDetail: any) {    
     console.log("appointmentDetail ", appointmentDetail);
     this.appointmentSelected = {
      appointmentEnd:appointmentDetail.end,
      appointmentStart: appointmentDetail.start,
      patient: appointmentDetail.patient,
      service: appointmentDetail.service
     }
    //this.router.navigate(['patient-details', patientId]);
   }


cancelAppointment(id: number) {
  this.appointmentService.delete(id)
  .subscribe(() => {
    this.cargarCitasDeLaSemana();
  });
}
}