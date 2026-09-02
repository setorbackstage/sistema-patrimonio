import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface ImportRow {
  rowIndex: number
  patrimonyNumber: string | null
  description: string | null
  classificationCode: string | null
  unitName: string | null
  unitOfMeasure: string | null
  quantity: number | null
  unitValue: number | null
  totalValue: number | null
  notes: string | null
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { rows } = (await request.json()) as { rows: ImportRow[] }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Nenhum dado para importar" }, { status: 400 })
    }

    let importedRows = 0
    let duplicateRows = 0
    let invalidRows = 0
    let ignoredRows = 0
    const errors: { row: number; message: string }[] = []

    // Buscar unidade padrão (CIEP 395)
    let defaultUnit = await prisma.unit.findFirst({
      where: { code: "180866" },
    })

    if (!defaultUnit) {
      // Criar se não existir
      const org = await prisma.organization.findFirst()
      if (org) {
        defaultUnit = await prisma.unit.create({
          data: {
            organizationId: org.id,
            name: "CIEP 395 LUIZ HENRIQUE REZENDE NOVAES",
            code: "180866",
          },
        })
      }
    }

    // Cache de categorias
    const categoryCache: Record<string, string> = {}
    const existingCategories = await prisma.assetCategory.findMany()
    for (const cat of existingCategories) {
      categoryCache[cat.code] = cat.id
    }

    // Criar log de importação
    const importLog = await prisma.importLog.create({
      data: {
        filename: "import-" + new Date().toISOString(),
        status: "PROCESSING",
        totalRows: rows.length,
        importedById: session.user.id,
      },
    })

    // Processar cada linha
    for (const row of rows) {
      try {
        if (!row.patrimonyNumber || !row.description) {
          invalidRows++
          errors.push({
            row: row.rowIndex,
            message: "Patrimônio ou descrição ausente",
          })
          continue
        }

        // Verificar duplicata no banco
        const existing = await prisma.asset.findUnique({
          where: { patrimonyNumber: row.patrimonyNumber },
        })

        if (existing) {
          duplicateRows++
          errors.push({
            row: row.rowIndex,
            message: `Patrimônio ${row.patrimonyNumber} já existe no sistema`,
          })
          continue
        }

        // Resolver categoria
        let categoryId: string | null = null
        if (row.classificationCode) {
          if (categoryCache[row.classificationCode]) {
            categoryId = categoryCache[row.classificationCode]
          } else {
            // Criar categoria se não existir
            const newCat = await prisma.assetCategory.create({
              data: {
                code: row.classificationCode,
                name: `Categoria ${row.classificationCode}`,
              },
            })
            categoryCache[row.classificationCode] = newCat.id
            categoryId = newCat.id
          }
        }

        // Criar patrimônio
        await prisma.asset.create({
          data: {
            patrimonyNumber: row.patrimonyNumber,
            description: row.description,
            categoryId,
            unitOfMeasure: row.unitOfMeasure || "Unid",
            quantity: row.quantity || 1,
            unitValue: row.unitValue || 0,
            totalValue: row.totalValue || row.unitValue || 0,
            notes: row.notes,
            unitId: defaultUnit?.id,
            status: "ACTIVE",
            condition: "NOT_EVALUATED",
            labelStatus: "NOT_GENERATED",
            importSource: "XLSX Import",
            importedAt: new Date(),
            createdById: session.user.id,
          },
        })

        importedRows++
      } catch (err) {
        invalidRows++
        errors.push({
          row: row.rowIndex,
          message: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }
    }

    // Atualizar log de importação
    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: errors.length > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED",
        importedRows,
        duplicateRows,
        invalidRows,
        ignoredRows,
        errors: errors.length > 0 ? errors : undefined,
        completedAt: new Date(),
      },
    })

    // Registrar na auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "IMPORT",
        entity: "Asset",
        newData: {
          totalRows: rows.length,
          importedRows,
          duplicateRows,
          invalidRows,
        },
      },
    })

    return NextResponse.json({
      totalRows: rows.length,
      importedRows,
      duplicateRows,
      invalidRows,
      ignoredRows,
      errors,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Erro ao importar dados" },
      { status: 500 }
    )
  }
}
