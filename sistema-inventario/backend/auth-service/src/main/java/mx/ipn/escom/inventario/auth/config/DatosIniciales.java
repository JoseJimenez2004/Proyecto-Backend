package mx.ipn.escom.inventario.auth.config;

import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.auth.dominio.Rol;
import mx.ipn.escom.inventario.auth.dominio.Roles;
import mx.ipn.escom.inventario.auth.dominio.Usuario;
import mx.ipn.escom.inventario.auth.repositorio.RolRepository;
import mx.ipn.escom.inventario.auth.repositorio.UsuarioRepository;

/**
 * Carga roles y usuarios de prueba al arrancar, si no existen.
 * Las contraseñas se guardan con BCrypt; por eso no se insertan con data.sql.
 */
@Component
public class DatosIniciales implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatosIniciales.class);

    private final RolRepository roles;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public DatosIniciales(RolRepository roles, UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.roles = roles;
        this.usuarios = usuarios;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Rol admin = rol(Roles.ADMIN, "Administra catálogos, usuarios e inventario");
        Rol soporte = rol(Roles.SOPORTE, "Registra equipos, instalaciones y mantenimientos");
        Rol consulta = rol(Roles.CONSULTA, "Solo lectura y reportes");

        usuario("admin", "Admin123!", "Administrador del sistema", "admin@escom.ipn.mx", null, Set.of(admin));
        // Enlazado con el experto EMP-0001 (Ricardo Alvarez) de catalogos-service
        usuario("soporte", "Soporte123!", "Ricardo Alvarez", "ricardo.alvarez@escom.ipn.mx", 1, Set.of(soporte));
        usuario("consulta", "Consulta123!", "Usuario de consulta", "consulta@escom.ipn.mx", null, Set.of(consulta));
    }

    private Rol rol(String nombre, String descripcion) {
        return roles.findByNombre(nombre).orElseGet(() -> roles.save(new Rol(nombre, descripcion)));
    }

    private void usuario(String username, String password, String nombre, String email,
                         Integer idExperto, Set<Rol> rolesUsuario) {
        if (usuarios.existsByUsername(username)) {
            return;
        }
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(password));
        u.setNombreCompleto(nombre);
        u.setEmail(email);
        u.setIdExperto(idExperto);
        u.setActivo(true);
        u.getRoles().addAll(rolesUsuario);
        usuarios.save(u);
        log.info("Usuario de prueba creado: {}", username);
    }
}
