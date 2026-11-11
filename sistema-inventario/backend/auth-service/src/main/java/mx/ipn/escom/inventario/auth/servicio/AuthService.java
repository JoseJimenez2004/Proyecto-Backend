package mx.ipn.escom.inventario.auth.servicio;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.auth.dominio.Usuario;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.LoginRequest;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.LoginResponse;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioResponse;
import mx.ipn.escom.inventario.auth.repositorio.UsuarioRepository;
import mx.ipn.escom.inventario.common.error.CredencialesInvalidasException;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarios.findByUsername(req.username().trim())
                .orElseThrow(CredencialesInvalidasException::new);

        // Mismo mensaje para "no existe", "contraseña incorrecta" e "inactivo": no se revela cuál falló.
        if (!Boolean.TRUE.equals(usuario.getActivo())
                || !passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            throw new CredencialesInvalidasException();
        }

        TokenService.TokenGenerado token = tokenService.generar(usuario);
        return new LoginResponse(token.valor(), "Bearer", token.expiraEn(), UsuarioResponse.desde(usuario));
    }

    public UsuarioResponse perfil(String username) {
        return usuarios.findByUsername(username)
                .map(UsuarioResponse::desde)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
