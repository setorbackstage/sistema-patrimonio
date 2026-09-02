import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

async function testAuth(email: string, pass: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: { equals: email.trim(), mode: "insensitive" },
      isActive: true,
      deletedAt: null,
    },
  })

  if (!user) {
    console.log(`❌ Usuário ${email} não encontrado no banco`)
    return
  }

  const isValid = await compare(pass, user.passwordHash)
  console.log(`Email: ${user.email} | Nome: ${user.name} | Senha válida: ${isValid ? "✅ SIM" : "❌ NÃO"}`)
}

async function run() {
  console.log("--- TESTANDO AUTENTICAÇÃO DIRETAMENTE NO BANCO ---")
  await testAuth("setorbackstage@gmail.com", "02122024Dn@")
  await testAuth("diretoria@ciep395.edu.br", "ciep395diretoria")
  await testAuth("admin@ciep395.edu.br", "admin123")
}

run().catch(console.error).finally(() => prisma.$disconnect())
