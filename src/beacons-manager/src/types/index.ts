// Tipos para la aplicación de beacons
export interface InfoBeacon {
  id?: number;
  numSensor?: string;
  numsensor?: string; // Para compatibilidad con la DB
  codSensor?: string;
  codsensor?: string; // Para compatibilidad con la DB
  idenSensor?: string;
  idensensor?: string; // Para compatibilidad con la DB
  x?: number;
  y?: number;
  z?: number;
  unidades?: string;
  areaId?: string; // ID de la área asociada (xata_id)
  nivel?: number; // Mantener para compatibilidad
  created_at?: string;
  updated_at?: string;
}

export interface BeaconFilters {
  nivel?: number;
  codSensor?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id?: number;
  xata_id?: string; // ID de Xata
  numero: number;
  nombre: string;
  codigo: string; // Código único generado automáticamente
  descripcion?: string;
  ubicacion: string; // CIT, Biblioteca, Cafetería, etc.
  color: string; // Color hexadecimal para la UI
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AreaFormData {
  numero: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  ubicacion: string;
  color: string;
  activo: boolean;
}