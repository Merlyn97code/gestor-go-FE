import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('authToken');
  const router = inject(Router);

  if (token) {
    // Si ya hay token, redirigir al dashboard
    return router.parseUrl('/dashboard');
  } else {
    // Si no hay token, permitir acceso al login
    return true;
  }
};
