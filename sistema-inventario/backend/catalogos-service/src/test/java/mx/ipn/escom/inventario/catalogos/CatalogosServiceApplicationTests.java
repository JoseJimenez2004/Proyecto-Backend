package mx.ipn.escom.inventario.catalogos;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import mx.ipn.escom.inventario.catalogos.repositorio.EdificioCampusRepository;
import mx.ipn.escom.inventario.catalogos.repositorio.ExpertoSoporteRepository;

/** Arranca el contexto y comprueba que data.sql cargó los datos del Avance 1. */
@SpringBootTest(properties = "eureka.client.enabled=false")
class CatalogosServiceApplicationTests {

    @Autowired
    EdificioCampusRepository edificios;

    @Autowired
    ExpertoSoporteRepository expertos;

    @Test
    void cargaDatosDePrueba() {
        assertThat(edificios.count()).isEqualTo(3);
        assertThat(expertos.count()).isEqualTo(3);
    }
}
