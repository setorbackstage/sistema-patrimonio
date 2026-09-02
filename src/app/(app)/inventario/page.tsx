import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { InventarioContent } from "./inventario-content"

export const metadata: Metadata = {
  title: "Inventário – SisPatrimônio",
  description: "Ciclos de inventário físico e conferência de bens",
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function InventarioPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || ""

  const where: Record<string, unknown> = {}
  if (statusFilter === "em-andamento") where.status = "IN_PROGRESS"
  if (statusFilter === "concluido") where.status = "COMPLETED"

  const inventories = await prisma.inventory.findMany({
    where,
    include: {
      responsible: { select: { name: true } },
      items: {
        select: { status: true },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { startedAt: "desc" },
  })

  // Calcular estatísticas para cada inventário
  const inventoriesWithStats = inventories.map((inv) => {
    const total = inv.items.length
    const conferred = inv.items.filter((i) => i.status === "CONFERRED").length
    const divergent = inv.items.filter((i) => i.status === "DIVERGENT").length
    const missing = inv.items.filter((i) => i.status === "MISSING").length
    const percentage = total > 0 ? Math.round((conferred / total) * 100) : 0

    return {
      id: inv.id,
      title: inv.title,
      year: inv.year,
      status: inv.status,
      startedAt: inv.startedAt,
      completedAt: inv.completedAt,
      responsibleName: inv.responsible?.name || "Administrador",
      total,
      conferred,
      divergent,
      missing,
      percentage,
    }
  })

  return (
    <InventarioContent
      inventories={JSON.parse(JSON.stringify(inventoriesWithStats))}
      statusFilter={statusFilter}
    />
  )
}
