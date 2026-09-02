import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { setSessionCookie } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const role = body.role === "ADMIN" ? "ADMIN" : "OPERATOR"

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existing = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        deletedAt: null,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Este endereço de email já está cadastrado no sistema" },
        { status: 409 }
      )
    }

    const org = await prisma.organization.findFirst()
    const passwordHash = await hash(password, 12)

    // Criar o novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        organizationId: org?.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Logar automaticamente o novo usuário
    await setSessionCookie(newUser)

    return NextResponse.json(
      {
        success: true,
        user: newUser,
        message: "Conta criada com sucesso!",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register API Error:", error)
    return NextResponse.json(
      { error: "Erro ao criar nova conta de usuário" },
      { status: 500 }
    )
  }
}
