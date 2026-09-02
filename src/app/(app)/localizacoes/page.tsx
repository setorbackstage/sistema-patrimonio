import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { LocalizacoesContent } from "./localizacoes-content"

export const metadata: Metadata = {
  title: "Localizações Físicas – SisPatrimônio",
  description: "Mapa e gestão de prédios, andares e salas do CIEP 395",
}

export default async function LocalizacoesPage() {
  const [buildings, totalAssets, unlocatedAssets] = await Promise.all([
    prisma.building.findMany({
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                _count: {
                  select: { assets: { where: { deletedAt: null } } },
                },
              },
              orderBy: { name: "asc" },
            },
          },
          orderBy: { number: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, roomId: null } }),
  ])

  return (
    <LocalizacoesContent
      buildings={JSON.parse(JSON.stringify(buildings))}
      totalAssets={totalAssets}
      unlocatedAssets={unlocatedAssets}
    />
  )
}
