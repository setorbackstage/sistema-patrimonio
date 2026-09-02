import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { NovoPatrimonioForm } from "./novo-form"

export const metadata: Metadata = {
  title: "Novo Patrimônio – SisPatrimônio",
  description: "Cadastrar novo bem patrimonial",
}

export default async function NovoPatrimonioPage() {
  const [categories, rooms] = await Promise.all([
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

  return <NovoPatrimonioForm categories={categories} rooms={rooms} />
}
