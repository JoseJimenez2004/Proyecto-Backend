package mx.ipn.escom.inventario.catalogos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import mx.ipn.escom.inventario.catalogos.dominio.CategoriaSoftware;
import mx.ipn.escom.inventario.catalogos.dominio.Departamento;
import mx.ipn.escom.inventario.catalogos.dominio.Distribuidor;
import mx.ipn.escom.inventario.catalogos.dominio.EdificioCampus;
import mx.ipn.escom.inventario.catalogos.dominio.ExpertoSoporte;
import mx.ipn.escom.inventario.catalogos.dominio.SistemaOperativo;

/**
 * DTOs de entrada (Request, con las validaciones que replican los CHECK del Avance 1)
 * y de salida (Response) de los seis catálogos. Las entidades nunca se exponen directamente.
 */
public final class CatalogoDtos {

    private CatalogoDtos() {
    }

    // ---------------------------------------------------------------- edificio_campus
    public record EdificioRequest(
            @NotBlank(message = "La clave es obligatoria") @Size(max = 10) String clave,
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 80) String nombre,
            @NotBlank(message = "El tipo de espacio es obligatorio")
            @Pattern(regexp = "Laboratorio|Cubiculo|Aula|Oficina|Almacen",
                    message = "Valores permitidos: Laboratorio, Cubiculo, Aula, Oficina, Almacen")
            String tipoEspacio,
            @Size(max = 150) String direccion,
            @Positive(message = "El número de niveles debe ser mayor a 0") Short numeroNiveles,
            Boolean activo) {
    }

    public record EdificioResponse(Integer id, String clave, String nombre, String tipoEspacio,
                                   String direccion, Short numeroNiveles, boolean activo) {
        public static EdificioResponse desde(EdificioCampus e) {
            return new EdificioResponse(e.getId(), e.getClave(), e.getNombre(), e.getTipoEspacio(),
                    e.getDireccion(), e.getNumeroNiveles(), Boolean.TRUE.equals(e.getActivo()));
        }
    }

    // ---------------------------------------------------------------- distribuidor
    /** monto_total_compra y numero_total_pedidos NO se reciben: los mantiene el sistema. */
    public record DistribuidorRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 120) String nombre,
            @Size(max = 100) String calle,
            @NotBlank(message = "La ciudad es obligatoria") @Size(max = 60) String ciudad,
            @NotBlank(message = "El estado es obligatorio") @Size(max = 60) String estado,
            @Size(max = 10) String codigoPostal,
            @NotBlank(message = "El teléfono es obligatorio") @Size(max = 15) String telefono) {
    }

    public record DistribuidorResponse(Integer id, String nombre, String calle, String ciudad, String estado,
                                       String codigoPostal, String telefono, LocalDate fechaUltimoPedido,
                                       BigDecimal montoTotalCompra, Integer numeroTotalPedidos) {
        public static DistribuidorResponse desde(Distribuidor d) {
            return new DistribuidorResponse(d.getId(), d.getNombre(), d.getCalle(), d.getCiudad(), d.getEstado(),
                    d.getCodigoPostal(), d.getTelefono(), d.getFechaUltimoPedido(),
                    d.getMontoTotalCompra(), d.getNumeroTotalPedidos());
        }
    }

    // ---------------------------------------------------------------- categoria_software
    public record CategoriaRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 60) String nombre,
            @Size(max = 200) String descripcion) {
    }

    public record CategoriaResponse(Integer id, String nombre, String descripcion) {
        public static CategoriaResponse desde(CategoriaSoftware c) {
            return new CategoriaResponse(c.getId(), c.getNombre(), c.getDescripcion());
        }
    }

    // ---------------------------------------------------------------- departamento
    public record DepartamentoRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 80) String nombre) {
    }

    public record DepartamentoResponse(Integer id, String nombre) {
        public static DepartamentoResponse desde(Departamento d) {
            return new DepartamentoResponse(d.getId(), d.getNombre());
        }
    }

    // ---------------------------------------------------------------- experto_soporte
    public record ExpertoRequest(
            @NotBlank(message = "El número de empleado es obligatorio") @Size(max = 15) String numEmpleado,
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 60) String primerNombre,
            @NotBlank(message = "El apellido es obligatorio") @Size(max = 60) String apellidoPaterno,
            @Size(max = 15) String telefonoOficina,
            @NotBlank(message = "El correo es obligatorio") @Email(message = "Correo inválido") @Size(max = 100)
            String direccionEmail,
            @NotNull(message = "El departamento es obligatorio") Integer idDepartamento) {
    }

    public record ExpertoResponse(Integer id, String numEmpleado, String primerNombre, String apellidoPaterno,
                                  String telefonoOficina, String direccionEmail,
                                  Integer idDepartamento, String departamento) {
        public static ExpertoResponse desde(ExpertoSoporte e) {
            return new ExpertoResponse(e.getId(), e.getNumEmpleado(), e.getPrimerNombre(), e.getApellidoPaterno(),
                    e.getTelefonoOficina(), e.getDireccionEmail(),
                    e.getDepartamento().getId(), e.getDepartamento().getNombre());
        }
    }

    // ---------------------------------------------------------------- sistema_operativo
    public record SistemaOperativoRequest(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 60) String nombre,
            @NotBlank(message = "La versión es obligatoria") @Size(max = 30) String version,
            @NotBlank(message = "La arquitectura es obligatoria")
            @Pattern(regexp = "32 bits|64 bits|ARM64", message = "Valores permitidos: 32 bits, 64 bits, ARM64")
            String arquitectura,
            @NotBlank(message = "El fabricante es obligatorio") @Size(max = 80) String fabricante,
            LocalDate fechaFinSoporte) {
    }

    public record SistemaOperativoResponse(Integer id, String nombre, String version, String arquitectura,
                                           String fabricante, LocalDate fechaFinSoporte) {
        public static SistemaOperativoResponse desde(SistemaOperativo s) {
            return new SistemaOperativoResponse(s.getId(), s.getNombre(), s.getVersion(), s.getArquitectura(),
                    s.getFabricante(), s.getFechaFinSoporte());
        }
    }
}
