package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.CategoriaSoftware;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.CategoriaRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.CategoriaResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.CategoriaSoftwareRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaSoftwareRepository repo;

    public CategoriaService(CategoriaSoftwareRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return repo.findAll(Sort.by("nombre")).stream().map(CategoriaResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Integer id) {
        return CategoriaResponse.desde(buscar(id));
    }

    public CategoriaResponse crear(CategoriaRequest req) {
        if (repo.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw new ReglaNegocioException("Ya existe la categoría " + req.nombre());
        }
        CategoriaSoftware c = new CategoriaSoftware();
        copiar(req, c);
        return CategoriaResponse.desde(repo.save(c));
    }

    public CategoriaResponse actualizar(Integer id, CategoriaRequest req) {
        CategoriaSoftware c = buscar(id);
        if (repo.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw new ReglaNegocioException("Ya existe la categoría " + req.nombre());
        }
        copiar(req, c);
        return CategoriaResponse.desde(repo.saveAndFlush(c));
    }

    public void eliminar(Integer id) {
        repo.delete(buscar(id));
        repo.flush();
    }

    private void copiar(CategoriaRequest req, CategoriaSoftware c) {
        c.setNombre(req.nombre().trim());
        c.setDescripcion(req.descripcion());
    }

    private CategoriaSoftware buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la categoría con id " + id));
    }
}
