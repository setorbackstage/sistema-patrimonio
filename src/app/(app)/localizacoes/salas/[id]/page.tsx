import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { SalaDetalhesContent } from "./sala-detalhes-content"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const room = await prisma.room.findUnique({ where: { id } })
    return {
      title: room ? `${room.name} – SisPatrimônio` : "Sala – SisPatrimônio",
    }
  } catch {
    return { title: "Sala – SisPatrimônio" }
  }
}

export default async function SalaDetalhesPage({ params }: PageProps) {
  const { id } = await params

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        assets: {
          where: { deletedAt: null },
          include: {
            category: true,
          },
          orderBy: { patrimonyNumber: "asc" },
        },
      },
    })

    if (!room) {
      notFound()
    }

    return <SalaDetalhesContent room={JSON.parse(JSON.stringify(room))} />
  } catch (error) {
    console.error("Erro ao buscar detalhes da sala:", error)
    notFound()
  }
}
