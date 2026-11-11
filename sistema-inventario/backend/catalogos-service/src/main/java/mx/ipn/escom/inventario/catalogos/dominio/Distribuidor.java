package mx.ipn.escom.inventario.catalogos.dominio;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Tabla distribuidor (2.4.2).
 * montoTotalCompra y numeroTotalPedidos son la "redundancia controlada" del diseño:
 * no los captura el usuario, los mantiene el sistema.
 */
@Entity
@Table(name = "distribuidor")
public class Distribuidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_distribuidor")
    private Integer id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 100)
    private String calle;

    @Column(nullable = false, length = 60)
    private String ciudad;

    @Column(nullable = false, length = 60)
    private String estado;

    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;

    @Column(nullable = false, length = 15)
    private String telefono;

    @Column(name = "fecha_ultimo_pedido")
    private LocalDate fechaUltimoPedido;

    @Column(name = "monto_total_compra", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotalCompra = BigDecimal.ZERO;

    @Column(name = "numero_total_pedidos", nullable = false)
    private Integer numeroTotalPedidos = 0;

    public Integer getId() { return id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public LocalDate getFechaUltimoPedido() { return fechaUltimoPedido; }
    public void setFechaUltimoPedido(LocalDate fechaUltimoPedido) { this.fechaUltimoPedido = fechaUltimoPedido; }

    public BigDecimal getMontoTotalCompra() { return montoTotalCompra; }
    public void setMontoTotalCompra(BigDecimal montoTotalCompra) { this.montoTotalCompra = montoTotalCompra; }

    public Integer getNumeroTotalPedidos() { return numeroTotalPedidos; }
    public void setNumeroTotalPedidos(Integer numeroTotalPedidos) { this.numeroTotalPedidos = numeroTotalPedidos; }
}
