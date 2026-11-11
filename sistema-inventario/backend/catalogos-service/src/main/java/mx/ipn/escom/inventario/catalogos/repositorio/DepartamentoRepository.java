package mx.ipn.escom.inventario.catalogos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.Departamento;

public interface DepartamentoRepository extends JpaRepository<Departamento, Integer> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);
}
