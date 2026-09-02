import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { CategoriasContent } from "./categorias-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Classificações SIAF – SisPatrimônio",
  description: "Tabela de contas e classificações patrimoniais",
}

export default async function CategoriasPage() {
  try {
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: { where: { deletedAt: null } } },
        },
        assets: {
          where: { deletedAt: null },
          select: { totalValue: true },
        },
      },
      orderBy: { code: "asc" },
    })

    const formatted = categories.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      assetCount: c._count.assets,
      totalValue: c.assets.reduce((sum, a) => sum + Number(a.totalValue || 0), 0),
    }))

    return <CategoriasContent categories={formatted} />
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return <CategoriasContent categories={[]} />
  }
}
