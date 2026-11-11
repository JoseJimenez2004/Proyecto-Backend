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
    return 'No se pudo conectar con el servidor. Verifica que el backend esté levantado.';
  }

  // El backend siempre responde JSON (ProblemDetail). Si llega HTML u otra cosa,
  // la petición no llegó al api-gateway (puerto equivocado, otro servidor, proxy caído).
  const cuerpo = (err.error && typeof err.error === 'object' ? err.error : null) as ProblemDetail | null;
  if (!cuerpo && [404, 500, 502, 503, 504].includes(err.status)) {
    return `La API no respondió (HTTP ${err.status}). Verifica que el api-gateway esté levantado en el puerto 18090 ` +
      'y que los microservicios aparezcan en Eureka (http://localhost:18761).';
  }

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
