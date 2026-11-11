package mx.ipn.escom.inventario.common.error;

/** Otro microservicio del que dependemos no respondió. Se responde con 503. */
public class ServicioNoDisponibleException extends RuntimeException {

    public ServicioNoDisponibleException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
