import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { Rol } from './models';

/** Solo deja pasar si hay sesión vigente. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado() ? true : inject(Router).createUrlTree(['/login']);
};

/**
 * Solo deja pasar si el usuario tiene alguno de los roles.
 * Ojo: es solo para la interfaz; la seguridad real la aplica el backend con @PreAuthorize.
 */
export function rolGuard(...roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    return auth.tieneRol(...roles) ? true : inject(Router).createUrlTree(['/']);
  };
}
