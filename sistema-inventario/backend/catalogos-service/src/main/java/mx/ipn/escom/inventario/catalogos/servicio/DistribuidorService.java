package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.Distribuidor;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DistribuidorRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DistribuidorResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.DistribuidorRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;

@Service
@Transactional
public class DistribuidorService {

    private final DistribuidorRepository repo;

    public DistribuidorService(DistribuidorRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<DistribuidorResponse> listar() {
        return repo.findAll(Sort.by("nombre")).stream().map(DistribuidorResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public DistribuidorResponse obtener(Integer id) {
        return DistribuidorResponse.desde(buscar(id));
    }

    public DistribuidorResponse crear(DistribuidorRequest req) {
        Distribuidor d = new Distribuidor();
        copiar(req, d);
        return DistribuidorResponse.desde(repo.save(d));
    }

    public DistribuidorResponse actualizar(Integer id, DistribuidorRequest req) {
        Distribuidor d = buscar(id);
        copiar(req, d);
        return DistribuidorResponse.desde(repo.saveAndFlush(d));
    }

    public void eliminar(Integer id) {
        repo.delete(buscar(id));
        repo.flush();
    }

    private void copiar(DistribuidorRequest req, Distribuidor d) {
        d.setNombre(req.nombre().trim());
        d.setCalle(req.calle());
        d.setCiudad(req.ciudad().trim());
        d.setEstado(req.estado().trim());
        d.setCodigoPostal(req.codigoPostal());
        d.setTelefono(req.telefono().trim());
    }

    private Distribuidor buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el distribuidor con id " + id));
    }
}
