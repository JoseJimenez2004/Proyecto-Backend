import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CatalogosService } from '../../core/catalogos.service';
import { ComputadorasService } from '../../core/computadoras.service';
import { mensajeError } from '../../core/errores';
import { ComputadoraRequest, Distribuidor, ESTADOS_EQUIPO, Edificio, TIPOS_EQUIPO } from '../../core/models';

@Component({
  selector: 'app-computadora-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ id() ? 'Editar computadora' : 'Nueva computadora' }}</h1>

    @if (error()) {
      <div class="alerta error">{{ error() }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="guardar()">
      <div class="tarjeta">
        <h2>Identificación</h2>
        <div class="rejilla">
          <div class="campo">
            <label for="inv">Número de inventario *</label>
            <input id="inv" formControlName="numInventario" maxlength="20" placeholder="ESCOM-00125" />
            @if (invalido('numInventario')) { <div class="error">Obligatorio</div> }
          </div>
          <div class="campo">
            <label for="serie">Número de serie *</label>
            <input id="serie" formControlName="numeroSerie" maxlength="50" />
            @if (invalido('numeroSerie')) { <div class="error">Obligatorio</div> }
          </div>
          <div class="campo">
            <label for="marca">Marca *</label>
            <input id="marca" formControlName="marca" maxlength="50" />
            @if (invalido('marca')) { <div class="error">Obligatoria</div> }
          </div>
          <div class="campo">
            <label for="modelo">Modelo *</label>
            <input id="modelo" formControlName="modelo" maxlength="60" />
            @if (invalido('modelo')) { <div class="error">Obligatorio</div> }
          </div>
          <div class="campo">
            <label for="tipo">Tipo de equipo *</label>
            <select id="tipo" formControlName="tipoEquipo">
              @for (t of tipos; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="campo">
            <label for="estado">Estado *</label>
            <select id="estado" formControlName="estado">
              @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
            </select>
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Hardware</h2>
        <div class="rejilla">
          <div class="campo">
            <label for="cpu">Procesador</label>
            <input id="cpu" formControlName="procesador" maxlength="80" />
          </div>
          <div class="campo">
            <label for="ram">Memoria RAM (GB)</label>
            <input id="ram" type="number" min="1" formControlName="memoriaRamGb" />
          </div>
          <div class="campo">
            <label for="disco">Disco principal (GB)</label>
            <input id="disco" type="number" min="1" formControlName="capacidadDiscoDuroGb" />
          </div>
          <div class="campo">
            <label for="disco2">Segundo disco (GB)</label>
            <input id="disco2" type="number" min="1" formControlName="capacidadSegundoDiscoDuroGb" />
          </div>
          <div class="campo">
            <label for="optica">Unidad óptica</label>
            <input id="optica" formControlName="unidadOptica" maxlength="30" placeholder="DVD-RW" />
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Compra y garantía</h2>
        <div class="rejilla">
          <div class="campo">
            <label for="dist">Distribuidor *</label>
            <select id="dist" formControlName="idDistribuidor">
              <option [ngValue]="null" disabled>Selecciona…</option>
              @for (d of distribuidores(); track d.id) { <option [ngValue]="d.id">{{ d.nombre }}</option> }
            </select>
            @if (invalido('idDistribuidor')) { <div class="error">Obligatorio</div> }
          </div>
          <div class="campo">
            <label for="fcompra">Fecha de compra *</label>
            <input id="fcompra" type="date" formControlName="fechaCompra" />
            @if (invalido('fechaCompra')) { <div class="error">Obligatoria</div> }
          </div>
          <div class="campo">
            <label for="fgarantia">Fin de garantía</label>
            <input id="fgarantia" type="date" formControlName="fechaFinGarantia" />
          </div>
          <div class="campo">
            <label for="costo">Costo de adquisición (MXN) *</label>
            <input id="costo" type="number" min="0" step="0.01" formControlName="costoAdquisicion" />
            @if (invalido('costoAdquisicion')) { <div class="error">Obligatorio, no negativo</div> }
          </div>
          <div class="campo">
            <label for="reemplazo">Costo de reemplazo (MXN)</label>
            <input id="reemplazo" type="number" min="0" step="0.01" formControlName="costoReemplazo" />
          </div>
          <div class="campo">
            <label for="intervalo">Renovar cada (meses)</label>
            <input id="intervalo" type="number" min="1" formControlName="intervaloActualizacionMeses" />
          </div>
        </div>
      </div>

      <div class="tarjeta">
        <h2>Ubicación</h2>
        <div class="rejilla">
          <div class="campo">
            <label for="edif">Edificio / espacio *</label>
            <select id="edif" formControlName="idEdificio">
              <option [ngValue]="null" disabled>Selecciona…</option>
              @for (e of edificios(); track e.id) { <option [ngValue]="e.id">{{ e.clave }} · {{ e.nombre }}</option> }
            </select>
            @if (invalido('idEdificio')) { <div class="error">Obligatorio</div> }
          </div>
          <div class="campo">
            <label for="ubic">Ubicación específica</label>
            <input id="ubic" formControlName="ubicacionEspecifica" maxlength="60" placeholder="Mesa 1, lugar 3" />
          </div>
        </div>
      </div>

      <div class="barra">
        <button type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : 'Guardar' }}</button>
        <a class="boton secundario" routerLink="/computadoras">Cancelar</a>
      </div>
    </form>
  `,
})
export class ComputadoraForm implements OnInit {
  /** Parámetro :id de la ruta (vacío al crear). */
  readonly id = input<string>();

  private readonly servicio = inject(ComputadorasService);
  private readonly catalogos = inject(CatalogosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly tipos = TIPOS_EQUIPO;
  protected readonly estados = ESTADOS_EQUIPO;
  protected readonly edificios = signal<Edificio[]>([]);
  protected readonly distribuidores = signal<Distribuidor[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    numInventario: ['', [Validators.required, Validators.maxLength(20)]],
    numeroSerie: ['', [Validators.required, Validators.maxLength(50)]],
    marca: ['', [Validators.required, Validators.maxLength(50)]],
    modelo: ['', [Validators.required, Validators.maxLength(60)]],
    tipoEquipo: ['Escritorio', Validators.required],
    procesador: this.fb.control<string | null>(null),
    memoriaRamGb: this.fb.control<number | null>(null, Validators.min(1)),
    capacidadDiscoDuroGb: this.fb.control<number | null>(null, Validators.min(1)),
    capacidadSegundoDiscoDuroGb: this.fb.control<number | null>(null, Validators.min(1)),
    unidadOptica: this.fb.control<string | null>(null),
    fechaCompra: ['', Validators.required],
    costoAdquisicion: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    costoReemplazo: this.fb.control<number | null>(null, Validators.min(0)),
    intervaloActualizacionMeses: this.fb.control<number | null>(null, Validators.min(1)),
    fechaFinGarantia: this.fb.control<string | null>(null),
    estado: ['Activo', Validators.required],
    ubicacionEspecifica: this.fb.control<string | null>(null),
    idEdificio: this.fb.control<number | null>(null, Validators.required),
    idDistribuidor: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    const alFallar = (e: unknown) => this.error.set(mensajeError(e));
    this.catalogos.edificios().subscribe({ next: (l) => this.edificios.set(l), error: alFallar });
    this.catalogos.distribuidores().subscribe({ next: (l) => this.distribuidores.set(l), error: alFallar });

    const id = this.id();
    if (id) {
      this.servicio.obtener(Number(id)).subscribe({
        next: (c) => this.form.patchValue(c),
        error: alFallar,
      });
    }
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

    const valor = this.form.getRawValue();
    // Los campos de texto opcionales vacíos se envían como null
    const vacioANull = (s: string | null) => (s && s.trim() !== '' ? s.trim() : null);
    const datos: ComputadoraRequest = {
      ...valor,
      procesador: vacioANull(valor.procesador),
      unidadOptica: vacioANull(valor.unidadOptica),
      ubicacionEspecifica: vacioANull(valor.ubicacionEspecifica),
      fechaFinGarantia: vacioANull(valor.fechaFinGarantia),
    };

    const id = this.id();
    const peticion = id ? this.servicio.actualizar(Number(id), datos) : this.servicio.crear(datos);
    peticion.subscribe({
      next: () => this.router.navigate(['/computadoras']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
