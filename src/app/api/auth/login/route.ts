import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"
import { setSessionCookie } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || "").trim()
    const password = String(body.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
        isActive: true,
        deletedAt: null,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 })
    }

    const isMatch = await compare(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 })
    }

    // Atualizar último login de forma assíncrona
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
    } catch (e) {
      console.error("Erro ao atualizar data de login:", e)
    }

    // Criar e definir cookie de sessão
    await setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login API Error:", error)
    return NextResponse.json({ error: "Erro interno no servidor de autenticação" }, { status: 500 })
  }
}
