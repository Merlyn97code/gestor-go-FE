import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Verifica si la URL contiene '/auth' (o la ruta de login que estés usando)
    if (req.url.includes('/auth')) {
      // Si es una solicitud de login, no se agrega el token y se pasa tal cual
      return next.handle(req);
    }

    // Si no es una solicitud de login, agrega el token de autenticación
    const token = localStorage.getItem('authToken');
    
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    // Si no hay token, solo pasa la solicitud sin modificarla
    return next.handle(req);
  }
}
