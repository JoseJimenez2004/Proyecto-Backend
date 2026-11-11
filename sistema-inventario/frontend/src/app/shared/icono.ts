import { Component, input } from '@angular/core';

export type NombreIcono =
  | 'inicio' | 'equipo' | 'edificio' | 'salir' | 'mas' | 'buscar' | 'editar' | 'eliminar'
  | 'alerta' | 'escudo' | 'anterior' | 'siguiente' | 'chip' | 'caja' | 'reloj' | 'usuario';

/**
 * Íconos SVG de trazo, propios del proyecto (sin librerías externas).
 * Uso: <app-icono nombre="equipo" />  ·  toma el color y tamaño del texto (currentColor / 1em).
 */
@Component({
  selector: 'app-icono',
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (nombre()) {
      @case ('inicio') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>
      }
      @case ('equipo') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="12.5" rx="2" /><path d="M8 20.5h8M12 16.5v4" /></svg>
      }
      @case ('edificio') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.5" width="16" height="19" rx="1.5" /><path d="M9 21.5v-4h6v4M8.5 6.5h1.5M14 6.5h1.5M8.5 10.5h1.5M14 10.5h1.5M8.5 14h1.5M14 14h1.5" /></svg>
      }
      @case ('salir') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
      }
      @case ('mas') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      }
      @case ('buscar') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      }
      @case ('editar') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
      }
      @case ('eliminar') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>
      }
      @case ('alerta') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5M12 16.2v.3" /></svg>
      }
      @case ('escudo') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s8-3.8 8-9.8V5l-8-2.8L4 5v6.7c0 6 8 9.8 8 9.8Z" /><path d="m9 12 2 2 4-4" /></svg>
      }
      @case ('anterior') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      }
      @case ('siguiente') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      }
      @case ('chip') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9.5 9.5h5v5h-5zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
      }
      @case ('caja') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>
      }
      @case ('reloj') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5l3 2" /></svg>
      }
      @case ('usuario') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
      }
    }
  `,
  styles: `
    :host { display: inline-flex; width: 1.15em; height: 1.15em; flex: none; vertical-align: middle; }
    svg { width: 100%; height: 100%; }
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
}
