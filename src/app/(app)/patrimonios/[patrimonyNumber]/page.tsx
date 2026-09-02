import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { DetalhesContent } from "./detalhes-content"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ patrimonyNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { patrimonyNumber } = await params
    return {
      title: `Patrimônio ${patrimonyNumber} – SisPatrimônio`,
      description: `Detalhes do patrimônio ${patrimonyNumber}`,
    }
  } catch {
    return {
      title: "Patrimônio – SisPatrimônio",
    }
  }
}

export default async function DetalhesPatrimonioPage({ params }: PageProps) {
  const { patrimonyNumber } = await params

  try {
    const [asset, rooms] = await Promise.all([
      prisma.asset.findFirst({
        where: {
          patrimonyNumber,
          deletedAt: null,
        },
        include: {
          category: true,
          unit: true,
          room: {
            include: {
              floor: {
                include: {
                  building: true,
                },
              },
            },
          },
          movements: {
            include: {
              fromRoom: true,
              toRoom: true,
              movedBy: { select: { name: true, email: true } },
            },
            orderBy: { movedAt: "desc" },
          },
          inventoryItems: {
            include: {
              inventory: true,
              verifiedBy: { select: { name: true } },
            },
            orderBy: { verifiedAt: "desc" },
          },
          createdBy: { select: { name: true } },
        },
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
    ])

    if (!asset) {
      notFound()
    }

    return <DetalhesContent asset={JSON.parse(JSON.stringify(asset))} rooms={rooms} />
  } catch (error) {
    console.error("Erro ao carregar patrimônio:", error)
    notFound()
  }
}
