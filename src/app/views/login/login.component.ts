import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  selectedRole: string = 'admin'; // Valor predeterminado de rol

  constructor(private router: Router) {}

  // Función para manejar el inicio de sesión
  onLogin() {
    // Aquí es donde integras la lógica de autenticación (API, servicio, etc.)
    // Comprobamos si las credenciales son correctas según el rol
    if (this.email === 'admin@ejemplo.com' && this.password === 'admin123' && this.selectedRole === 'admin') {
      this.router.navigate(['/dashboard']); // Redirigir al Dashboard del administrador
    } else if (this.email === 'doctor@ejemplo.com' && this.password === 'doctor123' && this.selectedRole === 'doctor') {
      this.router.navigate(['/doctor-dashboard']); // Redirigir al Dashboard del médico
    } else if (this.email === 'staff@ejemplo.com' && this.password === 'staff123' && this.selectedRole === 'health-staff') {
      this.router.navigate(['/health-staff-dashboard']); // Redirigir al Dashboard del personal de salud
    } else {
      alert('Credenciales incorrectas. Por favor, verifica tu correo, contraseña y rol.');
    }
  }

  // Función para manejar la recuperación de contraseña
  onForgotPassword() {
    alert('La recuperación de contraseña no está implementada.');
  }
}
