package mx.ipn.escom.inventario.inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

/**
 * Microservicio de inventario: computadora (y más adelante software, instalaciones,
 * mantenimiento y reportes).
 *
 * VIA_DTO serializa las páginas como { content: [...], page: { size, number, totalElements, totalPages } }.
 */
@SpringBootApplication(scanBasePackages = "mx.ipn.escom.inventario")
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class InventarioServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventarioServiceApplication.class, args);
    }
}
