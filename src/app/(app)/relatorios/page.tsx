import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { RelatoriosContent } from "./relatorios-content"

export const metadata: Metadata = {
  title: "Relatórios Patrimoniais – SisPatrimônio",
  description: "Relatórios gerenciais, sintéticos e analíticos com exportação XLSX e PDF",
}

export default async function RelatoriosPage() {
  const [
    totalAssets,
    totalValueAgg,
    categoryGroups,
    roomGroups,
    conditionGroups,
    statusGroups,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.aggregate({
      _sum: { totalValue: true },
      where: { deletedAt: null },
    }),
    prisma.asset.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      _sum: { totalValue: true },
      where: { deletedAt: null },
      orderBy: { _sum: { totalValue: "desc" } },
    }),
    prisma.room.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        assets: {
          where: { deletedAt: null },
          select: { totalValue: true },
        },
      },
    }),
    prisma.asset.groupBy({
      by: ["condition"],
      _count: { id: true },
      _sum: { totalValue: true },
      where: { deletedAt: null },
    }),
    prisma.asset.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { totalValue: true },
      where: { deletedAt: null },
    }),
  ])

  // Buscar categorias para associar nomes
  const categories = await prisma.assetCategory.findMany()

  const categoriesReport = categoryGroups.map((cg) => {
    const cat = categories.find((c) => c.id === cg.categoryId)
    return {
      code: cat?.code || "—",
      name: cat?.name || "Sem categoria",
      count: cg._count.id,
      totalValue: Number(cg._sum.totalValue || 0),
    }
  })

  const roomsReport = roomGroups.map((r) => ({
    id: r.id,
    name: r.name,
    building: r.floor.building.name,
    floor: r.floor.name,
    count: r.assets.length,
    totalValue: r.assets.reduce((sum, a) => sum + Number(a.totalValue || 0), 0),
  })).filter((r) => r.count > 0)

  return (
    <RelatoriosContent
      totalAssets={totalAssets}
      totalValue={Number(totalValueAgg._sum.totalValue || 0)}
      categoriesReport={categoriesReport}
      roomsReport={roomsReport}
      conditionReport={conditionGroups.map((cg) => ({
        condition: cg.condition,
        count: cg._count.id,
        totalValue: Number(cg._sum.totalValue || 0),
      }))}
      statusReport={statusGroups.map((sg) => ({
        status: sg.status,
        count: sg._count.id,
        totalValue: Number(sg._sum.totalValue || 0),
      }))}
    />
  )
}
