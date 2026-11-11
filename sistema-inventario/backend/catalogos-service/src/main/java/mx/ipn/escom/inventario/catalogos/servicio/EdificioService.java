package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.EdificioCampus;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.EdificioRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.EdificioResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.EdificioCampusRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class EdificioService {

    private final EdificioCampusRepository repo;

    public EdificioService(EdificioCampusRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<EdificioResponse> listar() {
        return repo.findAll(Sort.by("clave")).stream().map(EdificioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public EdificioResponse obtener(Integer id) {
        return EdificioResponse.desde(buscar(id));
    }

    public EdificioResponse crear(EdificioRequest req) {
        if (repo.existsByClave(req.clave().trim())) {
            throw new ReglaNegocioException("Ya existe un espacio con la clave " + req.clave());
        }
        EdificioCampus e = new EdificioCampus();
        copiar(req, e);
        return EdificioResponse.desde(repo.save(e));
    }

    public EdificioResponse actualizar(Integer id, EdificioRequest req) {
        EdificioCampus e = buscar(id);
        if (repo.existsByClaveAndIdNot(req.clave().trim(), id)) {
            throw new ReglaNegocioException("Ya existe un espacio con la clave " + req.clave());
        }
        copiar(req, e);
        return EdificioResponse.desde(repo.saveAndFlush(e));
    }

    /**
     * Pendiente (microservicios): validar contra inventario-service que no haya computadoras
     * en este espacio antes de borrarlo, o usar solo baja lógica (activo = false).
     */
    public void eliminar(Integer id) {
        repo.delete(buscar(id));
        repo.flush();
    }

    private void copiar(EdificioRequest req, EdificioCampus e) {
        e.setClave(req.clave().trim());
        e.setNombre(req.nombre().trim());
        e.setTipoEspacio(req.tipoEspacio());
        e.setDireccion(req.direccion());
        e.setNumeroNiveles(req.numeroNiveles());
        e.setActivo(req.activo() == null || req.activo());
    }

    private EdificioCampus buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el espacio con id " + id));
    }
}
