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
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DepartamentoRequest;
import mx.ipn.escom.inventario.catalogos.dto.CatalogoDtos.DepartamentoResponse;
import mx.ipn.escom.inventario.catalogos.servicio.DepartamentoService;

@RestController
@RequestMapping("/api/catalogos/departamentos")
public class DepartamentoController {

    private final DepartamentoService servicio;

    public DepartamentoController(DepartamentoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<DepartamentoResponse> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public DepartamentoResponse obtener(@PathVariable Integer id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public DepartamentoResponse crear(@Valid @RequestBody DepartamentoRequest req) {
        return servicio.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DepartamentoResponse actualizar(@PathVariable Integer id, @Valid @RequestBody DepartamentoRequest req) {
        return servicio.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
