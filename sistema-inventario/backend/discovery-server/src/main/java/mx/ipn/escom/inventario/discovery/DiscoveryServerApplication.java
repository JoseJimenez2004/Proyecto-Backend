package mx.ipn.escom.inventario.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Servidor de descubrimiento. Cada microservicio se registra aquí con su nombre
 * (auth-service, catalogos-service, ...) y el gateway los localiza por ese nombre.
 * Panel: http://localhost:18761
 */
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
