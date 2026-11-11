import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { LoginResponse, Rol, Usuario } from './models';

interface Sesion {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

const CLAVE_SESION = 'inventario-escom.sesion';

/** sessionStorage puede no estar disponible (modo privado, iframes): se protege con try/catch. */
function leerSesion(): Sesion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_SESION);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion: Sesion | null): void {
  try {
    if (sesion) {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } else {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  } catch {
    // sin almacenamiento: la sesión vive solo en memoria
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesion = signal<Sesion | null>(leerSesion());

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);

  token(): string | null {
    return this.sesion()?.token ?? null;
  }

  estaAutenticado(): boolean {
    const s = this.sesion();
    return !!s && new Date(s.expiraEn).getTime() > Date.now();
  }

  tieneRol(...roles: Rol[]): boolean {
    const usuario = this.usuario();
    return !!usuario && usuario.roles.some((r) => roles.includes(r));
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
      tap((r) => {
        const sesion: Sesion = { token: r.token, expiraEn: r.expiraEn, usuario: r.usuario };
        guardarSesion(sesion);
        this.sesion.set(sesion);
      }),
      map(() => undefined),
    );
  }

  logout(): void {
    guardarSesion(null);
    this.sesion.set(null);
    this.router.navigate(['/login']);
  }
}
