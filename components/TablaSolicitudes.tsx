"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarSolicitud, guardarGestion, verGestiones } from "@/app/acciones";
import { CODIGOS_CIERRE, ESTADOS, type Gestion, type Solicitud } from "@/lib/catalogos";
import { Ficha, Seccion, Ventana } from "./Ventana";
import { IcoBuscar, IcoDocumento, IcoEditar, IcoGuardar } from "./Iconos";

type Accion = "gestionar" | "ver" | "actualizar";

// Fecha y hora actuales en Bogotá, para los valores por defecto.
const hoyBogota = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());

function FichaSolicitud({ s }: { s: Solicitud }) {
  return (
    <Ficha campos={[
      ["ID solicitud", s.ID_SOLICITUD],
      ["Product Owner", s.PRODUCT_OWNER],
      ["Estado", s.STATUS],
      ["Título", s.TITULO],
      ["Asignado a", s.ASIGNADO_A],
      ["Fecha apertura", s.FECHA_APERTURA],
      ["Subservicio afectado", s.SUBSERVICIO_AFECTADO],
      ["Nombre asignatario", s.NOMBRE_ASIGNATARIO],
      ["Correo asignatario", s.CORREO_ASIGNATARIO],
    ]} />
  );
}

export default function TablaSolicitudes({ solicitudes, escritura, subtitulo }: {
  solicitudes: Solicitud[]; escritura: boolean; subtitulo: string;
}) {
  const [texto, setTexto] = useState("");
  const busqueda = useDeferredValue(texto);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<Accion | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Mismo filtro de la versión en Streamlit: el texto en cualquier columna.
  const filtradas = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return solicitudes;
    return solicitudes.filter((s) =>
      Object.values(s).some((v) => v !== null && String(v).toLowerCase().includes(t))
    );
  }, [solicitudes, busqueda]);

  const solicitud = filtradas.find((s) => s.ID_SOLICITUD === seleccionada) ?? null;
  const cerrar = useCallback(() => setAccion(null), []);
  const terminado = useCallback((mensaje: string) => { setAccion(null); setAviso(mensaje); }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <>
      <label className="campo">
        <span>🔎 Buscar solicitud</span>
        <input value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite ID, título, estado, asignado, Product Owner..." />
      </label>

      {!escritura && (
        <div className="alerta alerta-info">🔒 Modo solo lectura: puede consultar, pero no se guardan gestiones ni actualizaciones.</div>
      )}

      {filtradas.length === 0 ? (
        <div className="alerta alerta-info">ℹ️ No existen solicitudes que coincidan con el criterio de búsqueda.</div>
      ) : (
        <>
          <div className="barra-seleccion">
            <div>
              {solicitud
                ? <><b>Solicitud seleccionada:</b> {solicitud.ID_SOLICITUD}</>
                : <span className="nota">☝️ Seleccione una solicitud en la tabla para gestionarla.</span>}
            </div>
            <div className="acciones">
              <button className="circulo verde" disabled={!solicitud} title="Gestionar" onClick={() => setAccion("gestionar")}><IcoEditar /></button>
              <button className="circulo azul" disabled={!solicitud} title="Ver gestión" onClick={() => setAccion("ver")}><IcoBuscar /></button>
              <button className="circulo naranja" disabled={!solicitud} title="Actualizar" onClick={() => setAccion("actualizar")}><IcoDocumento /></button>
            </div>
          </div>

          <div className="tabla-contenedor">
            <table className="tabla tabla-seleccion">
              <thead>
                <tr><th>ID_SOLICITUD</th><th>TITULO</th><th>SUBSERVICIO_AFECTADO</th><th>PRODUCT_OWNER</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr key={s.ID_SOLICITUD} className={s.ID_SOLICITUD === seleccionada ? "sel" : undefined}
                    onClick={() => setSeleccionada(s.ID_SOLICITUD === seleccionada ? null : s.ID_SOLICITUD)}>
                    <td>{s.ID_SOLICITUD}</td>
                    <td className="ancha">{s.TITULO}</td>
                    <td>{s.SUBSERVICIO_AFECTADO}</td>
                    <td>{s.PRODUCT_OWNER}</td>
                    <td>{s.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="nota pie-tabla">{filtradas.length} de {solicitudes.length} solicitudes</div>
        </>
      )}

      {solicitud && accion === "gestionar" && (
        <Ventana titulo="Gestionar Solicitud" subtitulo={subtitulo} alCerrar={cerrar}>
          <FichaSolicitud s={solicitud} />
          <NuevaGestion id={solicitud.ID_SOLICITUD} alTerminar={terminado} />
        </Ventana>
      )}
      {solicitud && accion === "ver" && (
        <Ventana titulo="Ver Gestión" subtitulo={subtitulo} alCerrar={cerrar}>
          <FichaSolicitud s={solicitud} />
          <Gestiones id={solicitud.ID_SOLICITUD} />
        </Ventana>
      )}
      {solicitud && accion === "actualizar" && (
        <Ventana titulo="Actualizar Solicitud" subtitulo={subtitulo} alCerrar={cerrar}>
          <FichaSolicitud s={solicitud} />
          <Actualizar s={solicitud} alTerminar={terminado} />
        </Ventana>
      )}

      {aviso && <div className="toast">{aviso}</div>}
    </>
  );
}

// ============================================================
// GESTIONAR: nueva gestión con fecha, hora y observación
// ============================================================
function NuevaGestion({ id, alTerminar }: { id: string; alTerminar: (m: string) => void }) {
  const router = useRouter();
  const [fecha, setFecha] = useState(hoyBogota);
  const [hora, setHora] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observacion.trim()) return setError("⚠️ Debe ingresar una observación.");
    if (!hora) return setError("❌ Debe seleccionar la hora de gestión.");
    iniciar(async () => {
      const r = await guardarGestion(id, fecha, hora, observacion);
      if (!r.ok) return setError(r.error);
      router.refresh();
      alTerminar(r.mensaje);
    });
  };

  return (
    <>
      <Seccion titulo="Nueva gestión" descripcion="Registre la fecha, la hora y la observación de la gestión realizada." />
      <form className="formulario" onSubmit={guardar}>
        <div className="fila-2">
          <label className="campo"><span>Fecha de gestión</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></label>
          <label className="campo"><span>Hora de gestión</span>
            <input type="time" step={1} value={hora} onChange={(e) => setHora(e.target.value)}
              title="Seleccione o digite la hora de la gestión (HH:MM:SS)." /></label>
        </div>
        <label className="campo"><span>Observación</span>
          <textarea rows={5} value={observacion} onChange={(e) => setObservacion(e.target.value)}
            placeholder="Digite la observación de la gestión..." /></label>
        <div className="acciones derecha">
          <button type="submit" className="circulo verde" disabled={guardando} title="Guardar gestión"><IcoGuardar /></button>
        </div>
        {error && <div className="alerta alerta-error">{error}</div>}
      </form>
    </>
  );
}

// ============================================================
// VER GESTIÓN: gestiones registradas
// ============================================================
function Gestiones({ id }: { id: string }) {
  const [datos, setDatos] = useState<Gestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    verGestiones(id).then((r) => {
      if (!vigente) return;
      if ("error" in r) setError(r.error); else setDatos(r.gestiones);
    });
    return () => { vigente = false; };
  }, [id]);

  return (
    <>
      <Seccion titulo="Gestiones registradas" />
      {error ? <div className="alerta alerta-error">{error}</div>
        : !datos ? <div className="cargando">Consultando gestiones...</div>
        : datos.length === 0 ? <div className="alerta alerta-info">ℹ️ Esta solicitud no tiene gestiones registradas.</div>
        : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead><tr><th>Fecha gestión</th><th>Observación</th><th>Registrado por</th><th>Fecha registro</th></tr></thead>
              <tbody>
                {datos.map((g, i) => (
                  <tr key={i}>
                    <td className="nowrap">{g.FECHA_GESTION ?? "—"}</td>
                    <td className="ancha texto">{g.OBSERVACION ?? "—"}</td>
                    <td>{g.USUARIO_REGISTRO ?? "—"}</td>
                    <td className="nowrap">{g.FECHA_REGISTRO ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}

// ============================================================
// ACTUALIZAR: estado, código, fecha y hora de cierre
// ============================================================
function Actualizar({ s, alTerminar }: { s: Solicitud; alTerminar: (m: string) => void }) {
  const router = useRouter();
  const [status, setStatus] = useState(s.STATUS && ESTADOS.includes(s.STATUS) ? s.STATUS : "");
  const [codigo, setCodigo] = useState(s.CODIGO_CIERRE && CODIGOS_CIERRE.includes(s.CODIGO_CIERRE) ? s.CODIGO_CIERRE : "");
  const [fecha, setFecha] = useState(s.FECHA_CIERRE?.slice(0, 10) ?? "");
  const [hora, setHora] = useState(s.FECHA_CIERRE?.slice(11, 19) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  // Con código de cierre se habilitan fecha y hora (fecha de hoy por defecto); sin código se limpian.
  const cambiarCodigo = (valor: string) => {
    setCodigo(valor);
    if (!valor) { setFecha(""); setHora(""); }
    else if (!fecha) setFecha(hoyBogota());
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo && !fecha) return setError("❌ Debe seleccionar la fecha de cierre.");
    if (codigo && !hora) return setError("❌ Debe seleccionar la hora de cierre.");
    iniciar(async () => {
      const r = await actualizarSolicitud(s.ID_SOLICITUD, status, codigo, fecha, hora);
      if (!r.ok) return setError(r.error);
      router.refresh();
      alTerminar(r.mensaje);
    });
  };

  return (
    <>
      <Seccion titulo="Actualizar solicitud" descripcion="Cambie el estado o registre el código, la fecha y la hora de cierre." />
      <form className="formulario" onSubmit={guardar}>
        <div className="fila-2">
          <label className="campo"><span>Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value=""></option>
              {ESTADOS.map((x) => <option key={x}>{x}</option>)}
            </select></label>
          <label className="campo"><span>Código de cierre</span>
            <select value={codigo} onChange={(e) => cambiarCodigo(e.target.value)}>
              <option value=""></option>
              {CODIGOS_CIERRE.map((x) => <option key={x}>{x}</option>)}
            </select></label>
        </div>
        <div className="fila-2">
          <label className="campo"><span>Fecha de cierre</span>
            <input type="date" value={fecha} disabled={!codigo} onChange={(e) => setFecha(e.target.value)} /></label>
          <label className="campo"><span>Hora de cierre</span>
            <input type="time" step={1} value={hora} disabled={!codigo} onChange={(e) => setHora(e.target.value)}
              title="Seleccione o digite la hora de cierre (HH:MM:SS)." /></label>
        </div>
        <div className="acciones derecha">
          <button type="submit" className="circulo naranja" disabled={guardando} title="Actualizar solicitud"><IcoDocumento /></button>
        </div>
        {error && <div className="alerta alerta-error">{error}</div>}
      </form>
    </>
  );
}
