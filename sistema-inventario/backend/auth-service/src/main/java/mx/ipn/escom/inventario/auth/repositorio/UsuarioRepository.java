package mx.ipn.escom.inventario.auth.repositorio;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.auth.dominio.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Integer id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);
}
