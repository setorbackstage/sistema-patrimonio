import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, isActive } = body

    const dataToUpdate: any = {}
    if (name !== undefined) dataToUpdate.name = name.trim()
    if (email !== undefined) dataToUpdate.email = email.toLowerCase().trim()
    if (role !== undefined) dataToUpdate.role = role
    if (isActive !== undefined) dataToUpdate.isActive = isActive
    if (password && password.trim().length >= 6) {
      dataToUpdate.passwordHash = await hash(password.trim(), 12)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 })
    }

    const { id } = await params

    // Impedir auto-exclusão do próprio usuário logado
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Você não pode excluir sua própria conta enquanto estiver conectado" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
  }
}
