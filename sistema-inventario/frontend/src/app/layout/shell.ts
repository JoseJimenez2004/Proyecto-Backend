import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth.service';

/** Marco de la aplicación autenticada: barra superior + contenido. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="cabecera">
      <div class="contenedor fila">
        <strong class="marca">Inventario ESCOM</strong>
        <nav>
          <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/computadoras" routerLinkActive="activo">Computadoras</a>
          <a routerLink="/edificios" routerLinkActive="activo">Edificios</a>
        </nav>
        <span class="espacio"></span>
        @if (auth.usuario(); as u) {
          <span class="usuario">{{ u.nombreCompleto }} · {{ u.roles.join(', ') }}</span>
        }
        <button class="secundario chico" (click)="auth.logout()">Salir</button>
      </div>
    </header>
    <main class="contenedor">
      <router-outlet />
    </main>
  `,
  styles: `
    .cabecera { background: var(--azul); color: #fff; }
    .fila { display: flex; align-items: center; gap: 1.25rem; padding-top: .75rem; padding-bottom: .75rem; }
    .marca { font-size: 1.05rem; }
    nav { display: flex; gap: 1rem; }
    nav a { color: #dbe7f6; text-decoration: none; padding: .25rem 0; }
    nav a.activo { color: #fff; border-bottom: 2px solid #fff; }
    .espacio { flex: 1; }
    .usuario { font-size: .85rem; color: #dbe7f6; }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
}
