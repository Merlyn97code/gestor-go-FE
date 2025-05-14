import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointment';
import { PatientData } from '../../models/patients';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true
})
export class DashboardComponent {

  // Propiedades para los datos de la pantalla
  totalConsultas: number = 0;
  consultasDia: number = 0;
  nextAppointments: number = 0;
  proximasConsultas: any[] = [];
  todayAppointments: Array<Appointment> = [];
  tomorrowAppointments: Array<Appointment> = [];
  remainingAppointments: Array<Appointment> = [];
  appointmentSelected: Array<Appointment> = [];
  title: string = 'Today';
  consultaToDelete!: Appointment | null;
  constructor(private appointmentsService: AppointmentsService, private router: Router) { }

  ngOnInit(): void {
    this.loadData();   
  }


  loadData() {
        this.appointmentsService.getTodayAppointments()
    .subscribe(todayAppointments => {      
      this.todayAppointments = todayAppointments;
      this.changeAppointmentListSelected('Hoy', todayAppointments);
    });
    this.appointmentsService.getTomorrowAppointments()
    .subscribe(tomorrowAppointments => {      
      this.tomorrowAppointments = tomorrowAppointments;    
    });
    this.appointmentsService.getRemainingAppointments()
    .subscribe(remainingAppointments => {      
      this.remainingAppointments = remainingAppointments;
    }); 
  }

  // Método que se ejecuta al hacer clic en el botón de "Ver Consultas del Día"
  verConsultasDia(): void {    
    // Aquí puedes redirigir a la vista de consultas o realizar alguna acción adicional
  }

  changeAppointmentListSelected(title: string, appointments: Array<Appointment>) {
    this.title = title;
    this.appointmentSelected = appointments;
    }

  viewPatientDetails(patientId: number | undefined) {    
    this.router.navigate(['patient-details', patientId]);
  }

  

openDeleteModal(consulta: Appointment): void {
  this.consultaToDelete = consulta;
}

cancelDelete(): void {
  this.consultaToDelete = null;
}

confirmDelete(): void {
  if (this.consultaToDelete) {
    // Aquí colocas tu lógica para eliminar la consulta (puede ser por ID)
    const id = this.consultaToDelete.appointmentId
    this.deleteConsultaById(id);
    this.consultaToDelete = null;
  }
}

deleteConsultaById(id: number | undefined): void {  
  if (id) {
    this.appointmentsService.delete(id)        
    .subscribe(() => {
     this.loadData();
    });
  }      
}

    
}
