import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { PatrimoniosContent } from "./patrimonios-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Patrimônios – SisPatrimônio",
  description: "Lista de patrimônios do CIEP 395",
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PatrimoniosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const perPage = 25
  const search = (params.search as string) || ""
  const filter = (params.filter as string) || ""
  const category = (params.category as string) || ""

  try {
    const where: Record<string, unknown> = { deletedAt: null }

    // Filtros
    if (filter === "sem-localizacao") {
      where.roomId = null
    } else if (filter === "sem-etiqueta") {
      where.labelStatus = "NOT_GENERATED"
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { patrimonyNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }

    const [assets, total, categories, rooms] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: { select: { name: true, code: true } },
          unit: { select: { name: true } },
          room: {
            select: {
              id: true,
              name: true,
              floor: {
                select: {
                  name: true,
                  building: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { patrimonyNumber: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.asset.count({ where }),
      prisma.assetCategory.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.room.findMany({
        include: {
          floor: {
            include: {
              building: true,
            },
          },
        },
        orderBy: [
          { floor: { building: { name: "asc" } } },
          { floor: { number: "asc" } },
          { name: "asc" },
        ],
      }),
    ])

    return (
      <PatrimoniosContent
        assets={JSON.parse(JSON.stringify(assets))}
        total={total}
        page={page}
        perPage={perPage}
        search={search}
        filter={filter}
        categoryFilter={category}
        categories={categories}
        rooms={JSON.parse(JSON.stringify(rooms))}
      />
    )
  } catch {
    return (
      <PatrimoniosContent
        assets={[]}
        total={0}
        page={1}
        perPage={perPage}
        search=""
        filter=""
        categoryFilter=""
        categories={[]}
        rooms={[]}
      />
    )
  }
}
