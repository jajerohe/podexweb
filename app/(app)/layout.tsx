import Image from "next/image";
import { esAdministrador, esOperador, exigirSesion } from "@/lib/sesion";
import { NOMBRE_SISTEMA } from "@/lib/marca";
import { cerrarSesion } from "../acciones";
import MenuLateral from "@/components/MenuLateral";
import { IcoSalir } from "@/components/Iconos";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const u = await exigirSesion();

  return (
    <>
      <header className="barra">
        <div className="barra-logo">
          <Image src="/Logo_PODEX_horizontal.png" alt={NOMBRE_SISTEMA} width={89} height={30} priority />
        </div>
        <div className="barra-nombre">
          Sistema Integrado de Gestión<span>Peticiones, Incidentes y Vulnerabilidades</span>
        </div>
        <div className="barra-acciones">
          <div className="barra-usuario">
            👤 {u.nombre || u.usuario} · Usuario: {u.usuario} · Perfil: {u.perfil || "Sin perfil"}
          </div>
          <form action={cerrarSesion}>
            <button className="barra-salir" title="Cerrar sesión" aria-label="Cerrar sesión"><IcoSalir /></button>
          </form>
        </div>
      </header>
      <MenuLateral administrador={esAdministrador(u)} operador={esOperador(u)} />
      <main className="contenido">{children}</main>
    </>
  );
}
