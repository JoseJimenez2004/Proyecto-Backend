package mx.ipn.escom.inventario.inventario.dominio;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Tabla computadora (2.4.8).
 *
 * idEdificio e idDistribuidor apuntan a registros de catalogos-service. Como cada
 * microservicio tiene su propia base, NO hay llave foránea física: la integridad se
 * valida llamando a catalogos-service antes de guardar (ver CatalogosClient).
 */
@Entity
@Table(name = "computadora")
public class Computadora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_computadora")
    private Integer id;

    @Column(name = "num_inventario", nullable = false, unique = true, length = 20)
    private String numInventario;

    @Column(name = "numero_serie", nullable = false, unique = true, length = 50)
    private String numeroSerie;

    @Column(nullable = false, length = 50)
    private String marca;

    @Column(nullable = false, length = 60)
    private String modelo;

    @Column(name = "tipo_equipo", nullable = false, length = 20)
    private String tipoEquipo;

    @Column(length = 80)
    private String procesador;

    @Column(name = "memoria_ram_gb")
    private Short memoriaRamGb;

    @Column(name = "capacidad_disco_duro_gb")
    private Integer capacidadDiscoDuroGb;

    @Column(name = "capacidad_segundo_disco_duro_gb")
    private Integer capacidadSegundoDiscoDuroGb;

    @Column(name = "unidad_optica", length = 30)
    private String unidadOptica;

    @Column(name = "fecha_compra", nullable = false)
    private LocalDate fechaCompra;

    @Column(name = "costo_adquisicion", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoAdquisicion;

    @Column(name = "costo_reemplazo", precision = 10, scale = 2)
    private BigDecimal costoReemplazo;

    @Column(name = "intervalo_actualizacion_meses")
    private Short intervaloActualizacionMeses;

    @Column(name = "fecha_fin_garantia")
    private LocalDate fechaFinGarantia;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "ubicacion_especifica", length = 60)
    private String ubicacionEspecifica;

    @Column(name = "id_edificio", nullable = false)
    private Integer idEdificio;

    @Column(name = "id_distribuidor", nullable = false)
    private Integer idDistribuidor;

    /** El equipo sigue en garantía hoy. */
    public boolean enGarantia() {
        return fechaFinGarantia != null && !fechaFinGarantia.isBefore(LocalDate.now());
    }

    public Integer getId() { return id; }

    public String getNumInventario() { return numInventario; }
    public void setNumInventario(String numInventario) { this.numInventario = numInventario; }

    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getTipoEquipo() { return tipoEquipo; }
    public void setTipoEquipo(String tipoEquipo) { this.tipoEquipo = tipoEquipo; }

    public String getProcesador() { return procesador; }
    public void setProcesador(String procesador) { this.procesador = procesador; }

    public Short getMemoriaRamGb() { return memoriaRamGb; }
    public void setMemoriaRamGb(Short memoriaRamGb) { this.memoriaRamGb = memoriaRamGb; }

    public Integer getCapacidadDiscoDuroGb() { return capacidadDiscoDuroGb; }
    public void setCapacidadDiscoDuroGb(Integer v) { this.capacidadDiscoDuroGb = v; }

    public Integer getCapacidadSegundoDiscoDuroGb() { return capacidadSegundoDiscoDuroGb; }
    public void setCapacidadSegundoDiscoDuroGb(Integer v) { this.capacidadSegundoDiscoDuroGb = v; }

    public String getUnidadOptica() { return unidadOptica; }
    public void setUnidadOptica(String unidadOptica) { this.unidadOptica = unidadOptica; }

    public LocalDate getFechaCompra() { return fechaCompra; }
    public void setFechaCompra(LocalDate fechaCompra) { this.fechaCompra = fechaCompra; }

    public BigDecimal getCostoAdquisicion() { return costoAdquisicion; }
    public void setCostoAdquisicion(BigDecimal costoAdquisicion) { this.costoAdquisicion = costoAdquisicion; }

    public BigDecimal getCostoReemplazo() { return costoReemplazo; }
    public void setCostoReemplazo(BigDecimal costoReemplazo) { this.costoReemplazo = costoReemplazo; }

    public Short getIntervaloActualizacionMeses() { return intervaloActualizacionMeses; }
    public void setIntervaloActualizacionMeses(Short v) { this.intervaloActualizacionMeses = v; }

    public LocalDate getFechaFinGarantia() { return fechaFinGarantia; }
    public void setFechaFinGarantia(LocalDate fechaFinGarantia) { this.fechaFinGarantia = fechaFinGarantia; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getUbicacionEspecifica() { return ubicacionEspecifica; }
    public void setUbicacionEspecifica(String ubicacionEspecifica) { this.ubicacionEspecifica = ubicacionEspecifica; }

    public Integer getIdEdificio() { return idEdificio; }
    public void setIdEdificio(Integer idEdificio) { this.idEdificio = idEdificio; }

    public Integer getIdDistribuidor() { return idDistribuidor; }
    public void setIdDistribuidor(Integer idDistribuidor) { this.idDistribuidor = idDistribuidor; }
}
