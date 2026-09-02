import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ExecucaoInventarioContent } from "./execucao-inventario-content"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const inventory = await prisma.inventory.findUnique({ where: { id } })
  return {
    title: inventory ? `${inventory.title} – SisPatrimônio` : "Inventário – SisPatrimônio",
  }
}

export default async function ExecucaoInventarioPage({ params }: PageProps) {
  const { id } = await params

  const [inventory, rooms] = await Promise.all([
    prisma.inventory.findUnique({
      where: { id },
      include: {
        unit: true,
        responsible: { select: { name: true, email: true } },
        items: {
          include: {
            asset: {
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
            },
            foundRoom: {
              include: {
                floor: {
                  include: {
                    building: true,
                  },
                },
              },
            },
            verifiedBy: { select: { name: true } },
          },
          orderBy: { verifiedAt: "desc" },
        },
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

  if (!inventory) {
    notFound()
  }

  return (
    <ExecucaoInventarioContent
      inventory={JSON.parse(JSON.stringify(inventory))}
      rooms={rooms}
    />
  )
}
