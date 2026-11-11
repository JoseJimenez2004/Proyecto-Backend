package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.Departamento;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DepartamentoRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DepartamentoResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.DepartamentoRepository;
import mx.ipn.escom.inventario.catalogos.repositorio.ExpertoSoporteRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class DepartamentoService {

    private final DepartamentoRepository repo;
    private final ExpertoSoporteRepository expertos;

    public DepartamentoService(DepartamentoRepository repo, ExpertoSoporteRepository expertos) {
        this.repo = repo;
        this.expertos = expertos;
    }

    @Transactional(readOnly = true)
    public List<DepartamentoResponse> listar() {
        return repo.findAll(Sort.by("nombre")).stream().map(DepartamentoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public DepartamentoResponse obtener(Integer id) {
        return DepartamentoResponse.desde(buscar(id));
    }

    public DepartamentoResponse crear(DepartamentoRequest req) {
        if (repo.existsByNombreIgnoreCase(req.nombre().trim())) {
            throw new ReglaNegocioException("Ya existe el departamento " + req.nombre());
        }
        Departamento d = new Departamento();
        d.setNombre(req.nombre().trim());
        return DepartamentoResponse.desde(repo.save(d));
    }

    public DepartamentoResponse actualizar(Integer id, DepartamentoRequest req) {
        Departamento d = buscar(id);
        if (repo.existsByNombreIgnoreCaseAndIdNot(req.nombre().trim(), id)) {
            throw new ReglaNegocioException("Ya existe el departamento " + req.nombre());
        }
        d.setNombre(req.nombre().trim());
        return DepartamentoResponse.desde(repo.saveAndFlush(d));
    }

    /** ON DELETE RESTRICT del diseño: no se borra si tiene expertos asignados. */
    public void eliminar(Integer id) {
        Departamento d = buscar(id);
        if (expertos.existsByDepartamentoId(id)) {
            throw new ReglaNegocioException("No se puede eliminar el departamento: tiene expertos asignados");
        }
        repo.delete(d);
        repo.flush();
    }

    private Departamento buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el departamento con id " + id));
    }
}
