package mx.ipn.escom.inventario.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/** Verifica que el contexto arranca (sin registrarse en Eureka). */
@SpringBootTest(properties = "eureka.client.enabled=false")
class AuthServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
