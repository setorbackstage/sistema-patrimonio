import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { EtiquetasContent } from "./etiquetas-content"

export const metadata: Metadata = {
  title: "Estação de Etiquetagem – SisPatrimônio",
  description: "Gerador e impressor de etiquetas patrimoniais com QR Code e código de barras",
}

interface PageProps {
  searchParams: Promise<{ patrimonio?: string; autoPrint?: string }>
}

export default async function EtiquetasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialPatrimony = params.patrimonio || ""
  const autoPrint = params.autoPrint === "true"

  let asset = null
  if (initialPatrimony) {
    asset = await prisma.asset.findFirst({
      where: {
        patrimonyNumber: initialPatrimony,
        deletedAt: null,
      },
      include: {
        category: true,
        room: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    })
  }

  return (
    <EtiquetasContent
      initialAsset={asset ? JSON.parse(JSON.stringify(asset)) : null}
      autoPrint={autoPrint}
    />
  )
}
