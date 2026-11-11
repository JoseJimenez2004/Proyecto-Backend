package mx.ipn.escom.inventario.inventario.web;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mx.ipn.escom.inventario.inventario.dto.ComputadoraDtos.ComputadoraRequest;
import mx.ipn.escom.inventario.inventario.dto.ComputadoraDtos.ComputadoraResponse;
import mx.ipn.escom.inventario.inventario.servicio.ComputadoraService;

/**
 * GET: cualquier usuario autenticado.
 * POST/PUT: ADMIN o SOPORTE. DELETE: solo ADMIN.
 *
 * Ejemplo: GET /api/inventario/computadoras?q=dell&estado=Activo&idEdificio=1&page=0&size=10
 */
@RestController
@RequestMapping("/api/inventario/computadoras")
public class ComputadoraController {

    private final ComputadoraService servicio;

    public ComputadoraController(ComputadoraService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public Page<ComputadoraResponse> buscar(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) String estado,
                                            @RequestParam(required = false) Integer idEdificio,
                                            @PageableDefault(size = 20, sort = "numInventario") Pageable pageable) {
        return servicio.buscar(estado, idEdificio, q, pageable);
    }

    @GetMapping("/{id}")
    public ComputadoraResponse obtener(@PathVariable Integer id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SOPORTE')")
    public ComputadoraResponse crear(@Valid @RequestBody ComputadoraRequest req) {
        return servicio.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SOPORTE')")
    public ComputadoraResponse actualizar(@PathVariable Integer id, @Valid @RequestBody ComputadoraRequest req) {
        return servicio.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Integer id) {
        servicio.eliminar(id);
    }
}
