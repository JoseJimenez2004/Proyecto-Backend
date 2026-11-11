import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { ComputadorasService } from '../../core/computadoras.service';
import { mensajeError } from '../../core/errores';
import { Computadora, ESTADOS_EQUIPO, Edificio, Pagina } from '../../core/models';

@Component({
  selector: 'app-computadoras-lista',
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="barra">
      <h1>Computadoras</h1>
      <span class="espacio"></span>
      @if (puedeEditar) {
        <a class="boton" routerLink="/computadoras/nueva">+ Nueva computadora</a>
      }
    </div>

    <div class="tarjeta barra">
      <input style="max-width: 280px" placeholder="Buscar inventario, marca o modelo"
             [(ngModel)]="q" (keyup.enter)="buscar(0)" />
      <select style="max-width: 180px" [(ngModel)]="estado" (change)="buscar(0)">
        <option value="">Todos los estados</option>
        @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
      </select>
      <select style="max-width: 260px" [(ngModel)]="idEdificio" (change)="buscar(0)">
        <option [ngValue]="null">Todos los edificios</option>
        @for (e of edificios(); track e.id) { <option [ngValue]="e.id">{{ e.clave }} · {{ e.nombre }}</option> }
      </select>
      <button class="secundario" (click)="buscar(0)">Buscar</button>
    </div>

    @if (error()) {
      <div class="alerta error">{{ error() }}</div>
    }

    <table>
      <thead>
        <tr>
          <th>Inventario</th><th>Equipo</th><th>Tipo</th><th>Ubicación</th>
          <th>Costo</th><th>Garantía</th><th>Estado</th>
          @if (puedeEditar) { <th></th> }
        </tr>
      </thead>
      <tbody>
        @for (c of pagina()?.content ?? []; track c.id) {
          <tr>
            <td><strong>{{ c.numInventario }}</strong><br /><small>{{ c.numeroSerie }}</small></td>
            <td>{{ c.marca }} {{ c.modelo }}<br /><small>{{ c.procesador ?? '' }}</small></td>
            <td>{{ c.tipoEquipo }}</td>
            <td>{{ nombreEdificio(c.idEdificio) }}<br /><small>{{ c.ubicacionEspecifica ?? '' }}</small></td>
            <td>{{ c.costoAdquisicion | currency: 'MXN' : 'symbol-narrow' }}</td>
            <td>
              <span class="etiqueta" [class.verde]="c.enGarantia" [class.roja]="!c.enGarantia">
                {{ c.enGarantia ? 'Vigente' : 'Vencida' }}
              </span>
            </td>
            <td>{{ c.estado }}</td>
            @if (puedeEditar) {
              <td class="acciones">
                <a class="boton secundario chico" [routerLink]="['/computadoras', c.id]">Editar</a>
                @if (esAdmin) {
                  <button class="peligro chico" (click)="eliminar(c)">Eliminar</button>
                }
              </td>
            }
          </tr>
        } @empty {
          <tr><td colspan="8" class="vacio">{{ cargando() ? 'Cargando…' : 'No se encontraron equipos' }}</td></tr>
        }
      </tbody>
    </table>

    @if (pagina(); as p) {
      <div class="paginacion">
        <span>{{ p.page.totalElements }} equipos · página {{ p.page.number + 1 }} de {{ p.page.totalPages || 1 }}</span>
        <button class="secundario chico" [disabled]="p.page.number === 0" (click)="buscar(p.page.number - 1)">Anterior</button>
        <button class="secundario chico" [disabled]="p.page.number + 1 >= p.page.totalPages"
                (click)="buscar(p.page.number + 1)">Siguiente</button>
      </div>
    }
  `,
})
export class ComputadorasLista implements OnInit {
  private readonly servicio = inject(ComputadorasService);
  private readonly catalogos = inject(CatalogosService);
  private readonly auth = inject(AuthService);

  protected readonly puedeEditar = this.auth.tieneRol('ADMIN', 'SOPORTE');
  protected readonly esAdmin = this.auth.tieneRol('ADMIN');
  protected readonly estados = ESTADOS_EQUIPO;

  protected q = '';
  protected estado = '';
  protected idEdificio: number | null = null;

  protected readonly pagina = signal<Pagina<Computadora> | null>(null);
  protected readonly edificios = signal<Edificio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  /** id -> "CLAVE · Nombre" para mostrar el edificio (vive en otro microservicio). */
  private readonly mapaEdificios = computed(
    () => new Map(this.edificios().map((e) => [e.id, `${e.clave} · ${e.nombre}`])),
  );

  ngOnInit(): void {
    this.catalogos.edificios().subscribe({
      next: (lista) => this.edificios.set(lista),
      error: (e) => this.error.set(mensajeError(e)),
    });
    this.buscar(0);
  }

  protected nombreEdificio(id: number | null): string {
    return id == null ? '—' : (this.mapaEdificios().get(id) ?? `#${id}`);
  }

  protected buscar(pagina: number): void {
    this.cargando.set(true);
    this.servicio
      .buscar({ q: this.q.trim(), estado: this.estado, idEdificio: this.idEdificio, page: pagina, size: 10 })
      .subscribe({
        next: (p) => {
          this.pagina.set(p);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(mensajeError(e));
          this.cargando.set(false);
        },
      });
  }

  protected eliminar(c: Computadora): void {
    if (!confirm(`¿Eliminar el equipo ${c.numInventario}?`)) {
      return;
    }
    this.servicio.eliminar(c.id).subscribe({
      next: () => this.buscar(this.pagina()?.page.number ?? 0),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
