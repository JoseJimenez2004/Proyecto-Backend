import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Agrega "Authorization: Bearer <token>" a cada petición a /api
 * y cierra la sesión si el backend responde 401 (token vencido o inválido).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esLogin = req.url.endsWith('/api/auth/login');
  const token = auth.token();

  const peticion = token && !esLogin && req.url.startsWith('/api/')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !esLogin) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
