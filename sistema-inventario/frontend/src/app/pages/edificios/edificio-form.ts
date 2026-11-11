import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CatalogosService } from '../../core/catalogos.service';
import { mensajeError } from '../../core/errores';
import { EdificioRequest, TIPOS_ESPACIO } from '../../core/models';

@Component({
  selector: 'app-edificio-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ id() ? 'Editar espacio' : 'Nuevo espacio' }}</h1>

    @if (error()) {
      <div class="alerta error">{{ error() }}</div>
    }

    <form class="tarjeta" [formGroup]="form" (ngSubmit)="guardar()">
      <div class="rejilla">
        <div class="campo">
          <label for="clave">Clave *</label>
          <input id="clave" formControlName="clave" maxlength="10" placeholder="LAB-C1" />
          @if (form.controls.clave.touched && form.controls.clave.invalid) {
            <div class="error">Obligatoria, máximo 10 caracteres</div>
          }
        </div>
        <div class="campo">
          <label for="nombre">Nombre *</label>
          <input id="nombre" formControlName="nombre" maxlength="80" />
          @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
            <div class="error">Obligatorio</div>
          }
        </div>
        <div class="campo">
          <label for="tipo">Tipo de espacio *</label>
          <select id="tipo" formControlName="tipoEspacio">
            @for (t of tipos; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label for="niveles">Número de niveles</label>
          <input id="niveles" type="number" min="1" formControlName="numeroNiveles" />
        </div>
        <div class="campo" style="grid-column: 1 / -1">
          <label for="direccion">Dirección / referencia</label>
          <input id="direccion" formControlName="direccion" maxlength="150" />
        </div>
        <div class="campo">
          <label><input type="checkbox" formControlName="activo" /> Espacio en uso</label>
        </div>
      </div>

      <div class="barra" style="margin-top: 1rem; margin-bottom: 0">
        <button type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : 'Guardar' }}</button>
        <a class="boton secundario" routerLink="/edificios">Cancelar</a>
      </div>
    </form>
  `,
})
export class EdificioForm implements OnInit {
  /** Parámetro :id de la ruta (vacío al crear). */
  readonly id = input<string>();

  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly tipos = TIPOS_ESPACIO;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    clave: ['', [Validators.required, Validators.maxLength(10)]],
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    tipoEspacio: ['Laboratorio', Validators.required],
    direccion: this.fb.control<string | null>(null),
    numeroNiveles: this.fb.control<number | null>(null, Validators.min(1)),
    activo: [true],
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.catalogos.edificio(Number(id)).subscribe({
        next: (e) => this.form.patchValue(e),
        error: (err) => this.error.set(mensajeError(err)),
      });
    }
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    const datos: EdificioRequest = this.form.getRawValue();
    const id = this.id();
    const peticion = id
      ? this.catalogos.actualizarEdificio(Number(id), datos)
      : this.catalogos.crearEdificio(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/edificios']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
