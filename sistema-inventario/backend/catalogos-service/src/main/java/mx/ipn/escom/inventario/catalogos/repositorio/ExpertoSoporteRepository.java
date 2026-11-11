package mx.ipn.escom.inventario.catalogos.repositorio;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.ExpertoSoporte;

public interface ExpertoSoporteRepository extends JpaRepository<ExpertoSoporte, Integer> {

    /** Trae el departamento en la misma consulta (evita el problema N+1). */
    @EntityGraph(attributePaths = "departamento")
    List<ExpertoSoporte> findAllByOrderByApellidoPaternoAscPrimerNombreAsc();

    boolean existsByDepartamentoId(Integer idDepartamento);

    boolean existsByNumEmpleado(String numEmpleado);

    boolean existsByNumEmpleadoAndIdNot(String numEmpleado, Integer id);

    boolean existsByDireccionEmailIgnoreCase(String email);

    boolean existsByDireccionEmailIgnoreCaseAndIdNot(String email, Integer id);
}
