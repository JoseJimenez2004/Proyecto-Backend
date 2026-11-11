package mx.ipn.escom.inventario.auth.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioRequest;
import mx.ipn.escom.inventario.auth.dto.AuthDtos.UsuarioResponse;
import mx.ipn.escom.inventario.auth.servicio.UsuarioService;

/** Administración de usuarios: solo ADMIN. Para dar de baja se usa activo=false. */
@RestController
@RequestMapping("/api/auth/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Integer id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest req) {
        return servicio.crear(req);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioRequest req) {
        return servicio.actualizar(id, req);
    }
}
