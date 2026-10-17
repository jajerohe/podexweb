import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

// La sesión de PODEX vive en una cookie firmada (como st.session_state en la
// versión en Streamlit): Supabase Auth solo valida la contraseña al ingresar,
// así cada página no tiene que consultar a Supabase.
export type Usuario = {
  usuario: string;
  perfil: string;
  nombre: string;
  email: string;
};

const COOKIE = "podex_sesion";
const DURACION = 12 * 60 * 60; // segundos

function clave() {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto) throw new Error("Falta la variable de entorno SESSION_SECRET.");
  return new TextEncoder().encode(secreto);
}

export async function crearSesion(usuario: Usuario) {
  const token = await new SignJWT({ ...usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION}s`)
    .sign(clave());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION,
  });
}

export async function borrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function obtenerSesion(): Promise<Usuario | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave());
    return {
      usuario: String(payload.usuario),
      perfil: String(payload.perfil ?? ""),
      nombre: String(payload.nombre ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}

export async function exigirSesion(): Promise<Usuario> {
  const usuario = await obtenerSesion();
  if (!usuario) redirect("/login");
  return usuario;
}

export const esAdministrador = (u: Usuario) => u.perfil.trim().toLowerCase() === "administrador";
export const esOperador = (u: Usuario) => u.perfil.trim().toLowerCase() === "operador";
