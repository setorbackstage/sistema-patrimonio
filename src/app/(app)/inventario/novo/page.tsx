import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { NovoInventarioForm } from "./novo-inventario-form"

export const metadata: Metadata = {
  title: "Novo Inventário – SisPatrimônio",
  description: "Iniciar novo ciclo de inventário patrimonial",
}

interface PageProps {
  searchParams: Promise<{ roomId?: string }>
}

export default async function NovoInventarioPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialRoomId = params.roomId || ""

  const [rooms, totalAssets] = await Promise.all([
    prisma.room.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        _count: {
          select: { assets: { where: { deletedAt: null } } },
        },
      },
      orderBy: [{ floor: { building: { name: "asc" } } }, { name: "asc" }],
    }),
    prisma.asset.count({ where: { deletedAt: null } }),
  ])

  return (
    <NovoInventarioForm
      rooms={rooms}
      totalAssets={totalAssets}
      initialRoomId={initialRoomId}
    />
  )
}
