import { Routes } from '@angular/router';

import { authGuard, rolGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        title: 'Inicio',
        loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
      },
      {
        path: 'edificios',
        title: 'Edificios',
        loadComponent: () => import('./pages/edificios/edificios-lista').then((m) => m.EdificiosLista),
      },
      {
        path: 'edificios/nuevo',
        title: 'Nuevo edificio',
        canActivate: [rolGuard('ADMIN')],
        loadComponent: () => import('./pages/edificios/edificio-form').then((m) => m.EdificioForm),
      },
      {
        path: 'edificios/:id',
        title: 'Editar edificio',
        canActivate: [rolGuard('ADMIN')],
        loadComponent: () => import('./pages/edificios/edificio-form').then((m) => m.EdificioForm),
      },
      {
        path: 'computadoras',
        title: 'Computadoras',
        loadComponent: () => import('./pages/computadoras/computadoras-lista').then((m) => m.ComputadorasLista),
      },
      {
        path: 'computadoras/nueva',
        title: 'Nueva computadora',
        canActivate: [rolGuard('ADMIN', 'SOPORTE')],
        loadComponent: () => import('./pages/computadoras/computadora-form').then((m) => m.ComputadoraForm),
      },
      {
        path: 'computadoras/:id',
        title: 'Editar computadora',
        canActivate: [rolGuard('ADMIN', 'SOPORTE')],
        loadComponent: () => import('./pages/computadoras/computadora-form').then((m) => m.ComputadoraForm),
      },
      {
        path: 'usuarios',
        title: 'Usuarios',
        canActivate: [rolGuard('ADMIN')],
        loadComponent: () => import('./pages/usuarios/usuarios-lista').then((m) => m.UsuariosLista),
      },
      {
        path: 'usuarios/nuevo',
        title: 'Nuevo usuario',
        canActivate: [rolGuard('ADMIN')],
        loadComponent: () => import('./pages/usuarios/usuario-form').then((m) => m.UsuarioForm),
      },
      {
        path: 'usuarios/:id',
        title: 'Editar usuario',
        canActivate: [rolGuard('ADMIN')],
        loadComponent: () => import('./pages/usuarios/usuario-form').then((m) => m.UsuarioForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
