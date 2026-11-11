import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { ComputadorasService } from '../../core/computadoras.service';
import { mensajeError } from '../../core/errores';
import { Computadora } from '../../core/models';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Icono, CurrencyPipe],
  template: `
    <header class="pagina-encabezado">
      <div>
        <h1>{{ saludo() }}, {{ primerNombre() }}</h1>
        <p>Resumen del inventario de equipo de cómputo de la ESCOM.</p>
      </div>
    </header>

    <!-- Panel del rol: qué puede hacer este usuario y accesos rápidos -->
    @if (auth.infoRol(); as info) {
      <section class="rol-panel" [attr.data-rol]="auth.rol()">
        <div class="rol-icono"><app-icono [nombre]="auth.rol() === 'CONSULTA' ? 'buscar' : 'escudo'" /></div>
        <div class="rol-texto">
          <span class="rol-etiqueta">Tu rol: {{ info.nombre }}</span>
          <p>{{ info.descripcion }}</p>
          <ul class="permisos">
            @for (p of permisos(); track p.texto) {
              <li [class.no]="!p.puede">{{ p.puede ? '✓' : '✕' }} {{ p.texto }}</li>
            }
          </ul>
        </div>
        <div class="rol-acciones">
          @switch (auth.rol()) {
            @case ('ADMIN') {
              <a class="btn btn-primario" routerLink="/computadoras/nueva"><app-icono nombre="mas" /> Registrar equipo</a>
              <a class="btn btn-secundario" routerLink="/edificios/nuevo"><app-icono nombre="edificio" /> Nuevo espacio</a>
              <a class="btn btn-secundario" routerLink="/usuarios/nuevo"><app-icono nombre="usuario" /> Nuevo usuario</a>
            }
            @case ('SOPORTE') {
              <a class="btn btn-primario" routerLink="/computadoras/nueva"><app-icono nombre="mas" /> Registrar equipo</a>
              <a class="btn btn-secundario" routerLink="/computadoras"><app-icono nombre="equipo" /> Ver computadoras</a>
            }
            @default {
              <a class="btn btn-primario" routerLink="/computadoras"><app-icono nombre="equipo" /> Consultar equipos</a>
              <a class="btn btn-secundario" routerLink="/edificios"><app-icono nombre="edificio" /> Consultar espacios</a>
            }
          }
        </div>
      </section>
    }

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <section class="kpis">
      <a class="kpi" routerLink="/computadoras">
        <span class="kpi-icono"><app-icono nombre="equipo" /></span>
        <span>
          <span class="kpi-valor">{{ equipos()?.length ?? '—' }}</span>
          <span class="kpi-etiqueta">Equipos registrados</span>
        </span>
      </a>
      <div class="kpi">
        <span class="kpi-icono verde"><app-icono nombre="escudo" /></span>
        <span>
          <span class="kpi-valor">{{ enGarantia() ?? '—' }}</span>
          <span class="kpi-etiqueta">Con garantía vigente</span>
        </span>
      </div>
      <div class="kpi">
        <span class="kpi-icono rojo"><app-icono nombre="alerta" /></span>
        <span>
          <span class="kpi-valor">{{ fueraGarantia() ?? '—' }}</span>
          <span class="kpi-etiqueta">Fuera de garantía</span>
        </span>
      </div>
      <a class="kpi" routerLink="/edificios">
        <span class="kpi-icono guinda"><app-icono nombre="edificio" /></span>
        <span>
          <span class="kpi-valor">{{ totalEdificios() ?? '—' }}</span>
          <span class="kpi-etiqueta">Edificios y espacios</span>
        </span>
      </a>
    </section>

    <div class="dos-columnas">
      <section class="panel">
        <div class="panel-encabezado">
          <h2>Equipos registrados recientemente</h2>
          <span class="espacio"></span>
          <a class="btn btn-fantasma btn-sm" routerLink="/computadoras">Ver todos</a>
        </div>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr><th>Equipo</th><th>Estado</th><th class="num">Costo</th></tr>
            </thead>
            <tbody>
              @for (c of recientes(); track c.id) {
                <tr>
                  <td>
                    <span class="celda-doble">
                      <strong>{{ c.marca }} {{ c.modelo }}</strong>
                      <span>{{ c.numInventario }}</span>
                    </span>
                  </td>
                  <td><span class="insignia" [class.exito]="c.estado === 'Activo'">{{ c.estado }}</span></td>
                  <td class="num">{{ c.costoAdquisicion | currency: 'MXN' : 'symbol-narrow' }}</td>
                </tr>
              } @empty {
                <tr><td colspan="3"><div class="vacio">{{ equipos() ? 'Sin equipos registrados' : 'Cargando…' }}</div></td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-encabezado"><h2>Equipos por estado</h2></div>
        <div class="panel-cuerpo barras">
          @for (e of porEstado(); track e.estado) {
            <div class="barra-fila">
              <span class="barra-etiqueta">{{ e.estado }}</span>
              <span class="barra-pista"><span class="barra-relleno" [style.width.%]="e.porcentaje"></span></span>
              <span class="barra-valor">{{ e.total }}</span>
            </div>
          } @empty {
            <div class="vacio">Sin datos</div>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    .rol-panel {
      display: grid; grid-template-columns: auto 1fr auto; gap: 1.25rem; align-items: center;
      padding: 1.25rem 1.5rem; margin-bottom: 1.25rem;
      border: 1px solid var(--c-borde); border-left: 4px solid var(--c-primario);
      border-radius: var(--radio-lg); background: var(--c-superficie); box-shadow: var(--sombra);
    }
    .rol-panel[data-rol="ADMIN"] { border-left-color: #e11d48; }
    .rol-panel[data-rol="CONSULTA"] { border-left-color: var(--c-exito); }
    .rol-icono {
      display: grid; place-items: center; width: 48px; height: 48px; border-radius: 12px;
      background: var(--c-primario-claro); color: var(--c-primario); font-size: 1.4rem;
    }
    .rol-panel[data-rol="ADMIN"] .rol-icono { background: #ffe4e6; color: #be123c; }
    .rol-panel[data-rol="CONSULTA"] .rol-icono { background: var(--c-exito-bg); color: var(--c-exito); }
    .rol-etiqueta { font-weight: 700; font-size: 1rem; }
    .rol-texto p { color: var(--c-texto-2); font-size: .9rem; margin-top: .15rem; }
    .permisos { list-style: none; padding: 0; margin: .6rem 0 0; display: flex; flex-wrap: wrap; gap: .35rem .9rem; font-size: .8rem; color: var(--c-exito); }
    .permisos li.no { color: var(--c-texto-3); text-decoration: line-through; }
    .rol-acciones { display: flex; flex-direction: column; gap: .5rem; }
    @media (max-width: 1000px) { .rol-panel { grid-template-columns: 1fr; } .rol-acciones { flex-direction: row; flex-wrap: wrap; } }
    .dos-columnas { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.25rem; align-items: start; }
    .dos-columnas .panel + .panel { margin-top: 0; }
    .barras { display: grid; gap: .9rem; }
    .barra-fila { display: grid; grid-template-columns: 110px 1fr 32px; align-items: center; gap: .75rem; font-size: .88rem; }
    .barra-etiqueta { color: var(--c-texto-2); }
    .barra-pista { height: 8px; border-radius: 99px; background: #eef2f7; overflow: hidden; }
    .barra-relleno { display: block; height: 100%; border-radius: 99px; background: var(--c-primario); }
    .barra-valor { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
    @media (max-width: 1000px) { .dos-columnas { grid-template-columns: 1fr; } }
  `,
})
export class Inicio implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly catalogos = inject(CatalogosService);
  private readonly computadoras = inject(ComputadorasService);

  protected readonly puedeEditar = this.auth.tieneRol('ADMIN', 'SOPORTE');

  /** Lista de permisos que se muestra en el panel del rol. */
  protected readonly permisos = computed(() => {
    const admin = this.auth.tieneRol('ADMIN');
    const soporte = admin || this.auth.tieneRol('SOPORTE');
    return [
      { texto: 'Consultar inventario y catálogos', puede: true },
      { texto: 'Registrar y editar computadoras', puede: soporte },
      { texto: 'Eliminar computadoras', puede: admin },
      { texto: 'Modificar catálogos', puede: admin },
      { texto: 'Administrar usuarios', puede: admin },
    ];
  });
  protected readonly equipos = signal<Computadora[] | null>(null);
  protected readonly totalEdificios = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly primerNombre = computed(() => this.auth.usuario()?.nombreCompleto.split(' ')[0] ?? '');
  protected readonly saludo = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  });

  protected readonly enGarantia = computed(() => this.equipos()?.filter((c) => c.enGarantia).length ?? null);
  protected readonly fueraGarantia = computed(() => this.equipos()?.filter((c) => !c.enGarantia).length ?? null);
  protected readonly recientes = computed(() =>
    [...(this.equipos() ?? [])].sort((a, b) => b.id - a.id).slice(0, 5),
  );
  protected readonly porEstado = computed(() => {
    const lista = this.equipos() ?? [];
    const conteo = new Map<string, number>();
    for (const c of lista) conteo.set(c.estado, (conteo.get(c.estado) ?? 0) + 1);
    return [...conteo.entries()]
      .map(([estado, total]) => ({ estado, total, porcentaje: lista.length ? (total / lista.length) * 100 : 0 }))
      .sort((a, b) => b.total - a.total);
  });

  ngOnInit(): void {
    const alFallar = (e: unknown) => this.error.set(mensajeError(e));
    // Para el resumen basta con una página grande; los reportes formales irán en el backend.
    this.computadoras.buscar({ size: 500 }).subscribe({
      next: (p) => this.equipos.set(p.content),
      error: alFallar,
    });
    this.catalogos.edificios().subscribe({
      next: (lista) => this.totalEdificios.set(lista.length),
      error: alFallar,
    });
  }
}
