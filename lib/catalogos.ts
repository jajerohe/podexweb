// Tipos y listas compartidos entre el servidor y las pantallas.

export type Solicitud = {
  ID_SOLICITUD: string;
  TITULO: string | null;
  FECHA_APERTURA: string | null;
  SUBSERVICIO_AFECTADO: string | null;
  PRODUCT_OWNER: string | null;
  STATUS: string | null;
  ASIGNADO_A: string | null;
  NOMBRE_ASIGNATARIO: string | null;
  CORREO_ASIGNATARIO: string | null;
  FECHA_CIERRE: string | null;
  CODIGO_CIERRE: string | null;
};

export type Gestion = {
  FECHA_GESTION: string | null;
  OBSERVACION: string | null;
  USUARIO_REGISTRO: string | null;
  FECHA_REGISTRO: string | null;
};

export const ESTADOS = [
  "Cancelled",
  "Categorize",
  "Fulfilled",
  "In Progress",
  "Open",
  "Pending",
  "Pending Customer",
  "Pending Force",
  "Pending Parent Incident",
  "Pending Vendor",
  "Planned",
  "Ready",
  "Resolved",
  "Suspended",
  "Work In Progress",
];

export const CODIGOS_CIERRE = [
  "Cancelado por incumplimiento de politicas",
  "Cancelado por duplicidad",
  "Cancelado por el usuario",
  "Cerrado por automatización",
  "Resuelto por soporte funcional",
  "Resuelto por soporte técnico",
];
