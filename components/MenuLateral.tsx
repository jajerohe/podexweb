"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IcoCargar, IcoCorreo, IcoDobleDer, IcoDobleIzq, IcoPods, IcoReportes, IcoSolicitudes, IcoUsuarios,
} from "./Iconos";

type Opcion = { ruta: string; etiqueta: string; icono: React.ReactNode; lista: boolean };

// Mismos grupos y permisos que el menú de la versión en Streamlit. Las
// opciones que aún no se han pasado a esta versión aparecen deshabilitadas.
export default function MenuLateral({ administrador, operador }: { administrador: boolean; operador: boolean }) {
  const ruta = usePathname();
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    try { setColapsado(localStorage.getItem("podex_menu") === "1"); } catch {}
  }, []);
  useEffect(() => {
    document.body.classList.toggle("menu-colapsado", colapsado);
  }, [colapsado]);

  const alternar = () => {
    setColapsado(!colapsado);
    try { localStorage.setItem("podex_menu", colapsado ? "0" : "1"); } catch {}
  };

  const grupos: { titulo: string; opciones: Opcion[] }[] = [];
  if (administrador) {
    grupos.push({ titulo: "Administración", opciones: [
      { ruta: "/usuarios", etiqueta: "Usuarios", icono: <IcoUsuarios />, lista: false },
      { ruta: "/pods", etiqueta: "POD's", icono: <IcoPods />, lista: false },
      { ruta: "/listas", etiqueta: "Listas de correo", icono: <IcoCorreo />, lista: false },
    ] });
  }
  const operaciones: Opcion[] = [{ ruta: "/solicitudes", etiqueta: "Solicitudes", icono: <IcoSolicitudes />, lista: true }];
  if (administrador) operaciones.push({ ruta: "/cargar", etiqueta: "Cargar solicitudes", icono: <IcoCargar />, lista: false });
  grupos.push({ titulo: "Operaciones", opciones: operaciones });
  if (administrador || operador) {
    grupos.push({ titulo: "Reportes", opciones: [
      { ruta: "/reportes", etiqueta: "Reportes", icono: <IcoReportes />, lista: false },
    ] });
  }

  return (
    <nav className="menu">
      <div className="menu-toggle">
        <button onClick={alternar} title={colapsado ? "Expandir menú" : "Contraer menú"}>
          {colapsado ? <IcoDobleDer /> : <IcoDobleIzq />}
        </button>
      </div>
      {grupos.map((g) => (
        <div key={g.titulo}>
          <div className="menu-seccion">{g.titulo}</div>
          {g.opciones.map((o) =>
            o.lista ? (
              <Link key={o.ruta} href={o.ruta} title={o.etiqueta}
                className={`menu-opcion${ruta.startsWith(o.ruta) ? " activa" : ""}`}>
                {o.icono}<span>{o.etiqueta}</span>
              </Link>
            ) : (
              <span key={o.ruta} className="menu-opcion pendiente" title={`${o.etiqueta} (aún no disponible en esta versión)`}>
                {o.icono}<span>{o.etiqueta}</span><em>pronto</em>
              </span>
            )
          )}
        </div>
      ))}
    </nav>
  );
}
