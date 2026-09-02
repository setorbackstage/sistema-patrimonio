import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        _count: {
          select: {
            assets: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: [{ floor: { building: { name: "asc" } } }, { name: "asc" }],
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Erro ao buscar salas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, floorId, type = "OTHER", responsible, notes } = body

    if (!name || !floorId) {
      return NextResponse.json({ error: "Nome da sala e andar são obrigatórios" }, { status: 400 })
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        floorId,
        type,
        responsible: responsible?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Erro ao criar sala" }, { status: 500 })
  }
}
