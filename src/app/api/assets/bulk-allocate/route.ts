import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { assetIds, roomId, specificLocation } = body

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "Nenhum patrimônio selecionado" }, { status: 400 })
    }

    // Atualizar todos os patrimônios selecionados
    const result = await prisma.asset.updateMany({
      where: {
        id: { in: assetIds },
        deletedAt: null,
      },
      data: {
        roomId: roomId || null,
        specificLocation: specificLocation ? String(specificLocation).trim() : null,
      },
    })

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Asset",
        entityId: "BULK_ALLOCATE",
        newData: {
          allocatedCount: result.count,
          roomId,
          specificLocation,
          assetIds,
        },
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} patrimônio(s) alocado(s) com sucesso.`,
    })
  } catch (error) {
    console.error("Error bulk allocating assets:", error)
    return NextResponse.json({ error: "Erro ao alocar patrimônios" }, { status: 500 })
  }
}
