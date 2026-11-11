package mx.ipn.escom.inventario.catalogos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.SistemaOperativo;

public interface SistemaOperativoRepository extends JpaRepository<SistemaOperativo, Integer> {

    boolean existsByNombreAndVersionAndArquitectura(String nombre, String version, String arquitectura);

    boolean existsByNombreAndVersionAndArquitecturaAndIdNot(String nombre, String version, String arquitectura, Integer id);
}
