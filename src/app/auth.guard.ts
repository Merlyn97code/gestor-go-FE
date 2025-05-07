import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('authToken');
  const router = inject(Router);

  if (token) {
    // El token existe, permite el acceso a la ruta
    return true;
  } else {
    // El token no existe, redirige al usuario a la página de login
    return router.parseUrl('/login');
  }
};
