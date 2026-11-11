package mx.ipn.escom.inventario.auth.servicio;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.auth.dominio.Rol;
import mx.ipn.escom.inventario.auth.dominio.Usuario;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioRequest;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioResponse;
import mx.ipn.escom.inventario.auth.repositorio.RolRepository;
import mx.ipn.escom.inventario.auth.repositorio.UsuarioRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarios, RolRepository roles, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarios.findAll(Sort.by("username")).stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Integer id) {
        return UsuarioResponse.desde(buscar(id));
    }

    public UsuarioResponse crear(UsuarioRequest req) {
        if (req.password() == null || req.password().isBlank()) {
            throw new ReglaNegocioException("La contraseña es obligatoria al crear un usuario");
        }
        if (usuarios.existsByUsername(req.username())) {
            throw new ReglaNegocioException("Ya existe el usuario " + req.username());
        }
        if (usuarios.existsByEmail(req.email())) {
            throw new ReglaNegocioException("Ya existe un usuario con el correo " + req.email());
        }
        Usuario u = new Usuario();
        copiar(req, u);
        return UsuarioResponse.desde(usuarios.save(u));
    }

    public UsuarioResponse actualizar(Integer id, UsuarioRequest req) {
        Usuario u = buscar(id);
        if (usuarios.existsByUsernameAndIdNot(req.username(), id)) {
            throw new ReglaNegocioException("Ya existe el usuario " + req.username());
        }
        if (usuarios.existsByEmailAndIdNot(req.email(), id)) {
            throw new ReglaNegocioException("Ya existe un usuario con el correo " + req.email());
        }
        copiar(req, u);
        return UsuarioResponse.desde(usuarios.saveAndFlush(u));
    }

    private void copiar(UsuarioRequest req, Usuario u) {
        u.setUsername(req.username().trim());
        u.setNombreCompleto(req.nombreCompleto().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setIdExperto(req.idExperto());
        u.setActivo(req.activo() == null || req.activo());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        List<Rol> encontrados = roles.findByNombreIn(req.roles());
        if (encontrados.size() != req.roles().size()) {
            throw new ReglaNegocioException("Rol inválido. Valores permitidos: ADMIN, SOPORTE, CONSULTA");
        }
        u.setRoles(new HashSet<>(Set.copyOf(encontrados)));
    }

    private Usuario buscar(Integer id) {
        return usuarios.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + id));
    }
}
