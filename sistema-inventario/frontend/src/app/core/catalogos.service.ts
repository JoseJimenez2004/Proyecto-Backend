import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Distribuidor, Edificio, EdificioRequest, Experto } from './models';

/** Llamadas a catalogos-service (a través del gateway: /api/catalogos/...). */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/catalogos';

  edificios(): Observable<Edificio[]> {
    return this.http.get<Edificio[]>(`${this.base}/edificios`);
  }

  edificio(id: number): Observable<Edificio> {
    return this.http.get<Edificio>(`${this.base}/edificios/${id}`);
  }

  crearEdificio(datos: EdificioRequest): Observable<Edificio> {
    return this.http.post<Edificio>(`${this.base}/edificios`, datos);
  }

  actualizarEdificio(id: number, datos: EdificioRequest): Observable<Edificio> {
    return this.http.put<Edificio>(`${this.base}/edificios/${id}`, datos);
  }

  eliminarEdificio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/edificios/${id}`);
  }

  distribuidores(): Observable<Distribuidor[]> {
    return this.http.get<Distribuidor[]>(`${this.base}/distribuidores`);
  }

  expertos(): Observable<Experto[]> {
    return this.http.get<Experto[]>(`${this.base}/expertos`);
  }
}
