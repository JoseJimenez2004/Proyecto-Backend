import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/errores';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Icono],
  template: `
    <div class="login">
      <!-- Panel de marca -->
      <section class="marca">
        <div class="marca-sup">
          <span class="logo">IE</span>
          <span>Instituto Politécnico Nacional · ESCOM</span>
        </div>

        <div class="marca-centro">
          <h1>Inventario y gestión de equipo de cómputo</h1>
          <p>Controla en un solo lugar los equipos, su software, licencias, garantías y mantenimientos.</p>

          <ul>
            <li><app-icono nombre="equipo" /> Inventario de hardware por edificio y laboratorio</li>
            <li><app-icono nombre="escudo" /> Licencias y garantías siempre a la vista</li>
            <li><app-icono nombre="reloj" /> Historial de mantenimientos por equipo</li>
          </ul>
        </div>

        <small class="marca-pie">Web client and backend development frameworks · 7CM2</small>
      </section>

      <!-- Formulario -->
      <section class="formulario">
        <form [formGroup]="form" (ngSubmit)="entrar()">
          <header>
            <h2>Iniciar sesión</h2>
            <p>Ingresa con tu usuario institucional.</p>
          </header>

          @if (error()) {
            <div class="alerta alerta-error" role="alert">
              <app-icono nombre="alerta" />
              <span>{{ error() }}</span>
            </div>
          }

          <div class="campo">
            <label for="username">Usuario</label>
            <input id="username" formControlName="username" autocomplete="username" placeholder="usuario" />
          </div>
          <div class="campo">
            <label for="password">Contraseña</label>
            <input id="password" type="password" formControlName="password"
                   autocomplete="current-password" placeholder="••••••••" />
          </div>

          <button class="btn btn-primario btn-bloque" type="submit" [disabled]="cargando()">
            {{ cargando() ? 'Verificando…' : 'Entrar' }}
          </button>

          <div class="demo">
            <span>Cuentas de prueba</span>
            <div class="demo-cuentas">
              @for (c of cuentas; track c.usuario) {
                <button type="button" class="demo-cuenta" (click)="usar(c.usuario, c.clave)">
                  <strong>{{ c.usuario }}</strong>
                  <small>{{ c.rol }}</small>
                </button>
              }
            </div>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: `
    .login { display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }

    .marca {
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 2.5rem 3rem;
      color: #e2e8f0;
      background:
        radial-gradient(1200px 500px at -10% -10%, rgb(59 130 246 / .35), transparent 60%),
        radial-gradient(800px 400px at 110% 110%, rgb(138 21 56 / .35), transparent 60%),
        var(--c-primario-osc);
    }
    .marca-sup { display: flex; align-items: center; gap: .75rem; font-size: .85rem; color: #cbd5e1; }
    .logo {
      display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, var(--c-primario)); color: #fff; font-weight: 800;
    }
    .marca-centro { max-width: 460px; }
    .marca-centro h1 { color: #fff; font-size: 2.1rem; line-height: 1.15; font-weight: 750; letter-spacing: -.02em; }
    .marca-centro p { margin-top: 1rem; color: #cbd5e1; font-size: 1.02rem; }
    .marca-centro ul { list-style: none; padding: 0; margin: 2rem 0 0; display: grid; gap: .9rem; }
    .marca-centro li { display: flex; align-items: center; gap: .75rem; color: #e2e8f0; font-size: .95rem; }
    .marca-centro li app-icono {
      width: 34px; height: 34px; padding: 8px; border-radius: 9px;
      background: rgb(255 255 255 / .08); color: #93c5fd;
    }
    .marca-pie { color: #64748b; }

    .formulario { display: grid; place-items: center; padding: 2rem; background: var(--c-superficie); }
    form { width: 100%; max-width: 380px; display: grid; gap: 1.1rem; }
    header h2 { font-size: 1.6rem; font-weight: 700; letter-spacing: -.01em; }
    header p { color: var(--c-texto-2); margin-top: .3rem; }
    form .alerta { margin-bottom: 0; }

    .demo { margin-top: .5rem; padding-top: 1.1rem; border-top: 1px solid var(--c-borde); }
    .demo > span { font-size: .78rem; color: var(--c-texto-3); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
    .demo-cuentas { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin-top: .6rem; }
    .demo-cuenta {
      display: flex; flex-direction: column; align-items: flex-start; gap: .1rem;
      padding: .55rem .7rem; border: 1px solid var(--c-borde); border-radius: var(--radio-sm);
      background: var(--c-superficie-2); font: inherit; cursor: pointer; text-align: left;
      transition: border-color .15s, background .15s;
    }
    .demo-cuenta:hover { border-color: var(--c-primario); background: var(--c-primario-claro); }
    .demo-cuenta strong { font-size: .85rem; }

    @media (max-width: 900px) {
      .login { grid-template-columns: 1fr; }
      .marca { padding: 1.5rem; gap: 1.5rem; }
      .marca-centro h1 { font-size: 1.5rem; }
      .marca-centro ul, .marca-pie { display: none; }
    }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly cuentas = [
    { usuario: 'admin', clave: 'Admin123!', rol: 'Administrador' },
    { usuario: 'soporte', clave: 'Soporte123!', rol: 'Soporte' },
    { usuario: 'consulta', clave: 'Consulta123!', rol: 'Consulta' },
  ];

  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected usar(usuario: string, clave: string): void {
    this.form.setValue({ username: usuario, password: clave });
    this.error.set(null);
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }
}
