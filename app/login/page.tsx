import Image from "next/image";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";
import FormularioLogin from "./formulario";

export default async function Login() {
  if (await obtenerSesion()) redirect("/solicitudes");

  return (
    <main className="login">
      <div className="login-logo">
        <Image src="/Logo_PODEX_horizontal.png" alt={NOMBRE_SISTEMA} width={150} height={50} priority
          style={{ height: "auto" }} />
      </div>

      <div className="login-zona">
        <div className="login-tarjeta">
          <div className="login-icono">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#FFFFFF" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2" fill="rgba(255,255,255,.18)" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1.4" fill="#FFFFFF" stroke="none" />
            </svg>
          </div>
          <div className="login-titulo">Inicia sesión y accede a<br />{NOMBRE_SISTEMA}</div>
          <FormularioLogin />
        </div>
      </div>

      <div className="login-pie">
        <b>{NOMBRE_SISTEMA}</b> · {DESCRIPCION_SISTEMA}<br />
        Powered by <b>JAJEROHE Systems</b>
      </div>
    </main>
  );
}
