import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"
import prisma from "../src/lib/prisma"

async function run() {
  const filePath = path.resolve(
    __dirname,
    "../../Planilhas com dados Reais/ExistenciaFisicasPorUnidade.xlsx"
  )

  if (!fs.existsSync(filePath)) {
    console.error("Arquivo não encontrado:", filePath)
    process.exit(1)
  }

  console.log("📄 Lendo planilha:", filePath)
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    defval: null,
  })

  console.log(`📊 Total de linhas brutas: ${rows.length}`)

  // Buscar unidade e categorias do banco
  const unit = await prisma.unit.findFirst()
  const categories = await prisma.assetCategory.findMany()
  const categoryMap = new Map<string, string>()
  categories.forEach((c) => categoryMap.set(c.code, c.id))

  let imported = 0
  let skipped = 0

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r || r.length === 0) continue

    const patrimonyNumber = r[0]?.toString().trim()
    const description = r[1]?.toString().trim()
    const siafCode = r[2]?.toString().trim()
    const qty = parseInt(r[3]?.toString() || "1") || 1
    const unitValStr = r[4]?.toString().replace(/[^\d.,]/g, "").replace(",", ".") || "0"
    const totalValStr = r[5]?.toString().replace(/[^\d.,]/g, "").replace(",", ".") || "0"
    const notes = r[8]?.toString().trim() || null

    if (!patrimonyNumber || patrimonyNumber.toLowerCase().includes("patrimônio") || patrimonyNumber === "Total") {
      skipped++
      continue
    }

    if (!description || description.toLowerCase() === "não fornecido") {
      skipped++
      continue
    }

    const unitValue = parseFloat(unitValStr) || 0
    const totalValue = parseFloat(totalValStr) || (unitValue * qty)

    const categoryId = siafCode ? categoryMap.get(siafCode) || null : null

    try {
      await prisma.asset.upsert({
        where: { patrimonyNumber },
        update: {
          description,
          categoryId,
          quantity: qty,
          unitValue,
          totalValue,
          notes,
          unitId: unit?.id,
        },
        create: {
          patrimonyNumber,
          barcode: patrimonyNumber,
          description,
          categoryId,
          quantity: qty,
          unitValue,
          totalValue,
          notes,
          unitId: unit?.id,
          status: "ACTIVE",
          condition: "GOOD",
          labelStatus: "NOT_GENERATED",
        },
      })
      imported++
      if (imported % 100 === 0) {
        console.log(`✅ Importados ${imported} patrimônios...`)
      }
    } catch (e) {
      console.error(`Erro ao importar ${patrimonyNumber}:`, e)
      skipped++
    }
  }

  console.log(`\n🎉 Importação concluída!`)
  console.log(`📦 Patrimônios importados: ${imported}`)
  console.log(`⏭️ Linhas ignoradas/cabeçalhos: ${skipped}`)
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
