import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "setorbackstage@gmail.com"
  const password = "02122024Dn@"
  const name = "Diogo Peçanha"

  console.log(`Configurando usuário administrador principal: ${email}...`)

  const org = await prisma.organization.findFirst()
  const passwordHash = await hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
      name,
    },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      organizationId: org?.id,
    },
  })

  console.log(`✅ Usuário ${user.email} (${user.name}) configurado com sucesso como ADMIN!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
