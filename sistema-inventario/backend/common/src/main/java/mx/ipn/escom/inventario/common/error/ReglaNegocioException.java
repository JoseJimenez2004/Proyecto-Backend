package mx.ipn.escom.inventario.common.error;

/**
 * Se violó una regla del dominio (clave duplicada, registro en uso, fechas incoherentes...).
 * Se responde con 409 Conflict.
 */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
