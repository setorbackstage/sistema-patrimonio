import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const inventory = await prisma.inventory.findUnique({
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
            foundRoom: true,
            verifiedBy: { select: { name: true } },
          },
          orderBy: { verifiedAt: "desc" },
        },
      },
    })

    if (!inventory) {
      return NextResponse.json({ error: "Inventário não encontrado" }, { status: 404 })
    }

    const total = inventory.items.length
    const conferred = inventory.items.filter((i) => i.status === "CONFERRED").length
    const divergent = inventory.items.filter((i) => i.status === "DIVERGENT").length
    const missing = inventory.items.filter((i) => i.status === "MISSING").length

    return NextResponse.json({
      inventory,
      stats: {
        total,
        conferred,
        divergent,
        missing,
        percentage: total > 0 ? Math.round((conferred / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Erro ao buscar inventário" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        notes: notes !== undefined ? notes : undefined,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Erro ao atualizar inventário" }, { status: 500 })
  }
}
