package mx.ipn.escom.inventario.common.error;

/** El registro solicitado no existe. Se responde con 404. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
