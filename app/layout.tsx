import type { Metadata } from "next";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";
import "./globals.css";

export const metadata: Metadata = {
  title: `${NOMBRE_SISTEMA} - ${DESCRIPCION_SISTEMA}`,
  description: DESCRIPCION_SISTEMA,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
