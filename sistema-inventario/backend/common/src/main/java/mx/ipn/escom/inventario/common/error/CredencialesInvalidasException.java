package mx.ipn.escom.inventario.common.error;

/** Usuario o contraseña incorrectos, o usuario inactivo. Se responde con 401. */
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException() {
        super("Usuario o contraseña incorrectos");
    }
}
