import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CatalogosService } from '../../core/catalogos.service';
import { mensajeError } from '../../core/errores';
import { Experto, ROLES, Rol, UsuarioRequest } from '../../core/models';
import { UsuariosService } from '../../core/usuarios.service';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink, Icono],
  template: `
    <header class="pagina-encabezado">
      <div>
        <div class="migas"><a routerLink="/usuarios">Usuarios</a> / {{ id() ? 'Editar' : 'Nuevo' }}</div>
        <h1>{{ id() ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
        <p>Los campos marcados con * son obligatorios.</p>
      </div>
    </header>

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <form class="panel" [formGroup]="form" (ngSubmit)="guardar()">
      <section class="form-seccion">
        <div>
          <h2>Cuenta</h2>
          <p>Datos para iniciar sesión.</p>
        </div>
        <div class="rejilla-campos">
          <div class="campo">
            <label for="username">Usuario *</label>
            <input id="username" formControlName="username" maxlength="50" autocomplete="off" />
            @if (invalido('username')) { <span class="error">Obligatorio</span> }
          </div>
          <div class="campo">
            <label for="password">Contraseña {{ id() ? '' : '*' }}</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password"
                   [placeholder]="id() ? 'Dejar vacío para no cambiarla' : 'Mínimo 8 caracteres'" />
            @if (invalido('password')) { <span class="error">Mínimo 8 caracteres</span> }
          </div>
          <div class="campo completo">
            <label class="casilla"><input type="checkbox" formControlName="activo" /> Cuenta activa (puede iniciar sesión)</label>
          </div>
        </div>
      </section>

      <section class="form-seccion">
        <div>
          <h2>Datos personales</h2>
          <p>Nombre y correo institucional.</p>
        </div>
        <div class="rejilla-campos">
          <div class="campo completo">
            <label for="nombre">Nombre completo *</label>
            <input id="nombre" formControlName="nombreCompleto" maxlength="120" />
            @if (invalido('nombreCompleto')) { <span class="error">Obligatorio</span> }
          </div>
          <div class="campo completo">
            <label for="email">Correo *</label>
            <input id="email" type="email" formControlName="email" maxlength="100" placeholder="usuario@escom.ipn.mx" />
            @if (invalido('email')) { <span class="error">Correo inválido</span> }
          </div>
        </div>
      </section>

      <section class="form-seccion">
        <div>
          <h2>Rol y permisos</h2>
          <p>Define qué puede hacer el usuario en el sistema.</p>
        </div>
        <div class="roles">
          @for (r of roles; track r.clave) {
            <label class="rol-opcion" [class.elegido]="form.controls.rol.value === r.clave">
              <input type="radio" formControlName="rol" [value]="r.clave" />
              <span>
                <strong>{{ r.nombre }}</strong>
                <small>{{ r.descripcion }}</small>
              </span>
            </label>
          }
          <div class="campo">
            <label for="experto">Experto de soporte vinculado <span class="opcional">(opcional)</span></label>
            <select id="experto" formControlName="idExperto">
              <option [ngValue]="null">Ninguno</option>
              @for (e of expertos(); track e.id) {
                <option [ngValue]="e.id">{{ e.numEmpleado }} · {{ e.primerNombre }} {{ e.apellidoPaterno }} ({{ e.departamento }})</option>
              }
            </select>
            <span class="ayuda">Útil para usuarios de soporte: enlaza la cuenta con su registro de experto.</span>
          </div>
        </div>
      </section>

      <div class="form-acciones">
        <a class="btn btn-secundario" routerLink="/usuarios">Cancelar</a>
        <button class="btn btn-primario" type="submit" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar usuario' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .roles { display: grid; gap: .75rem; }
    .rol-opcion {
      display: flex; gap: .75rem; align-items: flex-start; padding: .85rem 1rem;
      border: 1px solid var(--c-borde); border-radius: var(--radio); cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .rol-opcion:hover { border-color: var(--c-borde-fuerte); }
    .rol-opcion.elegido { border-color: var(--c-primario); background: var(--c-primario-claro); }
    .rol-opcion input { margin-top: .2rem; accent-color: var(--c-primario); }
    .rol-opcion span { display: flex; flex-direction: column; }
    .rol-opcion small { color: var(--c-texto-2); font-size: .82rem; }
  `,
})
export class UsuarioForm implements OnInit {
  /** Parámetro :id de la ruta (vacío al crear). */
  readonly id = input<string>();

  private readonly servicio = inject(UsuariosService);
  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly roles = (Object.keys(ROLES) as Rol[]).map((clave) => ({ clave, ...ROLES[clave] }));
  protected readonly expertos = signal<Experto[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: [''],
    nombreCompleto: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    rol: ['CONSULTA' as Rol, Validators.required],
    idExperto: this.fb.control<number | null>(null),
    activo: [true],
  });

  ngOnInit(): void {
    const alFallar = (e: unknown) => this.error.set(mensajeError(e));
    this.catalogos.expertos().subscribe({ next: (l) => this.expertos.set(l), error: alFallar });

    const id = this.id();
    if (id) {
      // Al editar, la contraseña es opcional (vacía = conservar la actual)
      this.form.controls.password.setValidators([Validators.minLength(8)]);
      this.servicio.obtener(Number(id)).subscribe({
        next: (u) =>
          this.form.patchValue({
            username: u.username,
            nombreCompleto: u.nombreCompleto,
            email: u.email,
            rol: u.roles[0] ?? 'CONSULTA',
            idExperto: u.idExperto,
            activo: u.activo,
          }),
        error: alFallar,
      });
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  protected invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.touched && control.invalid;
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const datos: UsuarioRequest = {
      username: v.username.trim(),
      password: v.password ? v.password : null,
      nombreCompleto: v.nombreCompleto.trim(),
      email: v.email.trim(),
      idExperto: v.idExperto,
      roles: [v.rol],
      activo: v.activo,
    };

    const id = this.id();
    const peticion = id ? this.servicio.actualizar(Number(id), datos) : this.servicio.crear(datos);
    peticion.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
