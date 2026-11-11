import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="centro">
      <form class="tarjeta" [formGroup]="form" (ngSubmit)="entrar()">
        <h1>Inventario de Equipo de Cómputo</h1>
        <p class="sub">ESCOM · Inicia sesión para continuar</p>

        @if (error()) {
          <div class="alerta error">{{ error() }}</div>
        }

        <div class="campo">
          <label for="username">Usuario</label>
          <input id="username" formControlName="username" autocomplete="username" />
        </div>
        <div class="campo">
          <label for="password">Contraseña</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>

        <button type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Entrando…' : 'Entrar' }}
        </button>

        <p class="ayuda">Usuarios de prueba: admin / Admin123!, soporte / Soporte123!, consulta / Consulta123!</p>
      </form>
    </div>
  `,
  styles: `
    .centro { min-height: 100vh; display: grid; place-items: center; padding: 1rem; }
    form { width: 100%; max-width: 380px; display: grid; gap: .9rem; }
    h1 { font-size: 1.25rem; margin: 0; color: var(--azul); }
    .sub { margin: -.5rem 0 .25rem; color: var(--gris); font-size: .9rem; }
    .ayuda { font-size: .75rem; color: var(--gris); margin: 0; }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

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
