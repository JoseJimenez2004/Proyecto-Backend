import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { mensajeError } from '../../core/errores';
import { Edificio } from '../../core/models';

@Component({
  selector: 'app-edificios-lista',
  imports: [RouterLink],
  template: `
    <div class="barra">
      <h1>Edificios y espacios</h1>
      <span class="espacio"></span>
      @if (esAdmin) {
        <a class="boton" routerLink="/edificios/nuevo">+ Nuevo espacio</a>
      }
    </div>

    @if (error()) {
      <div class="alerta error">{{ error() }}</div>
    }

    <table>
      <thead>
        <tr>
          <th>Clave</th><th>Nombre</th><th>Tipo</th><th>Ubicación</th><th>Niveles</th><th>Estado</th>
          @if (esAdmin) { <th></th> }
        </tr>
      </thead>
      <tbody>
        @for (e of edificios(); track e.id) {
          <tr>
            <td><strong>{{ e.clave }}</strong></td>
            <td>{{ e.nombre }}</td>
            <td>{{ e.tipoEspacio }}</td>
            <td>{{ e.direccion ?? '—' }}</td>
            <td>{{ e.numeroNiveles ?? '—' }}</td>
            <td>
              <span class="etiqueta" [class.verde]="e.activo">{{ e.activo ? 'En uso' : 'Inactivo' }}</span>
            </td>
            @if (esAdmin) {
              <td class="acciones">
                <a class="boton secundario chico" [routerLink]="['/edificios', e.id]">Editar</a>
                <button class="peligro chico" (click)="eliminar(e)">Eliminar</button>
              </td>
            }
          </tr>
        } @empty {
          <tr><td colspan="7" class="vacio">{{ cargando() ? 'Cargando…' : 'No hay espacios registrados' }}</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class EdificiosLista implements OnInit {
  private readonly catalogos = inject(CatalogosService);
  protected readonly esAdmin = inject(AuthService).tieneRol('ADMIN');

  protected readonly edificios = signal<Edificio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

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
