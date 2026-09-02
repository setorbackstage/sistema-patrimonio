import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

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
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    const totalValue = room.assets.reduce((sum, asset) => sum + Number(asset.totalValue || 0), 0)

    return NextResponse.json({
      room,
      stats: {
        totalAssets: room.assets.length,
        totalValue,
      },
    })
  } catch (error) {
    console.error("Error fetching room details:", error)
    return NextResponse.json({ error: "Erro ao buscar detalhes da sala" }, { status: 500 })
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
    const { name, type, responsible, notes } = body

    const updated = await prisma.room.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        type: type !== undefined ? type : undefined,
        responsible: responsible !== undefined ? (responsible ? responsible.trim() : null) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating room:", error)
    return NextResponse.json({ error: "Erro ao atualizar sala" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assets: { where: { deletedAt: null } },
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    // Desvincular patrimônios para não perder o registro dos bens
    await prisma.asset.updateMany({
      where: { roomId: id },
      data: { roomId: null },
    })

    // Desvincular movimentações e itens de inventário
    await prisma.assetMovement.updateMany({
      where: { fromRoomId: id },
      data: { fromRoomId: null },
    })
    await prisma.assetMovement.updateMany({
      where: { toRoomId: id },
      data: { toRoomId: null },
    })
    await prisma.inventoryItem.updateMany({
      where: { foundRoomId: id },
      data: { foundRoomId: null },
    })

    await prisma.room.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Sala "${room.name}" removida com sucesso.`,
    })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json({ error: "Erro ao excluir sala" }, { status: 500 })
  }
}
