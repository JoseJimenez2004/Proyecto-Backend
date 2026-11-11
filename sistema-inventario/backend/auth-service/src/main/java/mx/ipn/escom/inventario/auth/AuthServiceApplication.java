package mx.ipn.escom.inventario.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio de autenticación: guarda usuarios y roles y emite el JWT
 * que el resto de los servicios valida.
 *
 * scanBasePackages incluye "common" para cargar la seguridad y el manejo de errores compartidos.
 */
@SpringBootApplication(scanBasePackages = "mx.ipn.escom.inventario")
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
