import { NextResponse } from "next/server"
import { deleteSessionCookie } from "@/lib/session"

export async function POST() {
  try {
    await deleteSessionCookie()
    return NextResponse.json({ success: true, message: "Sessão encerrada com sucesso" })
  } catch (error) {
    console.error("Logout API Error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sessão" }, { status: 500 })
  }
}
