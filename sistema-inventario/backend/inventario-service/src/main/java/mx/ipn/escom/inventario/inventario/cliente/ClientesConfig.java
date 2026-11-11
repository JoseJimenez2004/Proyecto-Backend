package mx.ipn.escom.inventario.inventario.cliente;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.client.RestClient;

/**
 * Clientes HTTP hacia otros microservicios.
 *
 * - El builder @LoadBalanced resuelve "http://catalogos-service" con Eureka.
 * - Un builder normal (@Primary) queda para cualquier otro uso (p. ej. el propio cliente de Eureka).
 * - El interceptor reenvía el JWT del usuario actual, porque catalogos-service también exige token.
 */
@Configuration
public class ClientesConfig {

    @Bean
    @Primary
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    RestClient catalogosRestClient(@LoadBalanced RestClient.Builder builder,
                                   @Value("${servicios.catalogos-url}") String catalogosUrl) {
        return builder
                .baseUrl(catalogosUrl)
                .requestInterceptor(propagarToken())
                .build();
    }

    private static ClientHttpRequestInterceptor propagarToken() {
        return (request, body, execution) -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken jwtAuth) {
                request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Bearer " + jwtAuth.getToken().getTokenValue());
            }
            return execution.execute(request, body);
        };
    }
}
