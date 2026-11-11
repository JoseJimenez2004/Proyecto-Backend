import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { mensajeError } from '../../core/errores';
import { Edificio } from '../../core/models';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-edificios-lista',
  imports: [RouterLink, FormsModule, Icono],
  template: `
    <header class="pagina-encabezado">
      <div>
        <div class="migas">Catálogos</div>
        <h1>Edificios y espacios</h1>
        <p>Laboratorios, cubículos, aulas y oficinas donde se ubica el equipo.</p>
      </div>
      @if (esAdmin) {
        <a class="btn btn-primario" routerLink="/edificios/nuevo"><app-icono nombre="mas" /> Nuevo espacio</a>
      }
    </header>

    @if (!esAdmin) {
      <div class="alerta alerta-info"><app-icono nombre="escudo" />
        <span>Los catálogos solo los modifica el administrador. Tu rol puede consultarlos.</span></div>
    }

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <section class="panel">
      <div class="panel-encabezado">
        <div class="busqueda">
          <app-icono nombre="buscar" />
          <input class="control" placeholder="Buscar por clave o nombre" [(ngModel)]="filtro" />
        </div>
        <span class="espacio"></span>
        <small>{{ filtrados().length }} de {{ edificios().length }} espacios</small>
      </div>

      <div class="tabla-contenedor">
        <table class="tabla">
          <thead>
            <tr>
              <th>Clave</th><th>Nombre</th><th>Tipo</th><th>Ubicación</th><th class="num">Niveles</th><th>Estado</th>
              @if (esAdmin) { <th></th> }
            </tr>
          </thead>
          <tbody>
            @if (cargando()) {
              @for (i of [1, 2, 3]; track i) {
                <tr><td colspan="7"><div class="esqueleto"></div></td></tr>
              }
            } @else {
              @for (e of filtrados(); track e.id) {
                <tr>
                  <td><span class="clave">{{ e.clave }}</span></td>
                  <td><strong>{{ e.nombre }}</strong></td>
                  <td>{{ e.tipoEspacio }}</td>
                  <td>{{ e.direccion ?? '—' }}</td>
                  <td class="num">{{ e.numeroNiveles ?? '—' }}</td>
                  <td>
                    <span class="insignia" [class.exito]="e.activo">{{ e.activo ? 'En uso' : 'Inactivo' }}</span>
                  </td>
                  @if (esAdmin) {
                    <td class="acciones">
                      <a class="btn btn-fantasma btn-icono" title="Editar" [routerLink]="['/edificios', e.id]">
                        <app-icono nombre="editar" />
                      </a>
                      <button class="btn btn-fantasma btn-icono peligro" title="Eliminar" (click)="eliminar(e)">
                        <app-icono nombre="eliminar" />
                      </button>
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td colspan="7">
                    <div class="vacio">
                      <app-icono nombre="edificio" />
                      <strong>No hay espacios que coincidan</strong>
                      <span>Prueba con otra búsqueda o registra un espacio nuevo.</span>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class EdificiosLista implements OnInit {
  private readonly catalogos = inject(CatalogosService);
  protected readonly esAdmin = inject(AuthService).tieneRol('ADMIN');

  protected readonly edificios = signal<Edificio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly texto = signal('');
  protected get filtro(): string { return this.texto(); }
  protected set filtro(v: string) { this.texto.set(v); }

  protected readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return t
      ? this.edificios().filter((e) => e.clave.toLowerCase().includes(t) || e.nombre.toLowerCase().includes(t))
      : this.edificios();
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.catalogos.edificios().subscribe({
      next: (lista) => {
        this.edificios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  protected eliminar(e: Edificio): void {
    if (!confirm(`¿Eliminar el espacio ${e.clave} - ${e.nombre}?`)) {
      return;
    }
    this.catalogos.eliminarEdificio(e.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(mensajeError(err)),
    });
  }
}
