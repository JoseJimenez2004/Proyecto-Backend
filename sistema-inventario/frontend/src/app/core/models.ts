// Tipos que reflejan los DTO del backend.

export type Rol = 'ADMIN' | 'SOPORTE' | 'CONSULTA';

export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  activo: boolean;
  idExperto: number | null;
  roles: Rol[];
}

export interface UsuarioRequest {
  username: string;
  password: string | null;
  nombreCompleto: string;
  email: string;
  idExperto: number | null;
  roles: Rol[];
  activo: boolean;
}

export interface Experto {
  id: number;
  numEmpleado: string;
  primerNombre: string;
  apellidoPaterno: string;
  departamento: string;
}

/** Nombre y descripción de cada rol para mostrar en la interfaz. */
export const ROLES: Record<Rol, { nombre: string; descripcion: string }> = {
  ADMIN: {
    nombre: 'Administrador',
    descripcion: 'Acceso total: catálogos, inventario y usuarios del sistema.',
  },
  SOPORTE: {
    nombre: 'Soporte técnico',
    descripcion: 'Registra y actualiza computadoras. Consulta los catálogos.',
  },
  CONSULTA: {
    nombre: 'Consulta',
    descripcion: 'Solo lectura: consulta el inventario y los catálogos.',
  },
};

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEn: string;
  usuario: Usuario;
}

/** Página de Spring Data serializada en modo VIA_DTO. */
export interface Pagina<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

export const TIPOS_ESPACIO = ['Laboratorio', 'Cubiculo', 'Aula', 'Oficina', 'Almacen'] as const;

export interface Edificio {
  id: number;
  clave: string;
  nombre: string;
  tipoEspacio: string;
  direccion: string | null;
  numeroNiveles: number | null;
  activo: boolean;
}

export type EdificioRequest = Omit<Edificio, 'id'>;

export interface Distribuidor {
  id: number;
  nombre: string;
  calle: string | null;
  ciudad: string;
  estado: string;
  codigoPostal: string | null;
  telefono: string;
  fechaUltimoPedido: string | null;
  montoTotalCompra: number;
  numeroTotalPedidos: number;
}

export const TIPOS_EQUIPO = ['Escritorio', 'Portatil', 'All-in-One', 'Servidor'] as const;
export const ESTADOS_EQUIPO = ['Activo', 'En reparacion', 'Resguardo', 'Baja'] as const;

export interface ComputadoraRequest {
  numInventario: string;
  numeroSerie: string;
  marca: string;
  modelo: string;
  tipoEquipo: string;
  procesador: string | null;
  memoriaRamGb: number | null;
  capacidadDiscoDuroGb: number | null;
  capacidadSegundoDiscoDuroGb: number | null;
  unidadOptica: string | null;
  fechaCompra: string;
  costoAdquisicion: number | null;
  costoReemplazo: number | null;
  intervaloActualizacionMeses: number | null;
  fechaFinGarantia: string | null;
  estado: string;
  ubicacionEspecifica: string | null;
  idEdificio: number | null;
  idDistribuidor: number | null;
}

export interface Computadora extends ComputadoraRequest {
  id: number;
  enGarantia: boolean;
}
