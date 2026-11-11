package mx.ipn.escom.inventario.catalogos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.EdificioCampus;

public interface EdificioCampusRepository extends JpaRepository<EdificioCampus, Integer> {

    boolean existsByClave(String clave);

    boolean existsByClaveAndIdNot(String clave, Integer id);
}
