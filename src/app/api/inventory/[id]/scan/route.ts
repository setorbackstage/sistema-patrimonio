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

    const { id: inventoryId } = await params
    const body = await request.json()
    const { code, currentRoomId } = body

    if (!code) {
      return NextResponse.json({ error: "Código de patrimônio é obrigatório" }, { status: 400 })
    }

    // Normalizar código lido (se for URL, extrair patrimônio)
    let patrimonyNumber = String(code).trim()
    if (patrimonyNumber.includes("/patrimonio/")) {
      patrimonyNumber = patrimonyNumber.split("/patrimonio/")[1].split("?")[0]
    }

    // 1. Buscar o bem no banco
    const asset = await prisma.asset.findFirst({
      where: {
        patrimonyNumber,
        deletedAt: null,
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
    })

    if (!asset) {
      return NextResponse.json({
        success: false,
        type: "NOT_FOUND",
        message: `Patrimônio ${patrimonyNumber} não encontrado no sistema`,
      })
    }

    // 2. Verificar se está no inventário
    let item = await prisma.inventoryItem.findFirst({
      where: {
        inventoryId,
        assetId: asset.id,
      },
    })

    const isCorrectRoom = !currentRoomId || asset.roomId === currentRoomId
    const itemStatus = isCorrectRoom ? "CONFERRED" : "DIVERGENT"

    // 3. Registrar impressão/aplicação da etiqueta física (fecha o ciclo)
    const existingLabel = await prisma.assetLabel.findFirst({
      where: { assetId: asset.id },
      orderBy: { generatedAt: "desc" },
    })

    if (existingLabel) {
      // Etiqueta já gerada/impressa: ao escanear o QR físico, ela foi APLICADA
      if (existingLabel.status !== "APPLIED") {
        await prisma.assetLabel.update({
          where: { id: existingLabel.id },
          data: {
            status: "APPLIED",
            printedAt: existingLabel.printedAt ?? new Date(),
            appliedAt: new Date(),
            printedById: existingLabel.printedById ?? session.user.id,
          },
        })
      }
      if (asset.labelStatus !== "APPLIED") {
        await prisma.asset.update({
          where: { id: asset.id },
          data: { labelStatus: "APPLIED" },
        })
      }
    } else if (asset.labelStatus !== "APPLIED") {
      // Nunca houve registro de etiqueta, mas o QR foi lido fisicamente:
      // cria o registro e marca como aplicada (etiquetada fora do sistema)
      await prisma.assetLabel.create({
        data: {
          assetId: asset.id,
          labelCode: asset.patrimonyNumber,
          status: "APPLIED",
          printedAt: new Date(),
          appliedAt: new Date(),
          printedById: session.user.id,
          notes: "Aplicada e confirmada via leitura de QR no inventário",
        },
      })
      await prisma.asset.update({
        where: { id: asset.id },
        data: { labelStatus: "APPLIED" },
      })
    }

    if (item) {
      // Atualizar item existente
      item = await prisma.inventoryItem.update({
        where: { id: item.id },
        data: {
          status: itemStatus,
          foundRoomId: currentRoomId || asset.roomId,
          verifiedAt: new Date(),
          verifiedById: session.user.id,
        },
      })
    } else {
      // Bem não constava no escopo inicial deste inventário, mas foi encontrado aqui
      item = await prisma.inventoryItem.create({
        data: {
          inventoryId,
          assetId: asset.id,
          status: "DIVERGENT",
          foundRoomId: currentRoomId || asset.roomId,
          verifiedAt: new Date(),
          verifiedById: session.user.id,
          notes: "Item encontrado não constava no escopo inicial",
        },
      })
    }

    return NextResponse.json({
      success: true,
      type: itemStatus,
      asset,
      item,
      isCorrectRoom,
      message: isCorrectRoom
        ? `Patrimônio ${patrimonyNumber} conferido com sucesso!`
        : `Divergência: Este item pertence a ${asset.room?.name || "outra sala"}!`,
    })
  } catch (error) {
    console.error("Error processing inventory scan:", error)
    return NextResponse.json({ error: "Erro ao processar leitura" }, { status: 500 })
  }
}
