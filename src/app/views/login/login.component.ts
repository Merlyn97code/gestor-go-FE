import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Auth } from '../../models/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true
})
export class LoginComponent {
  
  emailAuth: FormGroup;
  selectedRole: string = 'admin'; // Valor predeterminado de rol
  

  constructor(private router: Router, private loginService: LoginService,
       private formBuilder: FormBuilder 
  ) {
    this.emailAuth = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get authControls() {
    return this.emailAuth.controls as { email: FormControl<string>; password: FormControl<string> };
  }
  
  // Función para manejar el inicio de sesión
  onLogin() {
    let auth: Auth = {
      username: this.authControls.email.value,
      password: this.authControls.password.value
    };
  
    this.loginService.login(auth).subscribe( {
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);          
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
      },
      complete: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }
  

  // Función para manejar la recuperación de contraseña
  onForgotPassword() {
    alert('La recuperación de contraseña no está implementada.');
  }
}
