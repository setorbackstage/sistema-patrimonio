import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { UsuariosContent } from "./usuarios-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Usuários e Permissões – SisPatrimônio",
  description: "Gerenciamento de usuários e controle de acesso",
}

export default async function UsuariosPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    })

    return <UsuariosContent users={JSON.parse(JSON.stringify(users))} />
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return <UsuariosContent users={[]} />
  }
}
