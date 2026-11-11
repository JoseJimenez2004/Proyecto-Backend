package mx.ipn.escom.inventario.auth.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.LoginRequest;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.LoginResponse;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioResponse;
import mx.ipn.escom.inventario.auth.servicio.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Público (ver seguridad.rutas-publicas). Devuelve el JWT. */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    /** Datos del usuario dueño del token. */
    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.perfil(jwt.getSubject());
    }
}
