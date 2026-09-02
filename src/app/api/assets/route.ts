import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 25
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")
    const roomId = searchParams.get("roomId")
    const status = searchParams.get("status")
    const labelStatus = searchParams.get("labelStatus")
    const unlocatedOnly = searchParams.get("unlocated") === "true"

    const where: Record<string, unknown> = { deletedAt: null }

    if (search) {
      where.OR = [
        { patrimonyNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }

    if (categoryId) where.categoryId = categoryId
    if (roomId) where.roomId = roomId
    if (unlocatedOnly) where.roomId = null
    if (status) where.status = status
    if (labelStatus) where.labelStatus = labelStatus

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: true,
          unit: true,
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
        orderBy: { patrimonyNumber: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json({ error: "Erro ao buscar patrimônios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      patrimonyNumber,
      description,
      categoryId,
      brand,
      model,
      serialNumber,
      unitOfMeasure = "Unid",
      quantity = 1,
      unitValue = 0,
      totalValue,
      status = "ACTIVE",
      condition = "NOT_EVALUATED",
      roomId,
      specificLocation,
      notes,
    } = body

    if (!patrimonyNumber || !description) {
      return NextResponse.json(
        { error: "Número do patrimônio e descrição são obrigatórios" },
        { status: 400 }
      )
    }

    const existing = await prisma.asset.findUnique({
      where: { patrimonyNumber: String(patrimonyNumber).trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Patrimônio ${patrimonyNumber} já está cadastrado` },
        { status: 409 }
      )
    }

    // Buscar unidade padrão do CIEP 395
    const unit = await prisma.unit.findFirst({
      where: { code: "180866" },
    })

    const finalTotalValue = totalValue !== undefined ? Number(totalValue) : Number(unitValue) * Number(quantity)

    const asset = await prisma.asset.create({
      data: {
        patrimonyNumber: String(patrimonyNumber).trim(),
        description: String(description).trim(),
        categoryId: categoryId || null,
        brand: brand?.trim() || null,
        model: model?.trim() || null,
        serialNumber: serialNumber?.trim() || null,
        unitOfMeasure: unitOfMeasure || "Unid",
        quantity: Number(quantity) || 1,
        unitValue: Number(unitValue) || 0,
        totalValue: finalTotalValue,
        status,
        condition,
        unitId: unit?.id || null,
        roomId: roomId || null,
        specificLocation: specificLocation?.trim() || null,
        notes: notes?.trim() || null,
        labelStatus: "NOT_GENERATED",
        createdById: session.user.id,
      },
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
    })

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Asset",
        entityId: asset.id,
        newData: {
          patrimonyNumber: asset.patrimonyNumber,
          description: asset.description,
          totalValue: asset.totalValue,
        },
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json({ error: "Erro ao criar patrimônio" }, { status: 500 })
  }
}
