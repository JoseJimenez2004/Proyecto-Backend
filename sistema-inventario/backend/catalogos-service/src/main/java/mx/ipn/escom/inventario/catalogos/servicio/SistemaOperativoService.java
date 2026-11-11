package mx.ipn.escom.inventario.catalogos.servicio;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.ipn.escom.inventario.catalogos.dominio.SistemaOperativo;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.SistemaOperativoRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.SistemaOperativoResponse;
import mx.ipn.escom.inventario.catalogos.repositorio.SistemaOperativoRepository;
import mx.ipn.escom.inventario.common.error.RecursoNoEncontradoException;
import mx.ipn.escom.inventario.common.error.ReglaNegocioException;

@Service
@Transactional
public class SistemaOperativoService {

    private final SistemaOperativoRepository repo;

    public SistemaOperativoService(SistemaOperativoRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<SistemaOperativoResponse> listar() {
        return repo.findAll(Sort.by("nombre", "version")).stream().map(SistemaOperativoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public SistemaOperativoResponse obtener(Integer id) {
        return SistemaOperativoResponse.desde(buscar(id));
    }

    public SistemaOperativoResponse crear(SistemaOperativoRequest req) {
        if (repo.existsByNombreAndVersionAndArquitectura(req.nombre().trim(), req.version().trim(), req.arquitectura())) {
            throw new ReglaNegocioException("Ya existe ese sistema operativo con la misma versión y arquitectura");
        }
        SistemaOperativo s = new SistemaOperativo();
        copiar(req, s);
        return SistemaOperativoResponse.desde(repo.save(s));
    }

    public SistemaOperativoResponse actualizar(Integer id, SistemaOperativoRequest req) {
        SistemaOperativo s = buscar(id);
        if (repo.existsByNombreAndVersionAndArquitecturaAndIdNot(req.nombre().trim(), req.version().trim(),
                req.arquitectura(), id)) {
            throw new ReglaNegocioException("Ya existe ese sistema operativo con la misma versión y arquitectura");
        }
        copiar(req, s);
        return SistemaOperativoResponse.desde(repo.saveAndFlush(s));
    }

    public void eliminar(Integer id) {
        repo.delete(buscar(id));
        repo.flush();
    }

    private void copiar(SistemaOperativoRequest req, SistemaOperativo s) {
        s.setNombre(req.nombre().trim());
        s.setVersion(req.version().trim());
        s.setArquitectura(req.arquitectura());
        s.setFabricante(req.fabricante().trim());
        s.setFechaFinSoporte(req.fechaFinSoporte());
    }

    private SistemaOperativo buscar(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el sistema operativo con id " + id));
    }
}
