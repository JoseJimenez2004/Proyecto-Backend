package mx.ipn.escom.inventario.catalogos.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Tabla experto_soporte (2.4.5).
 * Departamento vive en el mismo microservicio, así que aquí sí hay llave foránea real (R10).
 */
@Entity
@Table(name = "experto_soporte")
public class ExpertoSoporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_experto")
    private Integer id;

    @Column(name = "num_empleado", nullable = false, unique = true, length = 15)
    private String numEmpleado;

    @Column(name = "primer_nombre", nullable = false, length = 60)
    private String primerNombre;

    @Column(name = "apellido_paterno", nullable = false, length = 60)
    private String apellidoPaterno;

    @Column(name = "telefono_oficina", length = 15)
    private String telefonoOficina;

    @Column(name = "direccion_email", nullable = false, unique = true, length = 100)
    private String direccionEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_departamento", nullable = false)
    private Departamento departamento;

    public Integer getId() { return id; }

    public String getNumEmpleado() { return numEmpleado; }
    public void setNumEmpleado(String numEmpleado) { this.numEmpleado = numEmpleado; }

    public String getPrimerNombre() { return primerNombre; }
    public void setPrimerNombre(String primerNombre) { this.primerNombre = primerNombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getTelefonoOficina() { return telefonoOficina; }
    public void setTelefonoOficina(String telefonoOficina) { this.telefonoOficina = telefonoOficina; }

    public String getDireccionEmail() { return direccionEmail; }
    public void setDireccionEmail(String direccionEmail) { this.direccionEmail = direccionEmail; }

    public Departamento getDepartamento() { return departamento; }
    public void setDepartamento(Departamento departamento) { this.departamento = departamento; }
}
