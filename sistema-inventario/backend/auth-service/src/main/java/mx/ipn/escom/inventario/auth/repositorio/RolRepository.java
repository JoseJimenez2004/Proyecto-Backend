package mx.ipn.escom.inventario.auth.repositorio;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.auth.dominio.Rol;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByNombre(String nombre);

    List<Rol> findByNombreIn(Collection<String> nombres);
}
