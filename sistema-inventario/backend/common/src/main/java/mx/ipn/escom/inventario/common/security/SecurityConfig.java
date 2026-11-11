package mx.ipn.escom.inventario.common.security;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Seguridad compartida por todos los microservicios: cada uno actúa como
 * "resource server" y valida el JWT (HS256) que emite auth-service.
 *
 * - Sin sesión (STATELESS) y sin CSRF, porque el token viaja en el header Authorization.
 * - El claim "roles" (ej. ["ADMIN"]) se convierte en autoridades ROLE_ADMIN,
 *   así que en los controladores se usa @PreAuthorize("hasRole('ADMIN')").
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(SeguridadProperties.class)
public class SecurityConfig {

    public static final String CLAIM_ROLES = "roles";

    @Bean
    SecretKey jwtSecretKey(SeguridadProperties props) {
        byte[] bytes = props.jwt().secreto().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("seguridad.jwt.secreto debe tener al menos 32 caracteres");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey, SeguridadProperties props) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(props.jwt().emisor()));
        return decoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName(CLAIM_ROLES);
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return converter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            SeguridadProperties props,
                                            JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
        String[] rutasPublicas = props.rutasPublicas().toArray(String[]::new);

        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/error", "/actuator/health/**", "/actuator/info").permitAll();
                if (rutasPublicas.length > 0) {
                    auth.requestMatchers(rutasPublicas).permitAll();
                }
                auth.anyRequest().authenticated();
            })
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));

        return http.build();
    }
}
