package mx.ipn.escom.inventario.inventario.servicio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;
import mx.ipn.escom.inventario.inventario.cliente.CatalogosClient;
import mx.ipn.escom.inventario.inventario.dominio.Computadora;
import mx.ipn.escom.inventario.inventario.dto.ComputadoraDtos.ComputadoraRequest;
import mx.ipn.escom.inventario.inventario.dto.ComputadoraDtos.ComputadoraResponse;
import mx.ipn.escom.inventario.inventario.repositorio.ComputadoraRepository;

@Service
@Transactional
public class ComputadoraService {

    private final ComputadoraRepository repo;
    private final CatalogosClient catalogos;

    public ComputadoraService(ComputadoraRepository repo, CatalogosClient catalogos) {
        this.repo = repo;
        this.catalogos = catalogos;
    }

    @Transactional(readOnly = true)
    public Page<ComputadoraResponse> buscar(String estado, Integer idEdificio, String q, Pageable pageable) {
        String texto = q == null ? "" : q.trim();
        String filtroEstado = (estado == null || estado.isBlank()) ? null : estado;
        return repo.buscar(filtroEstado, idEdificio, texto, pageable).map(ComputadoraResponse::desde);
    }

    @Transactional(readOnly = true)
    public ComputadoraResponse obtener(Integer id) {
        return ComputadoraResponse.desde(buscarEntidad(id));
    }

    public ComputadoraResponse crear(ComputadoraRequest req) {
        validar(req, null);
        Computadora c = new Computadora();
        copiar(req, c);
        return ComputadoraResponse.desde(repo.save(c));
    }

    public ComputadoraResponse actualizar(Integer id, ComputadoraRequest req) {
        Computadora c = buscarEntidad(id);
        validar(req, id);
        copiar(req, c);
        return ComputadoraResponse.desde(repo.saveAndFlush(c));
    }

    /**
     * En el diseño, mantenimiento e instalaciones se borran en CASCADA con la computadora;
     * cuando existan esas tablas (en este mismo servicio) se configurará igual.
     */
    public void eliminar(Integer id) {
        repo.delete(buscarEntidad(id));
        repo.flush();
    }

    private void validar(ComputadoraRequest req, Integer idActual) {
        String inventario = req.numInventario().trim();
        String serie = req.numeroSerie().trim();
        boolean inventarioDuplicado = idActual == null
                ? repo.existsByNumInventario(inventario)
                : repo.existsByNumInventarioAndIdNot(inventario, idActual);
        if (inventarioDuplicado) {
            throw new ReglaNegocioException("Ya existe un equipo con el número de inventario " + inventario);
        }
        boolean serieDuplicada = idActual == null
                ? repo.existsByNumeroSerie(serie)
                : repo.existsByNumeroSerieAndIdNot(serie, idActual);
        if (serieDuplicada) {
            throw new ReglaNegocioException("Ya existe un equipo con el número de serie " + serie);
        }
        // CHECK fecha_fin_garantia >= fecha_compra
        if (req.fechaFinGarantia() != null && req.fechaFinGarantia().isBefore(req.fechaCompra())) {
            throw new ReglaNegocioException("La fecha de fin de garantía no puede ser anterior a la fecha de compra");
        }
        // Integridad referencial entre microservicios
        catalogos.validarEdificio(req.idEdificio());
        catalogos.validarDistribuidor(req.idDistribuidor());
    }

    private void copiar(ComputadoraRequest req, Computadora c) {
        c.setNumInventario(req.numInventario().trim());
        c.setNumeroSerie(req.numeroSerie().trim());
        c.setMarca(req.marca().trim());
        c.setModelo(req.modelo().trim());
        c.setTipoEquipo(req.tipoEquipo());
        c.setProcesador(req.procesador());
        c.setMemoriaRamGb(req.memoriaRamGb());
        c.setCapacidadDiscoDuroGb(req.capacidadDiscoDuroGb());
        c.setCapacidadSegundoDiscoDuroGb(req.capacidadSegundoDiscoDuroGb());
        c.setUnidadOptica(req.unidadOptica());
        c.setFechaCompra(req.fechaCompra());
        c.setCostoAdquisicion(req.costoAdquisicion());
        c.setCostoReemplazo(req.costoReemplazo());
        c.setIntervaloActualizacionMeses(req.intervaloActualizacionMeses());
        c.setFechaFinGarantia(req.fechaFinGarantia());
        c.setEstado(req.estado());
        c.setUbicacionEspecifica(req.ubicacionEspecifica());
        c.setIdEdificio(req.idEdificio());
        c.setIdDistribuidor(req.idDistribuidor());
    }

    private Computadora buscarEntidad(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la computadora con id " + id));
    }
}
