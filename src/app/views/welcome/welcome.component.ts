import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [MatCardModule, MatButtonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  standalone: true
})
export class WelcomeComponent {

  userName: string = 'Usuario'; // Nombre del usuario, puedes pasarle este valor desde el servicio o el estado del registro.

  constructor() { }

  ngOnInit(): void {
    // Puedes obtener el nombre del usuario registrado desde un servicio, por ejemplo:
    // this.userName = this.authService.getUserName();
  }

}
