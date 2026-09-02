import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { toRoomId, reason, notes } = body

    if (!toRoomId) {
      return NextResponse.json({ error: "Sala de destino é obrigatória" }, { status: 400 })
    }

    const asset = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { patrimonyNumber: id }],
        deletedAt: null,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: "Patrimônio não encontrado" }, { status: 404 })
    }

    // Verificar se sala de destino existe
    const targetRoom = await prisma.room.findUnique({
      where: { id: toRoomId },
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
    })

    if (!targetRoom) {
      return NextResponse.json({ error: "Sala de destino não encontrada" }, { status: 404 })
    }

    const fromRoomId = asset.roomId

    // Executar transação: registrar movimentação e atualizar sala do patrimônio
    const [movement, updatedAsset] = await prisma.$transaction([
      prisma.assetMovement.create({
        data: {
          assetId: asset.id,
          fromRoomId,
          toRoomId,
          movedById: session.user.id,
          reason: reason || "Transferência de localização",
          notes: notes || null,
        },
        include: {
          fromRoom: true,
          toRoom: true,
          movedBy: { select: { name: true, email: true } },
        },
      }),
      prisma.asset.update({
        where: { id: asset.id },
        data: {
          roomId: toRoomId,
          updatedAt: new Date(),
        },
        include: {
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
      }),
    ])

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "MOVE",
        entity: "Asset",
        entityId: asset.id,
        oldData: { roomId: fromRoomId },
        newData: { roomId: toRoomId, reason },
      },
    })

    return NextResponse.json({
      success: true,
      movement,
      asset: updatedAsset,
    })
  } catch (error) {
    console.error("Error creating asset movement:", error)
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 })
  }
}
