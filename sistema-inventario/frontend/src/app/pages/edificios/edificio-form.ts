import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CatalogosService } from '../../core/catalogos.service';
import { mensajeError } from '../../core/errores';
import { EdificioRequest, TIPOS_ESPACIO } from '../../core/models';
import { Icono } from '../../shared/icono';

@Component({
  selector: 'app-edificio-form',
  imports: [ReactiveFormsModule, RouterLink, Icono],
  template: `
    <header class="pagina-encabezado">
      <div>
        <div class="migas"><a routerLink="/edificios">Edificios y espacios</a> / {{ id() ? 'Editar' : 'Nuevo' }}</div>
        <h1>{{ id() ? 'Editar espacio' : 'Nuevo espacio' }}</h1>
        <p>Los campos marcados con * son obligatorios.</p>
      </div>
    </header>

    @if (error()) {
      <div class="alerta alerta-error"><app-icono nombre="alerta" /><span>{{ error() }}</span></div>
    }

    <form class="panel" [formGroup]="form" (ngSubmit)="guardar()">
      <section class="form-seccion">
        <div>
          <h2>Identificación</h2>
          <p>Clave institucional corta y nombre completo del espacio.</p>
        </div>
        <div class="rejilla-campos">
          <div class="campo">
            <label for="clave">Clave *</label>
            <input id="clave" formControlName="clave" maxlength="10" placeholder="LAB-C1" />
            @if (form.controls.clave.touched && form.controls.clave.invalid) {
              <span class="error">Obligatoria, máximo 10 caracteres</span>
            }
          </div>
          <div class="campo">
            <label for="tipo">Tipo de espacio *</label>
            <select id="tipo" formControlName="tipoEspacio">
              @for (t of tipos; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="campo completo">
            <label for="nombre">Nombre *</label>
            <input id="nombre" formControlName="nombre" maxlength="80" placeholder="Laboratorio de Cómputo 1" />
            @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
              <span class="error">Obligatorio</span>
            }
          </div>
        </div>
      </section>

      <section class="form-seccion">
        <div>
          <h2>Ubicación</h2>
          <p>Referencia dentro del campus y número de niveles del edificio.</p>
        </div>
        <div class="rejilla-campos">
          <div class="campo completo">
            <label for="direccion">Dirección / referencia <span class="opcional">(opcional)</span></label>
            <input id="direccion" formControlName="direccion" maxlength="150" placeholder="Edificio C, planta baja" />
          </div>
          <div class="campo">
            <label for="niveles">Número de niveles <span class="opcional">(opcional)</span></label>
            <input id="niveles" type="number" min="1" formControlName="numeroNiveles" />
            @if (form.controls.numeroNiveles.invalid) { <span class="error">Debe ser mayor a 0</span> }
          </div>
          <div class="campo">
            <label>Estado</label>
            <label class="casilla"><input type="checkbox" formControlName="activo" /> Espacio en uso</label>
          </div>
        </div>
      </section>

      <div class="form-acciones">
        <a class="btn btn-secundario" routerLink="/edificios">Cancelar</a>
        <button class="btn btn-primario" type="submit" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar espacio' }}
        </button>
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
