import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { EditarPatrimonioForm } from "./editar-form"

interface PageProps {
  params: Promise<{ patrimonyNumber: string }>
}

export const metadata: Metadata = {
  title: "Editar Patrimônio – SisPatrimônio",
  description: "Editar bem patrimonial",
}

export default async function EditarPatrimonioPage({ params }: PageProps) {
  const { patrimonyNumber } = await params

  const [asset, categories, rooms] = await Promise.all([
    prisma.asset.findFirst({
      where: {
        patrimonyNumber,
        deletedAt: null,
      },
    }),
    prisma.assetCategory.findMany({
      orderBy: { code: "asc" },
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

  return (
    <EditarPatrimonioForm
      asset={JSON.parse(JSON.stringify(asset))}
      categories={categories}
      rooms={rooms}
    />
  )
}
