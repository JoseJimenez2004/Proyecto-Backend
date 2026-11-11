package mx.ipn.escom.inventario.auth.servicio;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import mx.ipn.escom.inventario.auth.dominio.Rol;
import mx.ipn.escom.inventario.auth.dominio.Usuario;
import mx.ipn.escom.inventario.common.security.SecurityConfig;
import mx.ipn.escom.inventario.common.security.SeguridadProperties;

/**
 * Firma el JWT con HS256 usando la misma llave que los demás servicios usan para validarlo
 * (bean SecretKey de {@link SecurityConfig}).
 */
@Service
public class TokenService {

    public record TokenGenerado(String valor, Instant expiraEn) {
    }

    private final JwtEncoder encoder;
    private final SeguridadProperties props;

    public TokenService(SecretKey jwtSecretKey, SeguridadProperties props) {
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
        this.props = props;
    }

    public TokenGenerado generar(Usuario usuario) {
        Instant ahora = Instant.now();
        Instant expira = ahora.plus(props.jwt().expiracionMinutos(), ChronoUnit.MINUTES);
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).sorted().toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.jwt().emisor())
                .issuedAt(ahora)
                .expiresAt(expira)
                .subject(usuario.getUsername())
                .claim("uid", usuario.getId())
                .claim("nombre", usuario.getNombreCompleto())
                .claim(SecurityConfig.CLAIM_ROLES, roles)
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenGenerado(token, expira);
    }
}
