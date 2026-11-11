package mx.ipn.escom.inventario.inventario.repositorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mx.ipn.escom.inventario.inventario.dominio.Computadora;

public interface ComputadoraRepository extends JpaRepository<Computadora, Integer> {

    boolean existsByNumInventario(String numInventario);

    boolean existsByNumInventarioAndIdNot(String numInventario, Integer id);

    boolean existsByNumeroSerie(String numeroSerie);

    boolean existsByNumeroSerieAndIdNot(String numeroSerie, Integer id);

    /**
     * Búsqueda con filtros opcionales. q busca en número de inventario, marca y modelo
     * (q = "" no filtra). estado e idEdificio son opcionales (null = sin filtro).
     */
    @Query("""
            select c from Computadora c
            where (:estado is null or c.estado = :estado)
              and (:idEdificio is null or c.idEdificio = :idEdificio)
              and (lower(c.numInventario) like lower(concat('%', :q, '%'))
                   or lower(c.marca) like lower(concat('%', :q, '%'))
                   or lower(c.modelo) like lower(concat('%', :q, '%')))
            """)
    Page<Computadora> buscar(@Param("estado") String estado,
                             @Param("idEdificio") Integer idEdificio,
                             @Param("q") String q,
                             Pageable pageable);
}
