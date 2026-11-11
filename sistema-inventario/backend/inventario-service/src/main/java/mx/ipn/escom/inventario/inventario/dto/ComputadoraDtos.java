package mx.ipn.escom.inventario.inventario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import mx.ipn.escom.inventario.inventario.dominio.Computadora;

public final class ComputadoraDtos {

    private ComputadoraDtos() {
    }

    /** Validaciones equivalentes a los CHECK de la tabla computadora del Avance 1. */
    public record ComputadoraRequest(
            @NotBlank(message = "El número de inventario es obligatorio") @Size(max = 20) String numInventario,
            @NotBlank(message = "El número de serie es obligatorio") @Size(max = 50) String numeroSerie,
            @NotBlank(message = "La marca es obligatoria") @Size(max = 50) String marca,
            @NotBlank(message = "El modelo es obligatorio") @Size(max = 60) String modelo,
            @NotBlank(message = "El tipo de equipo es obligatorio")
            @Pattern(regexp = "Escritorio|Portatil|All-in-One|Servidor",
                    message = "Valores permitidos: Escritorio, Portatil, All-in-One, Servidor")
            String tipoEquipo,
            @Size(max = 80) String procesador,
            @Positive(message = "Debe ser mayor a 0") Short memoriaRamGb,
            @Positive(message = "Debe ser mayor a 0") Integer capacidadDiscoDuroGb,
            @Positive(message = "Debe ser mayor a 0") Integer capacidadSegundoDiscoDuroGb,
            @Size(max = 30) String unidadOptica,
            @NotNull(message = "La fecha de compra es obligatoria") LocalDate fechaCompra,
            @NotNull(message = "El costo de adquisición es obligatorio")
            @PositiveOrZero(message = "No puede ser negativo") BigDecimal costoAdquisicion,
            @PositiveOrZero(message = "No puede ser negativo") BigDecimal costoReemplazo,
            @Positive(message = "Debe ser mayor a 0") Short intervaloActualizacionMeses,
            LocalDate fechaFinGarantia,
            @NotBlank(message = "El estado es obligatorio")
            @Pattern(regexp = "Activo|En reparacion|Resguardo|Baja",
                    message = "Valores permitidos: Activo, En reparacion, Resguardo, Baja")
            String estado,
            @Size(max = 60) String ubicacionEspecifica,
            @NotNull(message = "El edificio es obligatorio") Integer idEdificio,
            @NotNull(message = "El distribuidor es obligatorio") Integer idDistribuidor) {
    }

    public record ComputadoraResponse(
            Integer id, String numInventario, String numeroSerie, String marca, String modelo,
            String tipoEquipo, String procesador, Short memoriaRamGb, Integer capacidadDiscoDuroGb,
            Integer capacidadSegundoDiscoDuroGb, String unidadOptica, LocalDate fechaCompra,
            BigDecimal costoAdquisicion, BigDecimal costoReemplazo, Short intervaloActualizacionMeses,
            LocalDate fechaFinGarantia, boolean enGarantia, String estado, String ubicacionEspecifica,
            Integer idEdificio, Integer idDistribuidor) {

        public static ComputadoraResponse desde(Computadora c) {
            return new ComputadoraResponse(c.getId(), c.getNumInventario(), c.getNumeroSerie(), c.getMarca(),
                    c.getModelo(), c.getTipoEquipo(), c.getProcesador(), c.getMemoriaRamGb(),
                    c.getCapacidadDiscoDuroGb(), c.getCapacidadSegundoDiscoDuroGb(), c.getUnidadOptica(),
                    c.getFechaCompra(), c.getCostoAdquisicion(), c.getCostoReemplazo(),
                    c.getIntervaloActualizacionMeses(), c.getFechaFinGarantia(), c.enGarantia(), c.getEstado(),
                    c.getUbicacionEspecifica(), c.getIdEdificio(), c.getIdDistribuidor());
        }
    }
}
