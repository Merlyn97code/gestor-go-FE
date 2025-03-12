import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
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

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes inicializar los datos al cargar el componente.
    this.loadDashboardData();
  }

  // Método que simula la carga de datos desde un servicio o API.
  loadDashboardData(): void {
    // Datos de ejemplo. Esto debería ser reemplazado con llamadas a un servicio real.
    this.totalConsultas = 120;
    this.consultasDia = 5;
    this.nextAppointments = 115;
    this.proximasConsultas = [
      { paciente: 'Juan Pérez', fecha: '2025-03-08 10:00 AM' },
      { paciente: 'María Gómez', fecha: '2025-03-08 10:30 AM' },
      { paciente: 'Carlos Ruiz', fecha: '2025-03-08 11:00 AM' }
    ];
  }

  // Método que se ejecuta al hacer clic en el botón de "Ver Consultas del Día"
  verConsultasDia(): void {
    console.log('Ver consultas del día');
    // Aquí puedes redirigir a la vista de consultas o realizar alguna acción adicional
  }
}
