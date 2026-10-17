// Nombre y descripción del sistema, como en marca.py de la versión en Streamlit.
export const NOMBRE_SISTEMA = process.env.NOMBRE_SISTEMA?.trim() || "Podex";
export const DESCRIPCION_SISTEMA =
  process.env.DESCRIPCION_SISTEMA?.trim() ||
  "Sistema Integrado de Gestión de Peticiones, Incidentes y Vulnerabilidades";
