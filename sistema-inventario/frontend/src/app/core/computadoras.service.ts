import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Computadora, ComputadoraRequest, Pagina } from './models';

export interface FiltroComputadoras {
  q?: string;
  estado?: string;
  idEdificio?: number | null;
  page?: number;
  size?: number;
}

/** Llamadas a inventario-service (a través del gateway: /api/inventario/...). */
@Injectable({ providedIn: 'root' })
export class ComputadorasService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/inventario/computadoras';

  buscar(filtro: FiltroComputadoras): Observable<Pagina<Computadora>> {
    let params = new HttpParams()
      .set('page', filtro.page ?? 0)
      .set('size', filtro.size ?? 10)
      .set('sort', 'numInventario');
    if (filtro.q) params = params.set('q', filtro.q);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.idEdificio != null) params = params.set('idEdificio', filtro.idEdificio);
    return this.http.get<Pagina<Computadora>>(this.base, { params });
  }

  obtener(id: number): Observable<Computadora> {
    return this.http.get<Computadora>(`${this.base}/${id}`);
  }

  crear(datos: ComputadoraRequest): Observable<Computadora> {
    return this.http.post<Computadora>(this.base, datos);
  }

  actualizar(id: number, datos: ComputadoraRequest): Observable<Computadora> {
    return this.http.put<Computadora>(`${this.base}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
