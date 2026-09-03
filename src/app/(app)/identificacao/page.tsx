import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { IdentificacaoContent } from "./identificacao-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Identificação em Campo – SisPatrimônio",
  description: "Fluxo sala por sala: localize, confirme e etiquete o patrimônio",
}

export default async function IdentificacaoPage() {
  const [rooms, unlocatedCount, totalAssets, appliedCount] = await Promise.all([
    prisma.room.findMany({
      include: {
        floor: { include: { building: true } },
        _count: { select: { assets: { where: { deletedAt: null } } } },
      },
      orderBy: [{ floor: { building: { name: "asc" } } }, { floor: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.asset.count({ where: { deletedAt: null, roomId: null } }),
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, labelStatus: "APPLIED" } }),
  ])

  // Contagem de etiquetados (APPLIED) por sala
  const labeledByRoom = await prisma.asset.groupBy({
    by: ["roomId"],
    where: { deletedAt: null, labelStatus: "APPLIED" },
    _count: { id: true },
  })
  const labeledMap: Record<string, number> = {}
  for (const g of labeledByRoom) {
    if (g.roomId) labeledMap[g.roomId] = g._count.id
  }

  const data = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    building: r.floor.building.name,
    floor: r.floor.name,
    total: r._count.assets,
    labeled: labeledMap[r.id] || 0,
  }))

  return (
    <IdentificacaoContent
      rooms={data}
      unlocatedCount={unlocatedCount}
      totalAssets={totalAssets}
      appliedCount={appliedCount}
    />
  )
}
