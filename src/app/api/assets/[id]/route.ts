import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Permite buscar por UUID ou por patrimonyNumber
    const asset = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { patrimonyNumber: id }],
        deletedAt: null,
      },
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
        movements: {
          include: {
            fromRoom: true,
            toRoom: true,
            movedBy: { select: { name: true, email: true } },
          },
          orderBy: { movedAt: "desc" },
        },
        inventoryItems: {
          include: {
            inventory: true,
            verifiedBy: { select: { name: true } },
          },
          orderBy: { verifiedAt: "desc" },
        },
        createdBy: { select: { name: true, email: true } },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: "Patrimônio não encontrado" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json({ error: "Erro ao buscar patrimônio" }, { status: 500 })
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

    const existing = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { patrimonyNumber: id }],
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Patrimônio não encontrado" }, { status: 404 })
    }

    const {
      description,
      categoryId,
      brand,
      model,
      serialNumber,
      unitOfMeasure,
      quantity,
      unitValue,
      totalValue,
      status,
      condition,
      labelStatus,
      roomId,
      specificLocation,
      notes,
    } = body

    const updated = await prisma.asset.update({
      where: { id: existing.id },
      data: {
        description: description !== undefined ? String(description).trim() : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        brand: brand !== undefined ? (brand ? String(brand).trim() : null) : undefined,
        model: model !== undefined ? (model ? String(model).trim() : null) : undefined,
        serialNumber: serialNumber !== undefined ? (serialNumber ? String(serialNumber).trim() : null) : undefined,
        unitOfMeasure: unitOfMeasure !== undefined ? String(unitOfMeasure) : undefined,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        unitValue: unitValue !== undefined ? Number(unitValue) : undefined,
        totalValue: totalValue !== undefined ? Number(totalValue) : undefined,
        status: status !== undefined ? status : undefined,
        condition: condition !== undefined ? condition : undefined,
        labelStatus: labelStatus !== undefined ? labelStatus : undefined,
        roomId: roomId !== undefined ? roomId : undefined,
        specificLocation: specificLocation !== undefined ? (specificLocation ? String(specificLocation).trim() : null) : undefined,
        notes: notes !== undefined ? (notes ? String(notes).trim() : null) : undefined,
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

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        entity: "Asset",
        entityId: existing.id,
        oldData: {
          description: existing.description,
          status: existing.status,
          roomId: existing.roomId,
        },
        newData: {
          description: updated.description,
          status: updated.status,
          roomId: updated.roomId,
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json({ error: "Erro ao atualizar patrimônio" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas ADMIN ou OPERATOR pode deletar (soft delete)
    if (session.user.role !== "ADMIN" && session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 })
    }

    const { id } = await params

    const existing = await prisma.asset.findFirst({
      where: {
        OR: [{ id }, { patrimonyNumber: id }],
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Patrimônio não encontrado" }, { status: 404 })
    }

    // Soft delete
    await prisma.asset.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Asset",
        entityId: existing.id,
        oldData: {
          patrimonyNumber: existing.patrimonyNumber,
          description: existing.description,
        },
      },
    })

    return NextResponse.json({ success: true, message: "Patrimônio removido com sucesso" })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json({ error: "Erro ao excluir patrimônio" }, { status: 500 })
  }
}
