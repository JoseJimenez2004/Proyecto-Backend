import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CatalogosService } from '../../core/catalogos.service';
import { ComputadorasService } from '../../core/computadoras.service';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
    <h1>Hola, {{ auth.usuario()?.nombreCompleto }}</h1>

    @if (error()) {
      <div class="alerta error">{{ error() }}</div>
    }

    <div class="rejilla">
      <a class="tarjeta indicador" routerLink="/computadoras">
        <span class="valor">{{ totalComputadoras() ?? '—' }}</span>
        <span>Computadoras registradas</span>
      </a>
      <a class="tarjeta indicador" routerLink="/computadoras">
        <span class="valor">{{ activas() ?? '—' }}</span>
        <span>En estado Activo</span>
      </a>
      <a class="tarjeta indicador" routerLink="/edificios">
        <span class="valor">{{ totalEdificios() ?? '—' }}</span>
        <span>Edificios y espacios</span>
      </a>
    </div>

    <div class="tarjeta">
      <h2>Próximos módulos</h2>
      <p>Software e instalaciones, sistemas operativos por equipo (arranque dual), mantenimientos
        y reportes (licencias vencidas, gasto fuera de garantía, etc.).</p>
    </div>
  `,
  styles: `
    .indicador { display: grid; gap: .25rem; text-decoration: none; color: inherit; }
    .indicador:hover { border-color: var(--azul); }
    .valor { font-size: 2rem; font-weight: 700; color: var(--azul); }
  `,
})
export class Inicio implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly catalogos = inject(CatalogosService);
  private readonly computadoras = inject(ComputadorasService);

  protected readonly totalComputadoras = signal<number | null>(null);
  protected readonly activas = signal<number | null>(null);
  protected readonly totalEdificios = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const alFallar = (e: unknown) => this.error.set(mensajeError(e));
    this.computadoras.buscar({ size: 1 }).subscribe({
      next: (p) => this.totalComputadoras.set(p.page.totalElements),
      error: alFallar,
    });
    this.computadoras.buscar({ size: 1, estado: 'Activo' }).subscribe({
      next: (p) => this.activas.set(p.page.totalElements),
      error: alFallar,
    });
    this.catalogos.edificios().subscribe({
      next: (lista) => this.totalEdificios.set(lista.length),
      error: alFallar,
    });
  }
}
