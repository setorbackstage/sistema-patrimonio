import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SisPatrimônio – Sistema de Gestão Patrimonial",
  description: "Sistema de Gestão, Inventário, Etiquetagem e Localização de Patrimônio – CIEP 395",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
