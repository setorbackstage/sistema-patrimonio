import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })

    // Tentar encontrar a aba com dados patrimoniais
    let sheetName = workbook.SheetNames[0]

    // Preferir abas com nome sugestivo
    for (const name of workbook.SheetNames) {
      const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      if (
        normalized.includes("patrimonio") ||
        normalized.includes("base") ||
        normalized.includes("existencia")
      ) {
        sheetName = name
        break
      }
    }

    const worksheet = workbook.Sheets[sheetName]
    const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: null,
    }) as (unknown[] | null)[]

    // Detectar a linha de cabeçalho (mais campos não-nulos)
    let headerRowIndex = 0
    let maxNonNull = 0

    for (let i = 0; i < Math.min(30, rawData.length); i++) {
      const row = rawData[i]
      if (!row) continue
      const nonNull = row.filter((v) => v !== null && v !== undefined && v !== "").length
      if (nonNull > maxNonNull) {
        maxNonNull = nonNull
        headerRowIndex = i
      }
    }

    const headerRow = rawData[headerRowIndex] as string[]

    // Mapear colunas por nome do cabeçalho
    const colMap: Record<string, number> = {}

    headerRow.forEach((header, index) => {
      if (!header) return
      const h = String(header)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()

      if (h.includes("unidade") && !h.includes("medida")) colMap.unitName = index
      if (h.includes("codigo") && h.includes("classific")) colMap.classificationCode = index
      if (h.includes("numero") && h.includes("patrimonio")) colMap.patrimonyNumber = index
      if (h.includes("patrimonio") && !colMap.patrimonyNumber) colMap.patrimonyNumber = index
      if (h.includes("caracteristica") || h.includes("identificacao") || h.includes("descricao")) {
        colMap.description = index
      }
      if (h.includes("unidade") && h.includes("medida")) colMap.unitOfMeasure = index
      if (h === "qtde" || h.includes("quantidade")) colMap.quantity = index
      if (h.includes("valor") && h.includes("unit")) colMap.unitValue = index
      if (h.includes("valor") && h.includes("global")) colMap.totalValue = index
      if (h.includes("observa")) colMap.notes = index
    })

    // Se não encontrou pelo cabeçalho, usar posição fixa (formato SEEDUC padrão)
    // Formato SEEDUC: B=Unidade, E=Classificação, F=Patrimônio, G=Descrição, J=UnidMedida, K=Qtde, L=ValUnit, M=ValGlobal, O=Observação
    if (Object.keys(colMap).length < 4) {
      // Tentar posição fixa baseada na análise da planilha
      const firstDataRow = rawData[headerRowIndex + 1] as unknown[]
      if (firstDataRow) {
        // Encontrar colunas por padrão de dados
        for (let i = 0; i < firstDataRow.length; i++) {
          const val = firstDataRow[i]
          if (typeof val === "string" && val.includes("CIEP")) colMap.unitName = i
          if (typeof val === "string" && /^\d+\.\d+\.\d+/.test(val)) colMap.classificationCode = i
          if (typeof val === "string" && /^\d{3,6}$/.test(val)) colMap.patrimonyNumber = i
        }
      }
    }

    // Processar linhas de dados
    const rows = []
    const seenPatrimonies = new Set<string>()

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i]
      if (!row) continue

      // Ignorar linhas completamente vazias
      const nonNull = (row as unknown[]).filter(
        (v) => v !== null && v !== undefined && v !== ""
      ).length
      if (nonNull < 3) continue

      const patrimonyNumber = row[colMap.patrimonyNumber] != null
        ? String(row[colMap.patrimonyNumber]).trim()
        : null

      // Ignorar linhas de total/resumo
      if (patrimonyNumber && patrimonyNumber.startsWith("R$")) continue
      if (patrimonyNumber && patrimonyNumber.includes("TOTAL")) continue

      const description = row[colMap.description] != null
        ? String(row[colMap.description]).trim()
        : null

      const classificationCode = row[colMap.classificationCode] != null
        ? String(row[colMap.classificationCode]).trim()
        : null

      const unitName = row[colMap.unitName] != null
        ? String(row[colMap.unitName]).trim()
        : null

      const unitOfMeasure = row[colMap.unitOfMeasure] != null
        ? String(row[colMap.unitOfMeasure]).trim()
        : "Unid"

      const quantity = row[colMap.quantity] != null
        ? Number(row[colMap.quantity])
        : 1

      const unitValue = row[colMap.unitValue] != null
        ? Number(row[colMap.unitValue])
        : 0

      const totalValue = row[colMap.totalValue] != null
        ? Number(row[colMap.totalValue])
        : unitValue * quantity

      let notes = row[colMap.notes] != null
        ? String(row[colMap.notes]).trim()
        : null

      // Transformação: "Não Fornecido" → null
      if (notes) {
        const normalized = notes.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (normalized === "nao fornecido" || normalized === "n/a" || normalized === "-") {
          notes = null
        }
      }

      // Validação
      const errors: string[] = []

      if (!patrimonyNumber) errors.push("Sem nº patrimônio")
      if (!description) errors.push("Sem descrição")
      if (isNaN(unitValue)) errors.push("Valor inválido")
      if (patrimonyNumber && seenPatrimonies.has(patrimonyNumber)) {
        errors.push("Duplicado no arquivo")
      }

      if (patrimonyNumber) seenPatrimonies.add(patrimonyNumber)

      rows.push({
        rowIndex: i + 1,
        patrimonyNumber,
        description,
        classificationCode,
        unitName,
        unitOfMeasure,
        quantity,
        unitValue,
        totalValue,
        notes,
        isValid: errors.length === 0,
        errors,
      })
    }

    return NextResponse.json({
      sheetName,
      headerRow: headerRow.filter(Boolean),
      columnMapping: colMap,
      rows,
      totalRows: rows.length,
      validRows: rows.filter((r) => r.isValid).length,
      invalidRows: rows.filter((r) => !r.isValid).length,
    })
  } catch (error) {
    console.error("Parse error:", error)
    return NextResponse.json(
      { error: "Erro ao processar o arquivo Excel" },
      { status: 500 }
    )
  }
}
