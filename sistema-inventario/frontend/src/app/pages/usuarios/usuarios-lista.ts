import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { mensajeError } from '../../core/errores';
import { ROLES, Rol, Usuario } from '../../core/models';
import { UsuariosService } from '../../core/usuarios.service';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink, FormsModule, Icono],
  template: `
    <header class="pagina-encabezado">
      <div>
        <div class="migas">Administración</div>
        <h1>Usuarios</h1>
        <p>Cuentas con acceso al sistema y su rol.</p>
      </div>
      <a class="btn btn-primario" routerLink="/usuarios/nuevo"><app-icono nombre="mas" /> Nuevo usuario</a>
    </header>

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <section class="kpis">
      @for (r of resumen(); track r.rol) {
        <div class="kpi">
          <span class="kpi-icono" [class.rojo]="r.rol === 'ADMIN'" [class.verde]="r.rol === 'CONSULTA'">
            <app-icono nombre="usuario" />
          </span>
          <span>
            <span class="kpi-valor">{{ r.total }}</span>
            <span class="kpi-etiqueta">{{ r.nombre }}</span>
          </span>
        </div>
      }
    </section>

    <section class="panel">
      <div class="panel-encabezado">
        <div class="busqueda">
          <app-icono nombre="buscar" />
          <input class="control" placeholder="Buscar por usuario, nombre o correo" [(ngModel)]="filtro" />
        </div>
        <span class="espacio"></span>
        <small>{{ filtrados().length }} de {{ usuarios().length }} usuarios</small>
      </div>

      <div class="tabla-contenedor">
        <table class="tabla">
          <thead>
            <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Experto vinculado</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            @if (cargando()) {
              @for (i of [1, 2, 3]; track i) {
                <tr><td colspan="6"><div class="esqueleto"></div></td></tr>
              }
            } @else {
              @for (u of filtrados(); track u.id) {
                <tr>
                  <td>
                    <span class="celda-doble">
                      <strong>{{ u.nombreCompleto }}</strong>
                      <span class="mono">{{ u.username }}</span>
                    </span>
                  </td>
                  <td>{{ u.email }}</td>
                  <td>
                    @for (r of u.roles; track r) {
                      <span [class]="claseRol(r)">{{ nombreRol(r) }}</span>
                    }
                  </td>
                  <td>{{ u.idExperto ? '#' + u.idExperto : '—' }}</td>
                  <td>
                    <span class="insignia" [class.exito]="u.activo" [class.peligro]="!u.activo">
                      {{ u.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="acciones">
                    <a class="btn btn-fantasma btn-icono" title="Editar" [routerLink]="['/usuarios', u.id]">
                      <app-icono nombre="editar" />
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6"><div class="vacio"><app-icono nombre="usuario" /><strong>Sin resultados</strong></div></td></tr>
              }
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class UsuariosLista implements OnInit {
  private readonly servicio = inject(UsuariosService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly texto = signal('');
  protected get filtro(): string { return this.texto(); }
  protected set filtro(v: string) { this.texto.set(v); }

  protected readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return t
      ? this.usuarios().filter((u) =>
          [u.username, u.nombreCompleto, u.email].some((c) => c.toLowerCase().includes(t)))
      : this.usuarios();
  });

  protected readonly resumen = computed(() =>
    (Object.keys(ROLES) as Rol[]).map((rol) => ({
      rol,
      nombre: ROLES[rol].nombre,
      total: this.usuarios().filter((u) => u.roles.includes(rol)).length,
    })),
  );

  ngOnInit(): void {
    this.servicio.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  protected nombreRol(rol: Rol): string {
    return ROLES[rol]?.nombre ?? rol;
  }

  protected claseRol(rol: Rol): string {
    return rol === 'ADMIN' ? 'insignia peligro' : rol === 'SOPORTE' ? 'insignia info' : 'insignia exito';
  }
}
