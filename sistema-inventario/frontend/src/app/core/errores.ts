import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetail {
  detail?: string;
  title?: string;
  errores?: Record<string, string>;
}

/** Convierte un error HTTP (ProblemDetail del backend) en un mensaje legible. */
export function mensajeError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado';
  }
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. ¿Están levantados el api-gateway y los microservicios?';
  }
  const cuerpo = (typeof err.error === 'object' ? err.error : null) as ProblemDetail | null;
  if (cuerpo?.errores) {
    return Object.entries(cuerpo.errores)
      .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
      .join(' · ');
  }
  if (cuerpo?.detail) {
    return cuerpo.detail;
  }
  switch (err.status) {
    case 401: return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 503: return 'Un servicio no está disponible en este momento.';
    default: return `Error ${err.status}`;
  }
}
