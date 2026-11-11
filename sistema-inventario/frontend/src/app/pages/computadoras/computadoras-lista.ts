import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { ComputadorasService } from '../../core/computadoras.service';
import { mensajeError } from '../../core/errores';
import { Computadora, ESTADOS_EQUIPO, Edificio, Pagina } from '../../core/models';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-computadoras-lista',
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, Icono],
  template: `
    <header class="pagina-encabezado">
      <div>
        <div class="migas">Inventario</div>
        <h1>Computadoras</h1>
        <p>Equipos registrados, su ubicación, costo y vigencia de garantía.</p>
      </div>
      @if (puedeEditar) {
        <a class="btn btn-primario" routerLink="/computadoras/nueva"><app-icono nombre="mas" /> Nueva computadora</a>
      }
    </header>

    @if (!puedeEditar) {
      <div class="alerta alerta-info"><app-icono nombre="escudo" />
        <span>Modo consulta: tu rol puede ver el inventario, pero no registrar ni modificar equipos.</span></div>
    }

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <section class="panel">
      <div class="panel-encabezado">
        <div class="busqueda">
          <app-icono nombre="buscar" />
          <input class="control" placeholder="Inventario, marca o modelo" [(ngModel)]="q" (keyup.enter)="buscar(0)" />
        </div>
        <select class="control filtro-select" [(ngModel)]="estado" (change)="buscar(0)">
          <option value="">Todos los estados</option>
          @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
        </select>
        <select class="control filtro-select" [(ngModel)]="idEdificio" (change)="buscar(0)">
          <option [ngValue]="null">Todos los edificios</option>
          @for (e of edificios(); track e.id) { <option [ngValue]="e.id">{{ e.clave }} · {{ e.nombre }}</option> }
        </select>
        <button class="btn btn-secundario" (click)="buscar(0)">Buscar</button>
      </div>

      <div class="tabla-contenedor">
        <table class="tabla">
          <thead>
            <tr>
              <th>Inventario</th><th>Equipo</th><th>Tipo</th><th>Ubicación</th>
              <th class="num">Costo</th><th>Garantía</th><th>Estado</th>
              @if (puedeEditar) { <th></th> }
            </tr>
          </thead>
          <tbody>
            @if (cargando() && !pagina()) {
              @for (i of [1, 2, 3, 4]; track i) {
                <tr><td colspan="8"><div class="esqueleto"></div></td></tr>
              }
            } @else {
              @for (c of pagina()?.content ?? []; track c.id) {
                <tr>
                  <td>
                    <span class="celda-doble">
                      <strong class="mono">{{ c.numInventario }}</strong>
                      <span>S/N {{ c.numeroSerie }}</span>
                    </span>
                  </td>
                  <td>
                    <span class="celda-doble">
                      <strong>{{ c.marca }} {{ c.modelo }}</strong>
                      <span>{{ resumenHardware(c) }}</span>
                    </span>
                  </td>
                  <td>{{ c.tipoEquipo }}</td>
                  <td>
                    <span class="celda-doble">
                      <strong>{{ nombreEdificio(c.idEdificio) }}</strong>
                      <span>{{ c.ubicacionEspecifica ?? '' }}</span>
                    </span>
                  </td>
                  <td class="num">{{ c.costoAdquisicion | currency: 'MXN' : 'symbol-narrow' }}</td>
                  <td>
                    <span class="celda-doble">
                      <span class="insignia" [class.exito]="c.enGarantia" [class.peligro]="!c.enGarantia">
                        {{ c.enGarantia ? 'Vigente' : 'Vencida' }}
                      </span>
                      <span>{{ c.fechaFinGarantia ? ('hasta ' + (c.fechaFinGarantia | date: 'dd/MM/yyyy')) : 'sin garantía' }}</span>
                    </span>
                  </td>
                  <td><span [class]="claseEstado(c.estado)">{{ c.estado }}</span></td>
                  @if (puedeEditar) {
                    <td class="acciones">
                      <a class="btn btn-fantasma btn-icono" title="Editar" [routerLink]="['/computadoras', c.id]">
                        <app-icono nombre="editar" />
                      </a>
                      @if (esAdmin) {
                        <button class="btn btn-fantasma btn-icono peligro" title="Eliminar" (click)="eliminar(c)">
                          <app-icono nombre="eliminar" />
                        </button>
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td colspan="8">
                    <div class="vacio">
                      <app-icono nombre="equipo" />
                      <strong>No se encontraron equipos</strong>
                      <span>Ajusta los filtros o registra una computadora nueva.</span>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (pagina(); as p) {
        <div class="panel-pie">
          <span>{{ p.page.totalElements }} equipos · página {{ p.page.number + 1 }} de {{ p.page.totalPages || 1 }}</span>
          <span>
            <button class="btn btn-secundario btn-sm" [disabled]="p.page.number === 0" (click)="buscar(p.page.number - 1)">
              <app-icono nombre="anterior" /> Anterior
            </button>
            &nbsp;
            <button class="btn btn-secundario btn-sm" [disabled]="p.page.number + 1 >= p.page.totalPages"
                    (click)="buscar(p.page.number + 1)">
              Siguiente <app-icono nombre="siguiente" />
            </button>
          </span>
        </div>
      }
    </section>
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

  /** id -> "CLAVE · Nombre" (el edificio vive en catalogos-service). */
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

  protected resumenHardware(c: Computadora): string {
    const partes = [c.procesador, c.memoriaRamGb ? `${c.memoriaRamGb} GB RAM` : null];
    return partes.filter(Boolean).join(' · ');
  }

  protected claseEstado(estado: string): string {
    switch (estado) {
      case 'Activo': return 'insignia exito';
      case 'En reparacion': return 'insignia aviso';
      case 'Baja': return 'insignia peligro';
      default: return 'insignia info';
    }
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
