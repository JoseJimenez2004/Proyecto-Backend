import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth.service';
import { Icono } from '../shared/icono';

/** Marco de la aplicación autenticada: menú lateral + contenido. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icono],
  template: `
    <div class="app">
      <aside class="lateral">
        <a class="marca" routerLink="/">
          <span class="logo">IE</span>
          <span class="marca-texto">
            <strong>Inventario</strong>
            <span>ESCOM · IPN</span>
          </span>
        </a>

        <nav class="menu">
          <span class="menu-titulo">General</span>
          <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
            <app-icono nombre="inicio" /> Inicio
          </a>

          <span class="menu-titulo">Inventario</span>
          <a routerLink="/computadoras" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
            <app-icono nombre="equipo" /> Computadoras
          </a>
          @if (auth.tieneRol('ADMIN', 'SOPORTE')) {
            <a routerLink="/computadoras/nueva" routerLinkActive="activo">
              <app-icono nombre="mas" /> Registrar equipo
            </a>
          }

          <span class="menu-titulo">Catálogos</span>
          <a routerLink="/edificios" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">
            <app-icono nombre="edificio" /> Edificios y espacios
          </a>

          @if (auth.tieneRol('ADMIN')) {
            <span class="menu-titulo">Administración</span>
            <a routerLink="/usuarios" routerLinkActive="activo">
              <app-icono nombre="usuario" /> Usuarios
            </a>
          }
        </nav>

        @if (auth.usuario(); as u) {
          <div class="perfil">
            <span class="avatar" [attr.data-rol]="auth.rol()">{{ iniciales() }}</span>
            <span class="perfil-texto">
              <strong>{{ u.nombreCompleto }}</strong>
              <span class="rol" [attr.data-rol]="auth.rol()">{{ auth.infoRol()?.nombre }}</span>
            </span>
            <button class="btn btn-icono salir" title="Cerrar sesión" (click)="auth.logout()">
              <app-icono nombre="salir" />
            </button>
          </div>
        }
      </aside>

      <main class="contenido">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .app { display: grid; grid-template-columns: 256px 1fr; min-height: 100vh; }

    .lateral {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--c-primario-osc);
      color: #cbd5e1;
      padding: 1.25rem .9rem;
    }
    .marca { display: flex; align-items: center; gap: .75rem; padding: 0 .5rem 1.25rem; text-decoration: none !important; }
    .logo {
      display: grid; place-items: center;
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, var(--c-primario));
      color: #fff; font-weight: 800; font-size: .95rem; letter-spacing: .02em;
      box-shadow: 0 4px 12px rgb(37 99 235 / .4);
    }
    .marca-texto { display: flex; flex-direction: column; line-height: 1.2; }
    .marca-texto strong { color: #fff; font-size: 1rem; }
    .marca-texto span { font-size: .75rem; color: #94a3b8; }

    .menu { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; }
    .menu-titulo {
      padding: 1rem .75rem .4rem;
      font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
      color: #64748b;
    }
    .menu a {
      display: flex; align-items: center; gap: .7rem;
      padding: .55rem .75rem; border-radius: 8px;
      color: #cbd5e1; font-size: .9rem; font-weight: 500;
      text-decoration: none !important;
      transition: background .15s, color .15s;
    }
    .menu a app-icono { font-size: 1.1rem; color: #94a3b8; }
    .menu a:hover { background: rgb(255 255 255 / .06); color: #fff; }
    .menu a.activo { background: rgb(59 130 246 / .18); color: #fff; }
    .menu a.activo app-icono { color: #93c5fd; }

    .perfil {
      display: flex; align-items: center; gap: .65rem;
      padding: .75rem .6rem; margin-top: .75rem;
      border-top: 1px solid rgb(255 255 255 / .08);
    }
    .avatar {
      display: grid; place-items: center; flex: none;
      width: 36px; height: 36px; border-radius: 50%;
      background: #1e293b; color: #e2e8f0; font-size: .8rem; font-weight: 700;
      border: 1px solid rgb(255 255 255 / .12);
    }
    .perfil-texto { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1.25; }
    .perfil-texto strong { color: #f1f5f9; font-size: .85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rol {
      align-self: flex-start; margin-top: .15rem; padding: .05rem .45rem; border-radius: 99px;
      font-size: .68rem; font-weight: 700; letter-spacing: .02em;
      background: rgb(148 163 184 / .18); color: #cbd5e1;
    }
    .rol[data-rol="ADMIN"] { background: rgb(244 63 94 / .18); color: #fda4af; }
    .rol[data-rol="SOPORTE"] { background: rgb(59 130 246 / .2); color: #93c5fd; }
    .rol[data-rol="CONSULTA"] { background: rgb(34 197 94 / .16); color: #86efac; }
    .avatar[data-rol="ADMIN"] { background: #4c0519; border-color: #9f1239; color: #fecdd3; }
    .avatar[data-rol="SOPORTE"] { background: #172554; border-color: #1d4ed8; color: #bfdbfe; }
    .avatar[data-rol="CONSULTA"] { background: #052e16; border-color: #15803d; color: #bbf7d0; }
    .salir { color: #94a3b8; background: transparent; }
    .salir:hover { background: rgb(255 255 255 / .08); color: #fff; }

    .contenido { padding: 2rem 2.25rem 3rem; max-width: 1280px; width: 100%; }

    @media (max-width: 900px) {
      .app { grid-template-columns: 1fr; }
      .lateral { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .75rem 1rem; }
      .marca { padding: 0; }
      .menu { flex-direction: row; flex: 1; overflow-x: auto; }
      .menu-titulo { display: none; }
      .perfil { border-top: 0; margin-top: 0; padding: 0; }
      .perfil-texto { display: none; }
      .contenido { padding: 1.25rem 1rem 2rem; }
    }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);

  protected readonly iniciales = computed(() => {
    const nombre = this.auth.usuario()?.nombreCompleto ?? '';
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('');
  });
}
