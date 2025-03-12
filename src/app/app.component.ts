import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuHamburgerComponent } from './views/menu-hamburger/menu-hamburger.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuHamburgerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gestor_go';
}
