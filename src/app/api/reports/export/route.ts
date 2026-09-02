import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import * as XLSX from "xlsx"
import { formatCurrency } from "@/lib/utils"
import { ORGANIZATION_NAME } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "general"

    const assets = await prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        unit: true,
        room: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
      orderBy: { patrimonyNumber: "asc" },
    })

    if (type === "xlsx") {
      // Gerar planilha Excel formatada conforme padrão SEEDUC-RJ Anexo IV
      const data = assets.map((a, i) => ({
        "Item": i + 1,
        "Unidade": a.unit?.name || ORGANIZATION_NAME,
        "Cód. Classificação": a.category?.code || "—",
        "Classificação": a.category?.name || "—",
        "Nº Patrimônio": a.patrimonyNumber,
        "Descrição": a.description,
        "Marca/Modelo": `${a.brand || ""} ${a.model || ""}`.trim() || "—",
        "Nº Série": a.serialNumber || "—",
        "Localização": a.room ? `${a.room.floor.building.name} - ${a.room.name}` : "Sem localização",
        "Posição Específica": a.specificLocation || "—",
        "Unid. Medida": a.unitOfMeasure,
        "Qtde": a.quantity,
        "Valor Unitário (R$)": Number(a.unitValue),
        "Valor Global (R$)": Number(a.totalValue),
        "Status": a.status,
        "Estado": a.condition,
        "Observação": a.notes || "",
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Inventario_Existencias_Fisicas")

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="Relatorio_Patrimonial_${ORGANIZATION_NAME.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
        },
      })
    }

    return NextResponse.json({ total: assets.length })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Erro ao gerar exportação" }, { status: 500 })
  }
}
