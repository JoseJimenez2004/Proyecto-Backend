package mx.ipn.escom.inventario.common.error;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convierte las excepciones en respuestas JSON uniformes (RFC 9457 / ProblemDetail):
 *
 * <pre>
 * { "status": 409, "title": "Regla de negocio", "detail": "Ya existe ...", "errores": {...} }
 * </pre>
 *
 * El frontend muestra "detail" o, si viene, el mapa "errores" campo por campo.
 */
@RestControllerAdvice
public class ManejadorGlobalErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorGlobalErrores.class);

    @ExceptionHandler(RecursoNoEncontradoException.class)
    ProblemDetail noEncontrado(RecursoNoEncontradoException ex) {
        return problema(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    ProblemDetail reglaNegocio(ReglaNegocioException ex) {
        return problema(HttpStatus.CONFLICT, "Regla de negocio", ex.getMessage());
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    ProblemDetail credenciales(CredencialesInvalidasException ex) {
        return problema(HttpStatus.UNAUTHORIZED, "No autenticado", ex.getMessage());
    }

    @ExceptionHandler(ServicioNoDisponibleException.class)
    ProblemDetail servicioNoDisponible(ServicioNoDisponibleException ex) {
        log.warn("Servicio dependiente no disponible: {}", ex.getMessage());
        return problema(HttpStatus.SERVICE_UNAVAILABLE, "Servicio no disponible", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail validacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        ProblemDetail pd = problema(HttpStatus.BAD_REQUEST, "Datos inválidos",
                "Revisa los campos marcados");
        pd.setProperty("errores", errores);
        return pd;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail jsonInvalido(HttpMessageNotReadableException ex) {
        return problema(HttpStatus.BAD_REQUEST, "Datos inválidos",
                "El cuerpo de la petición no es un JSON válido o tiene tipos incorrectos");
    }

    /** Llave única duplicada o registro referenciado por otra tabla (ON DELETE RESTRICT). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail integridad(DataIntegrityViolationException ex) {
        log.debug("Violación de integridad", ex);
        return problema(HttpStatus.CONFLICT, "Restricción de integridad",
                "La operación viola una restricción de la base de datos (registro duplicado o en uso)");
    }

    private static ProblemDetail problema(HttpStatus status, String titulo, String detalle) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detalle);
        pd.setTitle(titulo);
        return pd;
    }
}
