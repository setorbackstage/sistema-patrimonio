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
    const { name, number, buildingId } = body

    if (!name || !buildingId) {
      return NextResponse.json({ error: "Nome e prédio são obrigatórios" }, { status: 400 })
    }

    const floor = await prisma.floor.create({
      data: {
        name: name.trim(),
        number: Number(number) || 0,
        buildingId,
      },
    })

    return NextResponse.json(floor, { status: 201 })
  } catch (error) {
    console.error("Error creating floor:", error)
    return NextResponse.json({ error: "Erro ao criar andar" }, { status: 500 })
  }
}
