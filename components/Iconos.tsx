// Íconos en SVG (equivalentes a los de Material que usa la versión en Streamlit).
type P = { tam?: number };
const base = (tam: number) => ({
  width: tam, height: tam, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const IcoEditar = ({ tam = 20 }: P) => (
  <svg {...base(tam)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const IcoBuscar = ({ tam = 20 }: P) => (
  <svg {...base(tam)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IcoDocumento = ({ tam = 20 }: P) => (
  <svg {...base(tam)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" /><path d="M14 3v5h5" />
    <path d="M19 8v3" /><path d="M18.4 14.6a1.4 1.4 0 0 1 2 2L16 21l-2.6.6.6-2.6Z" /></svg>
);
export const IcoGuardar = ({ tam = 20 }: P) => (
  <svg {...base(tam)}><path d="M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M7 3v5h8V3" /><rect x="7" y="13" width="10" height="8" /></svg>
);
export const IcoCerrar = ({ tam = 20 }: P) => (
  <svg {...base(tam)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const IcoSolicitudes = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" />
    <path d="M9 10h6M9 14h6M9 18h3" /></svg>
);
export const IcoCargar = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
    <path d="M14 3v6h6" /><path d="M12 18v-6M9 15l3-3 3 3" /></svg>
);
export const IcoUsuarios = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></svg>
);
export const IcoPods = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><circle cx="12" cy="12" r="3" /><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
    <path d="m6.5 6.5 3.4 3.4M17.5 6.5l-3.4 3.4M6.5 17.5l3.4-3.4M17.5 17.5l-3.4-3.4" /></svg>
);
export const IcoCorreo = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IcoReportes = ({ tam = 19 }: P) => (
  <svg {...base(tam)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const IcoDobleIzq = ({ tam = 18 }: P) => (
  <svg {...base(tam)}><path d="m11 17-5-5 5-5M18 17l-5-5 5-5" /></svg>
);
export const IcoDobleDer = ({ tam = 18 }: P) => (
  <svg {...base(tam)}><path d="m6 17 5-5-5-5M13 17l5-5-5-5" /></svg>
);
export const IcoSalir = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 4h3a1 1 0 0 1 1 1v3M18 16v3a1 1 0 0 1-1 1h-3" />
    <path d="M5 4.5 11 3a1 1 0 0 1 1.2 1v16a1 1 0 0 1-1.2 1L5 19.5z" fill="#fff" />
    <path d="M14.5 12H22M19 9l3 3-3 3" />
  </svg>
);
