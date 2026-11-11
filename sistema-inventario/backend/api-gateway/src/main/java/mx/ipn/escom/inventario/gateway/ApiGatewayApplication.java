package mx.ipn.escom.inventario.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Gateway: único punto de entrada para Angular (puerto 8080).
 * Enruta /api/auth/**, /api/catalogos/** y /api/inventario/** al microservicio
 * correspondiente usando el nombre registrado en Eureka (lb://nombre-servicio).
 * La validación del JWT la hace cada microservicio.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
