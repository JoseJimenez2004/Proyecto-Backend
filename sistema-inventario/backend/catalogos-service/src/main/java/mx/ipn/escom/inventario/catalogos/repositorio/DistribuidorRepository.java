package mx.ipn.escom.inventario.catalogos.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.ipn.escom.inventario.catalogos.dominio.Distribuidor;

public interface DistribuidorRepository extends JpaRepository<Distribuidor, Integer> {
}
