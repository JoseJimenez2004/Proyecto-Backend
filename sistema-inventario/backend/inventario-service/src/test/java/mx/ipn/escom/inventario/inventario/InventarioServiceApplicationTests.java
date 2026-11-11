package mx.ipn.escom.inventario.inventario;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import mx.ipn.escom.inventario.inventario.repositorio.ComputadoraRepository;

@SpringBootTest(properties = "eureka.client.enabled=false")
class InventarioServiceApplicationTests {

    @Autowired
    ComputadoraRepository computadoras;

    @Test
    void cargaEquiposDePrueba() {
        assertThat(computadoras.count()).isEqualTo(3);
        assertThat(computadoras.findAll())
                .filteredOn(c -> c.getNumInventario().equals("ESCOM-00087"))
                .singleElement()
                .satisfies(c -> assertThat(c.enGarantia()).isFalse());
    }
}
