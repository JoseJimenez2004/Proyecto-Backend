package mx.ipn.escom.inventario.catalogos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.CategoriaSoftware;

public interface CategoriaSoftwareRepository extends JpaRepository<CategoriaSoftware, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);
}
