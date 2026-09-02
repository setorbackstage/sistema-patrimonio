import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { LoteContent } from "./lote-content"

export const metadata: Metadata = {
  title: "Impressão de Etiquetas em Lote – SisPatrimônio",
  description: "Imprima múltiplas etiquetas patrimoniais por sala, categoria ou status",
}

interface PageProps {
  searchParams: Promise<{ roomId?: string; filter?: string }>
}

export default async function EtiquetasLotePage({ searchParams }: PageProps) {
  const params = await searchParams
  const roomId = params.roomId || ""
  const filter = params.filter || ""

  const where: Record<string, unknown> = { deletedAt: null }
  if (roomId) where.roomId = roomId
  if (filter === "sem-etiqueta") where.labelStatus = "NOT_GENERATED"

  const [assets, rooms, categories] = await Promise.all([
    prisma.asset.findMany({
      where,
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
      orderBy: { patrimonyNumber: "asc" },
      take: 200, // Limite para lote
    }),
    prisma.room.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
      orderBy: [{ floor: { building: { name: "asc" } } }, { name: "asc" }],
    }),
    prisma.assetCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <LoteContent
      initialAssets={JSON.parse(JSON.stringify(assets))}
      rooms={rooms}
      categories={categories}
      selectedRoomId={roomId}
      selectedFilter={filter}
    />
  )
}
