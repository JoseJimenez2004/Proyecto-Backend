package mx.ipn.escom.inventario.auth.dto;

import java.time.Instant;
import java.util.Set;
import java.util.TreeSet;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import mx.ipn.escom.inventario.auth.dominio.Rol;
import mx.ipn.escom.inventario.auth.dominio.Usuario;

/** DTOs del microservicio de autenticación (agrupados por ser pequeños). */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "El usuario es obligatorio") String username,
            @NotBlank(message = "La contraseña es obligatoria") String password) {
    }

    public record LoginResponse(String token, String tipo, Instant expiraEn, UsuarioResponse usuario) {
    }

    /**
     * Alta y edición de usuarios. En la edición, password puede venir vacío
     * para conservar la contraseña actual.
     */
    public record UsuarioRequest(
            @NotBlank(message = "El usuario es obligatorio") @Size(max = 50) String username,
            @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres") String password,
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 120) String nombreCompleto,
            @NotBlank(message = "El correo es obligatorio") @Email(message = "Correo inválido") @Size(max = 100) String email,
            Integer idExperto,
            @NotEmpty(message = "Asigna al menos un rol") Set<String> roles,
            Boolean activo) {
    }

    public record UsuarioResponse(Integer id, String username, String nombreCompleto, String email,
                                  boolean activo, Integer idExperto, Set<String> roles) {

        public static UsuarioResponse desde(Usuario u) {
            Set<String> roles = new TreeSet<>();
            for (Rol r : u.getRoles()) {
                roles.add(r.getNombre());
            }
            return new UsuarioResponse(u.getId(), u.getUsername(), u.getNombreCompleto(), u.getEmail(),
                    Boolean.TRUE.equals(u.getActivo()), u.getIdExperto(), roles);
        }
    }
}
