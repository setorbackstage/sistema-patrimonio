import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SalaTrabalhoContent } from "./sala-trabalho-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Trabalho de Sala – SisPatrimônio",
  description: "Confirmação e etiquetagem sala por sala",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SalaTrabalhoPage({ params }: PageProps) {
  const { id } = await params
  const isUnlocated = id === "sem-localizacao"

  let roomInfo = { name: "Sem Localização", floor: "Aguardando alocação", building: "—" }

  if (!isUnlocated) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { floor: { include: { building: true } } },
    })
    if (!room) notFound()
    roomInfo = {
      name: room.name,
      floor: room.floor.name,
      building: room.floor.building.name,
    }
  }

  const [assets, allRooms] = await Promise.all([
    prisma.asset.findMany({
      where: isUnlocated
        ? { deletedAt: null, roomId: null }
        : { deletedAt: null, roomId: id },
      include: {
        category: { select: { name: true, code: true } },
      },
      orderBy: { patrimonyNumber: "asc" },
      take: 500,
    }),
    prisma.room.findMany({
      where: {},
      orderBy: [{ floor: { building: { name: "asc" } } }, { floor: { name: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        floor: { select: { name: true, building: { select: { name: true } } } },
      },
    }),
  ])

  const categories = await prisma.assetCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return (
    <SalaTrabalhoContent
      roomId={isUnlocated ? "" : id}
      roomName={roomInfo.name}
      roomFloor={`${roomInfo.building} → ${roomInfo.floor}`}
      isUnlocated={isUnlocated}
      categories={categories}
      rooms={allRooms.map((r) => ({
        id: r.id,
        name: r.name,
        floor: r.floor.name,
        building: r.floor.building.name,
      }))}
      initialAssets={assets.map((a) => ({
        id: a.id,
        patrimonyNumber: a.patrimonyNumber,
        description: a.description,
        brand: a.brand,
        model: a.model,
        labelStatus: a.labelStatus,
        category: a.category,
      }))}
    />
  )
}
