import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        unit: true,
        responsible: { select: { name: true, email: true } },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { startedAt: "desc" },
    })

    return NextResponse.json(inventories)
  } catch (error) {
    console.error("Error fetching inventories:", error)
    return NextResponse.json({ error: "Erro ao buscar inventários" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, year = new Date().getFullYear(), roomId, notes } = body

    if (!title) {
      return NextResponse.json({ error: "Título do inventário é obrigatório" }, { status: 400 })
    }

    // Buscar unidade CIEP 395
    const unit = await prisma.unit.findFirst({ where: { code: "180866" } })

    // Criar ciclo de inventário
    const inventory = await prisma.inventory.create({
      data: {
        title: title.trim(),
        year: Number(year),
        unitId: unit?.id,
        responsibleId: session.user.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        notes: notes?.trim() || null,
      },
    })

    // Preencher itens esperados do inventário com base no escopo (sala ou toda a escola)
    const assetWhere: Record<string, unknown> = { deletedAt: null }
    if (roomId) {
      assetWhere.roomId = roomId
    }

    const expectedAssets = await prisma.asset.findMany({
      where: assetWhere,
      select: { id: true, roomId: true },
    })

    if (expectedAssets.length > 0) {
      await prisma.inventoryItem.createMany({
        data: expectedAssets.map((asset) => ({
          inventoryId: inventory.id,
          assetId: asset.id,
          foundRoomId: null,
          status: "MISSING",
        })),
      })
    }

    return NextResponse.json(inventory, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory:", error)
    return NextResponse.json({ error: "Erro ao criar inventário" }, { status: 500 })
  }
}
