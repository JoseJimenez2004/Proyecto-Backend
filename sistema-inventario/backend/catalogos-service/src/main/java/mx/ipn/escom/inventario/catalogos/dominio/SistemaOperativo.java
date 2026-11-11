package mx.ipn.escom.inventario.catalogos.dominio;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** Tabla sistema_operativo (2.4.6), con UNIQUE(nombre, version, arquitectura). */
@Entity
@Table(name = "sistema_operativo",
        uniqueConstraints = @UniqueConstraint(name = "uq_so_nombre_version_arq",
                columnNames = {"nombre", "version", "arquitectura"}))
public class SistemaOperativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sistema_operativo")
    private Integer id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String version;

    @Column(nullable = false, length = 10)
    private String arquitectura;

    @Column(nullable = false, length = 80)
    private String fabricante;

    @Column(name = "fecha_fin_soporte")
    private LocalDate fechaFinSoporte;

    public Integer getId() { return id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getArquitectura() { return arquitectura; }
    public void setArquitectura(String arquitectura) { this.arquitectura = arquitectura; }

    public String getFabricante() { return fabricante; }
    public void setFabricante(String fabricante) { this.fabricante = fabricante; }

    public LocalDate getFechaFinSoporte() { return fechaFinSoporte; }
    public void setFechaFinSoporte(LocalDate fechaFinSoporte) { this.fechaFinSoporte = fechaFinSoporte; }
}
