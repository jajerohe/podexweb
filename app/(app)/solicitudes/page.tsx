import { exigirSesion } from "@/lib/sesion";
import { obtenerSolicitudes } from "@/lib/solicitudes";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";
import TablaSolicitudes from "@/components/TablaSolicitudes";

export const dynamic = "force-dynamic";

export default async function PaginaSolicitudes() {
  const u = await exigirSesion();

  let solicitudes;
  try {
    solicitudes = await obtenerSolicitudes(u);
  } catch (e) {
    console.error(e);
    return (
      <>
        <h1 className="titulo-pagina">Gestión de Solicitudes</h1>
        <div className="alerta alerta-error">❌ No fue posible consultar las solicitudes.</div>
      </>
    );
  }

  return (
    <>
      <h1 className="titulo-pagina">Gestión de Solicitudes</h1>
      <TablaSolicitudes solicitudes={solicitudes} escritura={process.env.PODEX_ESCRITURA === "1"}
        subtitulo={`${DESCRIPCION_SISTEMA} · ${NOMBRE_SISTEMA}`} />
    </>
  );
}
