import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { DashboardContent } from "./dashboard-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard – SisPatrimônio",
  description: "Painel de controle patrimonial",
}

async function getDashboardData() {
  try {
    const [
      totalAssets,
      activeAssets,
      assetsWithoutRoom,
      assetsWithoutLabel,
      totalValue,
      categoryCounts,
      recentMovements,
    ] = await Promise.all([
      prisma.asset.count({ where: { deletedAt: null } }),
      prisma.asset.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.asset.count({ where: { deletedAt: null, roomId: null } }),
      prisma.asset.count({ where: { deletedAt: null, labelStatus: "NOT_GENERATED" } }),
      prisma.asset.aggregate({
        _sum: { totalValue: true },
        where: { deletedAt: null },
      }),
      prisma.asset.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        where: { deletedAt: null, categoryId: { not: null } },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.assetMovement.findMany({
        take: 5,
        orderBy: { movedAt: "desc" },
        include: {
          asset: { select: { patrimonyNumber: true, description: true } },
          movedBy: { select: { name: true } },
        },
      }),
    ])

    // Buscar nomes das categorias
    const categoryIds = categoryCounts
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null)

    const categories = await prisma.assetCategory.findMany({
      where: { id: { in: categoryIds } },
    })

    const categoryData = categoryCounts.map((c) => ({
      name: categories.find((cat) => cat.id === c.categoryId)?.name || "Sem categoria",
      count: c._count.id,
    }))

    return {
      totalAssets,
      activeAssets,
      assetsWithoutRoom,
      assetsWithoutLabel,
      totalValue: Number(totalValue._sum.totalValue || 0),
      categoryData,
      recentMovements,
    }
  } catch {
    // Se o banco não estiver configurado, retornar dados zerados
    return {
      totalAssets: 0,
      activeAssets: 0,
      assetsWithoutRoom: 0,
      assetsWithoutLabel: 0,
      totalValue: 0,
      categoryData: [],
      recentMovements: [],
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardContent data={data} />
}
