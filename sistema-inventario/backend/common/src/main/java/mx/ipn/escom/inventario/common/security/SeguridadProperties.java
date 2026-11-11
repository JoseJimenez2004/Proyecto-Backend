package mx.ipn.escom.inventario.common.security;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades "seguridad.*" de cada microservicio.
 *
 * <pre>
 * seguridad:
 *   jwt:
 *     secreto: ...            # mínimo 32 caracteres, el MISMO en todos los servicios
 *     emisor: inventario-escom
 *     expiracion-minutos: 480
 *   rutas-publicas:
 *     - /api/auth/login
 * </pre>
 */
@ConfigurationProperties(prefix = "seguridad")
public record SeguridadProperties(Jwt jwt, List<String> rutasPublicas) {

    public SeguridadProperties {
        if (jwt == null) {
            throw new IllegalStateException("Falta la configuración seguridad.jwt");
        }
        rutasPublicas = rutasPublicas == null ? List.of() : List.copyOf(rutasPublicas);
    }

    public record Jwt(String secreto, String emisor, long expiracionMinutos) {
    }
}
