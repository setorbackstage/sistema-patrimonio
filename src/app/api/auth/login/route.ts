import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"
import { setSessionCookie } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    let email = ""
    let password = ""

    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = await request.json()
      email = String(body.email || "").trim()
      password = String(body.password || "")
    } else if (contentType.includes("form") || contentType.includes("urlencoded")) {
      const formData = await request.formData()
      email = String(formData.get("email") || "").trim()
      password = String(formData.get("password") || "")
    } else {
      const text = await request.text()
      try {
        const body = JSON.parse(text)
        email = String(body.email || "").trim()
        password = String(body.password || "")
      } catch {
        const params = new URLSearchParams(text)
        email = String(params.get("email") || "").trim()
        password = String(params.get("password") || "")
      }
    }

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
