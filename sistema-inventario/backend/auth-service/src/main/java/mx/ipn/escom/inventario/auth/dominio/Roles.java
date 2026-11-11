package mx.ipn.escom.inventario.auth.dominio;

import java.util.Set;

/** Nombres de los roles. En los controladores se usan como hasRole('ADMIN'), etc. */
public final class Roles {

    /** Administra catálogos, usuarios y todo el inventario. */
    public static final String ADMIN = "ADMIN";
    /** Personal de soporte: registra equipos, instalaciones y mantenimientos. */
    public static final String SOPORTE = "SOPORTE";
    /** Solo lectura y reportes. */
    public static final String CONSULTA = "CONSULTA";

    public static final Set<String> TODOS = Set.of(ADMIN, SOPORTE, CONSULTA);

    private Roles() {
    }
}
