package mx.ipn.escom.inventario.catalogos.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DistribuidorRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DistribuidorResponse;
import mx.ipn.escom.inventario.catalogos.servicio.DistribuidorService;

@RestController
@RequestMapping("/api/catalogos/distribuidores")
public class DistribuidorController {

    private final DistribuidorService servicio;

    public DistribuidorController(DistribuidorService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<DistribuidorResponse> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public DistribuidorResponse obtener(@PathVariable Integer id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public DistribuidorResponse crear(@Valid @RequestBody DistribuidorRequest req) {
        return servicio.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DistribuidorResponse actualizar(@PathVariable Integer id, @Valid @RequestBody DistribuidorRequest req) {
        return servicio.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
