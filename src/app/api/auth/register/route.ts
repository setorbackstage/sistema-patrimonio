import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { setSessionCookie } from "@/lib/session"

type UserRole = "ADMIN" | "OPERATOR" | "AUDITOR" | "VIEWER"

export async function POST(request: NextRequest) {
  try {
    let name = ""
    let email = ""
    let password = ""
    let roleStr = "OPERATOR"

    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = await request.json()
      name = String(body.name || "").trim()
      email = String(body.email || "").trim().toLowerCase()
      password = String(body.password || "")
      roleStr = String(body.role || "OPERATOR").toUpperCase()
    } else if (contentType.includes("form") || contentType.includes("urlencoded")) {
      const formData = await request.formData()
      name = String(formData.get("name") || "").trim()
      email = String(formData.get("email") || "").trim().toLowerCase()
      password = String(formData.get("password") || "")
      roleStr = String(formData.get("role") || "OPERATOR").toUpperCase()
    } else {
      const text = await request.text()
      try {
        const body = JSON.parse(text)
        name = String(body.name || "").trim()
        email = String(body.email || "").trim().toLowerCase()
        password = String(body.password || "")
        roleStr = String(body.role || "OPERATOR").toUpperCase()
      } catch {
        const params = new URLSearchParams(text)
        name = String(params.get("name") || "").trim()
        email = String(params.get("email") || "").trim().toLowerCase()
        password = String(params.get("password") || "")
        roleStr = String(params.get("role") || "OPERATOR").toUpperCase()
      }
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      )
    }

    // Mapear role para valor válido
    const validRole: UserRole = ["ADMIN", "OPERATOR", "AUDITOR", "VIEWER"].includes(roleStr)
      ? (roleStr as UserRole)
      : "OPERATOR"

    // Verificar se email já existe
    const existing = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Este endereço de email já está cadastrado no sistema." },
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
        role: validRole,
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
    const message = error instanceof Error ? error.message : "Erro interno no servidor"
    return NextResponse.json(
      { error: `Erro ao criar nova conta: ${message}` },
      { status: 500 }
    )
  }
}
