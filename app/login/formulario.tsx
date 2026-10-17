"use client";

import { useActionState } from "react";
import { iniciarSesion } from "../acciones";

export default function FormularioLogin() {
  const [mensaje, accion, enviando] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className="login-form">
      <input name="email" type="email" placeholder="Correo electrónico" aria-label="Correo electrónico"
        autoComplete="username" required />
      <input name="password" type="password" placeholder="Contraseña" aria-label="Contraseña"
        autoComplete="current-password" required />
      <button type="submit" disabled={enviando}>{enviando ? "Validando credenciales..." : "Ingresar"}</button>
      {mensaje && <div className="alerta alerta-error">{mensaje}</div>}
    </form>
  );
}
