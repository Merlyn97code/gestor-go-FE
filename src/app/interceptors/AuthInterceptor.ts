import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Si la URL es de autenticación, no modificar la solicitud
  if (req.url.includes('/auth')) {
    return next(req);
  }

  const token = localStorage.getItem('authToken');

  if (token) {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next(clonedReq).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('Token inválido o expirado. Redirigiendo al login.');
          localStorage.removeItem('authToken'); // Elimina el token inválido
          router.navigate(['/login']); // Redirige al usuario al login
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};