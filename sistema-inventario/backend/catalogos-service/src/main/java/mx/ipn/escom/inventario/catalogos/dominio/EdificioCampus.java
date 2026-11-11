package mx.ipn.escom.inventario.catalogos.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Tabla edificio_campus (diccionario de datos 2.4.1). */
@Entity
@Table(name = "edificio_campus")
public class EdificioCampus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_edificio")
    private Integer id;

    @Column(nullable = false, unique = true, length = 10)
    private String clave;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(name = "tipo_espacio", nullable = false, length = 20)
    private String tipoEspacio;

    @Column(length = 150)
    private String direccion;

    @Column(name = "numero_niveles")
    private Short numeroNiveles;

    @Column(nullable = false)
    private Boolean activo = Boolean.TRUE;

    public Integer getId() { return id; }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipoEspacio() { return tipoEspacio; }
    public void setTipoEspacio(String tipoEspacio) { this.tipoEspacio = tipoEspacio; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public Short getNumeroNiveles() { return numeroNiveles; }
    public void setNumeroNiveles(Short numeroNiveles) { this.numeroNiveles = numeroNiveles; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
