import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                _count: {
                  select: { assets: { where: { deletedAt: null } } },
                },
              },
            },
          },
          orderBy: { number: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(buildings)
  } catch (error) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json({ error: "Erro ao buscar prédios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, unitId } = body

    if (!name) {
      return NextResponse.json({ error: "Nome do prédio é obrigatório" }, { status: 400 })
    }

    let defaultUnitId = unitId
    if (!defaultUnitId) {
      const unit = await prisma.unit.findFirst()
      defaultUnitId = unit?.id
    }

    const building = await prisma.building.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        unitId: defaultUnitId,
      },
    })

    return NextResponse.json(building, { status: 201 })
  } catch (error) {
    console.error("Error creating building:", error)
    return NextResponse.json({ error: "Erro ao criar prédio" }, { status: 500 })
  }
}
