"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { sql } from "@/lib/db";
import { borrarSesion, crearSesion, obtenerSesion } from "@/lib/sesion";
import { obtenerGestiones, puedeVerSolicitud } from "@/lib/solicitudes";
import { CODIGOS_CIERRE, ESTADOS, type Gestion } from "@/lib/catalogos";
import { NOMBRE_SISTEMA } from "@/lib/marca";

export type Resultado = { ok: true; mensaje: string } | { ok: false; error: string };

// ============================================================
// INICIO Y CIERRE DE SESIÓN
// ============================================================

export async function iniciarSesion(_previo: string | null, datos: FormData): Promise<string | null> {
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  if (!email || !password) return "⚠️ Debe ingresar el correo electrónico y la contraseña.";

  let usuario;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return "❌ Correo o contraseña incorrectos, o no fue posible autenticar.";

    const filas = await sql<{ USUARIO: string; PERFIL: string | null; NOMBRE: string | null }[]>`
      SELECT "USUARIO", "PERFIL", "NOMBRE"
      FROM public."USUARIOS"
      WHERE "AUTH_USER_ID" = ${data.user.id}
      LIMIT 1
    `;
    if (!filas.length) {
      return `❌ El usuario está autenticado en Supabase, pero no está registrado en ${NOMBRE_SISTEMA}.`;
    }
    usuario = filas[0];
  } catch (e) {
    console.error(e);
    return "❌ Correo o contraseña incorrectos, o no fue posible autenticar.";
  }

  await crearSesion({
    usuario: usuario.USUARIO,
    perfil: usuario.PERFIL ?? "",
    nombre: usuario.NOMBRE ?? "",
    email,
  });
  redirect("/solicitudes");
}

export async function cerrarSesion() {
  await borrarSesion();
  redirect("/login");
}

// ============================================================
// SOLICITUDES
// ============================================================

const escrituraPermitida = () => process.env.PODEX_ESCRITURA === "1";
const SOLO_LECTURA = "🔒 Esta versión está en modo solo lectura (PODEX_ESCRITURA=0).";

const esFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const esHora = (v: string) => /^\d{2}:\d{2}(:\d{2})?$/.test(v);
const conSegundos = (h: string) => (h.length === 5 ? `${h}:00` : h);

export async function verGestiones(id: string): Promise<{ gestiones: Gestion[] } | { error: string }> {
  const u = await obtenerSesion();
  if (!u) return { error: "La sesión terminó. Vuelva a iniciar sesión." };
  try {
    if (!(await puedeVerSolicitud(u, id))) return { error: "❌ No tiene acceso a esta solicitud." };
    return { gestiones: await obtenerGestiones(id) };
  } catch (e) {
    console.error(e);
    return { error: "❌ No fue posible consultar las gestiones de la solicitud." };
  }
}

export async function guardarGestion(
  id: string,
  fecha: string,
  hora: string,
  observacionTexto: string
): Promise<Resultado> {
  const u = await obtenerSesion();
  if (!u) return { ok: false, error: "La sesión terminó. Vuelva a iniciar sesión." };
  if (!escrituraPermitida()) return { ok: false, error: SOLO_LECTURA };

  const observacion = observacionTexto.trim();
  if (!observacion) return { ok: false, error: "⚠️ Debe ingresar una observación." };
  if (!esFecha(fecha)) return { ok: false, error: "❌ Debe seleccionar la fecha de gestión." };
  if (!esHora(hora)) return { ok: false, error: "❌ Debe seleccionar la hora de gestión." };

  try {
    if (!(await puedeVerSolicitud(u, id))) return { ok: false, error: "❌ No tiene acceso a esta solicitud." };

    const repetida = await sql`
      SELECT 1 FROM public."GESTIONES"
      WHERE "ID_SOLICITUD" = ${id} AND "OBSERVACION" = ${observacion}
      LIMIT 1
    `;
    if (repetida.length) return { ok: false, error: "⚠️ Esta observación ya existe para esta solicitud." };

    // FECHA_REGISTRO la asigna la base de datos (hora de Bogotá).
    const [fila] = await sql<{ FECHA: string }[]>`
      INSERT INTO public."GESTIONES" ("FECHA_GESTION", "ID_SOLICITUD", "OBSERVACION", "USUARIO_REGISTRO")
      VALUES (CAST(${`${fecha} ${conSegundos(hora)}`} AS timestamp without time zone), ${id}, ${observacion}, ${u.usuario})
      RETURNING to_char("FECHA_GESTION", 'YYYY-MM-DD HH24:MI:SS') AS "FECHA"
    `;
    revalidatePath("/solicitudes");
    return { ok: true, mensaje: `✅ Gestión guardada: ${fila.FECHA}` };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "❌ No fue posible guardar la gestión." };
  }
}

export async function actualizarSolicitud(
  id: string,
  status: string,
  codigo: string,
  fecha: string,
  hora: string
): Promise<Resultado> {
  const u = await obtenerSesion();
  if (!u) return { ok: false, error: "La sesión terminó. Vuelva a iniciar sesión." };
  if (!escrituraPermitida()) return { ok: false, error: SOLO_LECTURA };

  if (status && !ESTADOS.includes(status)) return { ok: false, error: "❌ Estado no válido." };
  if (codigo && !CODIGOS_CIERRE.includes(codigo)) return { ok: false, error: "❌ Código de cierre no válido." };

  // Sin código de cierre se limpia la fecha; con código, fecha y hora son obligatorias.
  let fechaCierre: string | null = null;
  if (codigo) {
    if (!esFecha(fecha)) return { ok: false, error: "❌ Debe seleccionar la fecha de cierre." };
    if (!esHora(hora)) return { ok: false, error: "❌ Debe seleccionar la hora de cierre." };
    fechaCierre = `${fecha} ${conSegundos(hora)}`;
  }

  try {
    if (!(await puedeVerSolicitud(u, id))) return { ok: false, error: "❌ No tiene acceso a esta solicitud." };

    const codigoDb = codigo || null;
    // Al cerrar se registra quién y cuándo (hora de Bogotá) lo hizo; si se
    // quita el cierre, se limpian.
    const [fila] = await sql<{ FECHA: string | null }[]>`
      UPDATE public."SOLICITUDES"
      SET "FECHA_CIERRE" = CAST(${fechaCierre} AS timestamp without time zone),
          "STATUS" = ${status || null},
          "CODIGO_CIERRE" = ${codigoDb},
          "USUARIO_CIERRE" = CASE WHEN ${codigoDb}::varchar IS NULL THEN NULL ELSE ${u.usuario}::varchar END,
          "FECHA_REGISTRO_CIERRE" = CASE WHEN ${codigoDb}::varchar IS NULL THEN NULL
                                         ELSE now() AT TIME ZONE 'America/Bogota' END
      WHERE "ID_SOLICITUD" = ${id}
      RETURNING to_char("FECHA_CIERRE", 'YYYY-MM-DD HH24:MI:SS') AS "FECHA"
    `;
    revalidatePath("/solicitudes");
    return {
      ok: true,
      mensaje: `✅ Solicitud ${id} actualizada (${fila?.FECHA ?? "sin fecha/hora de cierre"}).`,
    };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "❌ No fue posible actualizar la solicitud." };
  }
}
