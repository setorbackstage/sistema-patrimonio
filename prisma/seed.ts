// ==============================================
// SEED — DADOS INICIAIS DO SISTEMA
// ==============================================

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const SIAF_CATEGORIES = [
  { code: "1.2.3.1.1.01.02", name: "Aparelhos de Medição e Orientação" },
  { code: "1.2.3.1.1.01.04", name: "Aparelhos e Utensílios Pedagógicos" },
  { code: "1.2.3.1.1.01.05", name: "Equipamentos Esportivos e de Lazer" },
  { code: "1.2.3.1.1.01.06", name: "Aparelhos e Equipamentos de Climatização" },
  { code: "1.2.3.1.1.01.12", name: "Equipamentos de Proteção e Segurança" },
  { code: "1.2.3.1.1.01.13", name: "Instrumentos Musicais e Artísticos" },
  { code: "1.2.3.1.1.01.15", name: "Equipamentos de Energia e Proteção Elétrica" },
  { code: "1.2.3.1.1.01.16", name: "Máquinas e Equipamentos de Escritório" },
  { code: "1.2.3.1.1.01.17", name: "Equipamentos de Informática" },
  { code: "1.2.3.1.1.01.18", name: "Equipamentos Audiovisuais" },
  { code: "1.2.3.1.1.01.19", name: "Veículos e Componentes" },
  { code: "1.2.3.1.1.01.20", name: "Equipamentos Hidráulicos e Elétricos" },
  { code: "1.2.3.1.1.01.21", name: "Outros Equipamentos" },
  { code: "1.2.3.1.1.01.23", name: "Mobiliário em Geral" },
  { code: "1.2.3.1.1.01.38", name: "Conjuntos e Kits Especiais" },
]

async function main() {
  console.log("🌱 Iniciando seed...")

  // 1. Criar organização
  const org = await prisma.organization.upsert({
    where: { code: "SEEDUC-RJ" },
    update: {},
    create: {
      name: "Secretaria de Estado de Educação do Rio de Janeiro",
      code: "SEEDUC-RJ",
    },
  })
  console.log(`✅ Organização: ${org.name}`)

  // 2. Criar unidade
  const unit = await prisma.unit.upsert({
    where: { id: "ciep395" },
    update: {},
    create: {
      id: "ciep395",
      organizationId: org.id,
      name: "CIEP 395 LUIZ HENRIQUE REZENDE NOVAES",
      code: "180866",
    },
  })
  console.log(`✅ Unidade: ${unit.name}`)

  // 3. Criar categorias SIAF
  for (const cat of SIAF_CATEGORIES) {
    await prisma.assetCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name },
      create: { code: cat.code, name: cat.name },
    })
  }
  console.log(`✅ ${SIAF_CATEGORIES.length} categorias criadas`)

  // 4. Criar usuários do sistema
  const adminHash = await hash("admin123", 12)
  const diretoriaHash = await hash("ciep395diretoria", 12)
  const operadorHash = await hash("operador123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@ciep395.edu.br" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Administrador do Sistema",
      email: "admin@ciep395.edu.br",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  const diretoria = await prisma.user.upsert({
    where: { email: "diretoria@ciep395.edu.br" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Diretoria Geral - CIEP 395",
      email: "diretoria@ciep395.edu.br",
      passwordHash: diretoriaHash,
      role: "ADMIN",
    },
  })

  const operador = await prisma.user.upsert({
    where: { email: "operador@ciep395.edu.br" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Agente de Patrimônio",
      email: "operador@ciep395.edu.br",
      passwordHash: operadorHash,
      role: "OPERATOR",
    },
  })

  console.log(`✅ Usuários criados:`)
  console.log(`   - ${admin.email} (ADMIN)`)
  console.log(`   - ${diretoria.email} (ADMIN - Diretoria Geral)`)
  console.log(`   - ${operador.email} (OPERATOR - Agente de Patrimônio)`)

  // 5. Criar prédio e andares iniciais
  const building = await prisma.building.upsert({
    where: { id: "predio-principal" },
    update: {},
    create: {
      id: "predio-principal",
      unitId: unit.id,
      name: "Prédio Principal",
      description: "Prédio principal do CIEP 395",
    },
  })

  const floors = [
    { id: "terreo", name: "Térreo", number: 0 },
    { id: "1andar", name: "1º Andar", number: 1 },
    { id: "2andar", name: "2º Andar", number: 2 },
  ]

  for (const floor of floors) {
    await prisma.floor.upsert({
      where: { id: floor.id },
      update: {},
      create: {
        id: floor.id,
        buildingId: building.id,
        name: floor.name,
        number: floor.number,
      },
    })
  }
  console.log(`✅ Prédio: ${building.name} com ${floors.length} andares`)

  // 6. Criar algumas salas iniciais
  const rooms = [
    { id: "secretaria", floorId: "terreo", name: "Secretaria", type: "SECRETARY" as const },
    { id: "diretoria", floorId: "terreo", name: "Diretoria", type: "PRINCIPAL_OFFICE" as const },
    { id: "coordenacao", floorId: "terreo", name: "Coordenação", type: "COORDINATION" as const },
    { id: "sala-professores", floorId: "terreo", name: "Sala dos Professores", type: "TEACHERS_ROOM" as const },
    { id: "biblioteca", floorId: "terreo", name: "Biblioteca", type: "LIBRARY" as const },
    { id: "cozinha", floorId: "terreo", name: "Cozinha", type: "KITCHEN" as const },
    { id: "refeitorio", floorId: "terreo", name: "Refeitório", type: "CAFETERIA" as const },
    { id: "almoxarifado", floorId: "terreo", name: "Almoxarifado", type: "STORAGE" as const },
    { id: "lab-info", floorId: "1andar", name: "Laboratório de Informática", type: "COMPUTER_LAB" as const },
    { id: "lab-ciencias", floorId: "1andar", name: "Laboratório de Ciências", type: "LABORATORY" as const },
  ]

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {},
      create: room,
    })
  }
  console.log(`✅ ${rooms.length} salas criadas`)

  console.log("\n🎉 Seed concluído com sucesso!")
  console.log("\n📋 Credenciais de acesso:")
  console.log("   Email: admin@ciep395.edu.br")
  console.log("   Senha: admin123")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
