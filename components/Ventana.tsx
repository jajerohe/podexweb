"use client";

import { useEffect } from "react";
import { IcoCerrar } from "./Iconos";

// Ventana superpuesta (equivale a st.dialog) con el encabezado estilo PODEX.
export function Ventana({ titulo, subtitulo, alCerrar, children }: {
  titulo: string; subtitulo: string; alCerrar: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    document.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [alCerrar]);

  return (
    <div className="ventana-fondo" onMouseDown={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="ventana" role="dialog" aria-modal="true" aria-label={titulo}>
        <button className="ventana-cerrar" onClick={alCerrar} aria-label="Cerrar"><IcoCerrar /></button>
        <div className="topbar">
          <div className="topbar-titulo">{titulo}</div>
          <div className="topbar-subtitulo">{subtitulo}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

const vacio = (v: unknown) => v === null || v === undefined || v === "";

/** Tarjeta con datos en cuadrícula (etiqueta pequeña + valor). */
export function Ficha({ campos, columnas = 3 }: { campos: [string, string | null | undefined][]; columnas?: number }) {
  return (
    <div className="ficha" style={{ gridTemplateColumns: `repeat(${columnas},minmax(0,1fr))` }}>
      {campos.map(([etiqueta, valor]) => (
        <div key={etiqueta}>
          <div className="ficha-etiqueta">{etiqueta}</div>
          <div className="ficha-valor">{vacio(valor) ? "—" : valor}</div>
        </div>
      ))}
    </div>
  );
}

export function Seccion({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <>
      <div className="seccion-titulo">{titulo}</div>
      {descripcion && <div className="seccion-descripcion">{descripcion}</div>}
    </>
  );
}
