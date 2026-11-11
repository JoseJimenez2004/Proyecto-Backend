package mx.ipn.escom.inventario.catalogos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio de catálogos de apoyo del Avance 1:
 * edificio_campus, distribuidor, categoria_software, departamento,
 * experto_soporte y sistema_operativo.
 */
@SpringBootApplication(scanBasePackages = "mx.ipn.escom.inventario")
public class CatalogosServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogosServiceApplication.class, args);
    }
}
