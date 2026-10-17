import { sql } from "./db";
import { esAdministrador, type Usuario } from "./sesion";
import type { Gestion, Solicitud } from "./catalogos";

// Las fechas se devuelven como texto con el formato de la versión en
// Streamlit: las columnas son "timestamp without time zone" (hora de Bogotá)
// y convertirlas a Date las correría según la zona del servidor.
const FORMATO = "YYYY-MM-DD HH24:MI:SS";

// Operador: solo las solicitudes de los POD que tiene asignados.
const filtroPods = (usuario: string) => sql`
  AND EXISTS (
    SELECT 1
    FROM public."PODS" p
    JOIN public."USUARIOS_PODS" up ON up."ID_POD" = p."ID_POD"
    WHERE up."USUARIO" = ${usuario}
      AND UPPER(TRIM(p."NOMBRE")) = UPPER(TRIM(s."PRODUCT_OWNER"))
  )`;

/** Solicitudes abiertas (sin código ni fecha de cierre) según el perfil. */
export async function obtenerSolicitudes(u: Usuario): Promise<Solicitud[]> {
  return sql<Solicitud[]>`
    SELECT
      s."ID_SOLICITUD",
      s."TITULO",
      to_char(s."FECHA_APERTURA", ${FORMATO}) AS "FECHA_APERTURA",
      s."SUBSERVICIO_AFECTADO",
      s."PRODUCT_OWNER",
      s."STATUS",
      s."ASIGNADO_A",
      s."NOMBRE_ASIGNATARIO",
      s."CORREO_ASIGNATARIO",
      to_char(s."FECHA_CIERRE", ${FORMATO}) AS "FECHA_CIERRE",
      s."CODIGO_CIERRE"
    FROM public."SOLICITUDES" s
    WHERE s."CODIGO_CIERRE" IS NULL
      AND s."FECHA_CIERRE" IS NULL
      ${esAdministrador(u) ? sql`` : filtroPods(u.usuario)}
    ORDER BY s."FECHA_APERTURA" ASC
  `;
}

/** ¿El usuario puede ver y gestionar esta solicitud? */
export async function puedeVerSolicitud(u: Usuario, id: string): Promise<boolean> {
  const filas = await sql`
    SELECT 1
    FROM public."SOLICITUDES" s
    WHERE s."ID_SOLICITUD" = ${id}
      ${esAdministrador(u) ? sql`` : filtroPods(u.usuario)}
    LIMIT 1
  `;
  return filas.length > 0;
}

export async function obtenerGestiones(id: string): Promise<Gestion[]> {
  return sql<Gestion[]>`
    SELECT
      to_char("FECHA_GESTION", ${FORMATO}) AS "FECHA_GESTION",
      "OBSERVACION",
      "USUARIO_REGISTRO",
      to_char("FECHA_REGISTRO", ${FORMATO}) AS "FECHA_REGISTRO"
    FROM public."GESTIONES"
    WHERE "ID_SOLICITUD" = ${id}
    ORDER BY "FECHA_GESTION" DESC
  `;
}
