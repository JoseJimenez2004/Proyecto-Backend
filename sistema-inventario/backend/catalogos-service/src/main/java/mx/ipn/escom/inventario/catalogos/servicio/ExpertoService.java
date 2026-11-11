package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.Departamento;
import mx.ipn.escom.inventario.catalogos.dominio.ExpertoSoporte;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.ExpertoRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.ExpertoResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.DepartamentoRepository;
import mx.ipn.escom.inventario.catalogos.repositorio.ExpertoSoporteRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class ExpertoService {

    private final ExpertoSoporteRepository repo;
    private final DepartamentoRepository departamentos;

    public ExpertoService(ExpertoSoporteRepository repo, DepartamentoRepository departamentos) {
        this.repo = repo;
        this.departamentos = departamentos;
    }

    @Transactional(readOnly = true)
    public List<ExpertoResponse> listar() {
        return repo.findAllByOrderByApellidoPaternoAscPrimerNombreAsc().stream().map(ExpertoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ExpertoResponse obtener(Integer id) {
        return ExpertoResponse.desde(buscar(id));
    }

    public ExpertoResponse crear(ExpertoRequest req) {
        if (repo.existsByNumEmpleado(req.numEmpleado().trim())) {
            throw new ReglaNegocioException("Ya existe el número de empleado " + req.numEmpleado());
        }
        if (repo.existsByDireccionEmailIgnoreCase(req.direccionEmail().trim())) {
            throw new ReglaNegocioException("Ya existe un experto con el correo " + req.direccionEmail());
        }
        ExpertoSoporte e = new ExpertoSoporte();
        copiar(req, e);
        return ExpertoResponse.desde(repo.save(e));
    }

    public ExpertoResponse actualizar(Integer id, ExpertoRequest req) {
        ExpertoSoporte e = buscar(id);
        if (repo.existsByNumEmpleadoAndIdNot(req.numEmpleado().trim(), id)) {
            throw new ReglaNegocioException("Ya existe el número de empleado " + req.numEmpleado());
        }
        if (repo.existsByDireccionEmailIgnoreCaseAndIdNot(req.direccionEmail().trim(), id)) {
            throw new ReglaNegocioException("Ya existe un experto con el correo " + req.direccionEmail());
        }
        copiar(req, e);
        return ExpertoResponse.desde(repo.saveAndFlush(e));
    }

    /**
     * Pendiente (microservicios): software y mantenimiento referencian al experto desde
     * inventario-service; habrá que validar ahí antes de permitir el borrado.
     */
    public void eliminar(Integer id) {
        repo.delete(buscar(id));
        repo.flush();
    }

    private void copiar(ExpertoRequest req, ExpertoSoporte e) {
        Departamento d = departamentos.findById(req.idDepartamento())
                .orElseThrow(() -> new ReglaNegocioException("No existe el departamento con id " + req.idDepartamento()));
        e.setNumEmpleado(req.numEmpleado().trim());
        e.setPrimerNombre(req.primerNombre().trim());
        e.setApellidoPaterno(req.apellidoPaterno().trim());
        e.setTelefonoOficina(req.telefonoOficina());
        e.setDireccionEmail(req.direccionEmail().trim().toLowerCase());
        e.setDepartamento(d);
    }

    private ExpertoSoporte buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el experto con id " + id));
    }
}
