import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-hamburger',
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-hamburger.component.html',
  styleUrl: './menu-hamburger.component.scss',
  standalone: true
})
export class MenuHamburgerComponent {
  isMenuOpen = false;

  constructor(private router: Router){}
  // Función para abrir y cerrar el menú
  toggleMenu(event: MouseEvent) {
    // Evitar que el clic en el icono de hamburguesa cierre el menú
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Función que se llama cuando se hace clic en el menú
  menuClicked(event: MouseEvent) {
    event.stopPropagation(); // Evitar que el clic dentro del menú cierre el menú
  }

  // Función para cerrar el menú
  closeMenu() {
    this.isMenuOpen = false;
  }

  // Cerrar el menú si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: MouseEvent) {
    const menu = document.querySelector('.menu');
    // Verifica si el clic fue fuera del menú
    if (menu && !menu.contains(event.target as Node)) {
      this.isMenuOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

}
