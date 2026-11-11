package mx.ipn.escom.inventario.inventario.cliente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import mx.ipn.escom.inventario.common.error.ReglaNegocioException;
import mx.ipn.escom.inventario.common.error.ServicioNoDisponibleException;

/**
 * Consultas a catalogos-service. Sustituye a las llaves foráneas que en el diseño
 * monolítico iban de computadora a edificio_campus y distribuidor.
 */
@Component
public class CatalogosClient {

    private final RestClient rest;

    public CatalogosClient(@Qualifier("catalogosRestClient") RestClient rest) {
        this.rest = rest;
    }

    public void validarEdificio(Integer id) {
        validarExiste("/api/catalogos/edificios/{id}", id, "el edificio");
    }

    public void validarDistribuidor(Integer id) {
        validarExiste("/api/catalogos/distribuidores/{id}", id, "el distribuidor");
    }

    private void validarExiste(String uri, Integer id, String descripcion) {
        try {
            rest.get().uri(uri, id).retrieve().toBodilessEntity();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ReglaNegocioException("No existe " + descripcion + " con id " + id);
        } catch (RestClientException | IllegalStateException e) {
            // IllegalStateException: el balanceador no encontró instancias registradas en Eureka
            throw new ServicioNoDisponibleException(
                    "No se pudo validar " + descripcion + ": catalogos-service no responde", e);
        }
    }
}
