import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

const ITEMS: [string, string][] = [
  ["BOMBA DE AGUA DANCOR 30CV 1F", "1.2.3.1.1.01.20"],
  ["CADEIRAO UNIVERSITARIO ESTOFADO", "1.2.3.1.1.01.23"],
  ["MESA ALUNO 4 LUGARES", "1.2.3.1.1.01.23"],
  ["ARMACO ACO PARA ELEVACAO CADEIRANTES", "1.2.3.1.1.01.23"],
  ["PROJETOR EPSON POWERLITE X515", "1.2.3.1.1.01.18"],
  ["NOTEBOOK DELL LATITUDE 3420", "1.2.3.1.1.01.17"],
  ["AR CONDICIONADO SPLIT 12000 BTUS", "1.2.3.1.1.01.06"],
  ["EXTINTOR PO QUIMICO 4KG", "1.2.3.1.1.01.12"],
  ["GUITARA ELETRICA TAGIMA T635", "1.2.3.1.1.01.13"],
  ["BOLA DE FUTSOL OFICIAL", "1.2.3.1.1.01.05"],
  ["MULTIMETRO DIGITAL MINIPA", "1.2.3.1.1.01.01"],
  ["QUADRO BRANCO 120X240", "1.2.3.1.1.01.04"],
  ["IMPRESSORA EPSON L3250", "1.2.3.1.1.01.16"],
  ["ESTABILIZADOR SMS 500VA", "1.2.3.1.1.01.15"],
  ["VENTILADOR DE COLUNA MALLORY", "1.2.3.1.1.01.21"],
]

const LABEL_STATUSES = ["NOT_GENERATED", "NOT_GENERATED", "NOT_GENERATED", "GENERATED", "PRINTED", "APPLIED"] as const

async function main() {
  const rooms = await prisma.room.findMany({ include: { floor: { include: { building: true } } } })
  const cats = await prisma.assetCategory.findMany()
  const catByCode = new Map(cats.map((c) => [c.code, c.id]))

  let n = 1
  for (let i = 0; i < 230; i++) {
    const [desc, code] = ITEMS[i % ITEMS.length]
    const num = String(n++).padStart(6, "0")
    // ~25 bens sem localização (roomId null), resto distribuído
    const noRoom = i % 9 === 0
    const status = LABEL_STATUSES[i % LABEL_STATUSES.length]
    await prisma.asset.create({
      data: {
        patrimonyNumber: num,
        description: `${desc} #${i + 1}`,
        categoryId: catByCode.get(code) ?? cats[0].id,
        roomId: noRoom ? null : rooms[i % rooms.length].id,
        unitId: rooms[0]?.floor.building.unitId ?? "ciep395",
        labelStatus: status as any,
        unitValue: 100 + (i % 50) * 10,
        totalValue: 100 + (i % 50) * 10,
        notes: null,
      },
    })
  }
  const total = await prisma.asset.count()
  const semSala = await prisma.asset.count({ where: { roomId: null } })
  const semEtiqueta = await prisma.asset.count({ where: { labelStatus: "NOT_GENERATED" } })
  console.log(`✅ ${total} bens criados | sem localização: ${semSala} | sem etiqueta: ${semEtiqueta}`)
}
main().finally(() => prisma.$disconnect())
