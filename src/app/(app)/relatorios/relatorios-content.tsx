"use client"

import { useState } from "react"
import {
  FileSpreadsheet,
  FileText,
  DollarSign,
  Package,
  Layers,
  MapPin,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
  ASSET_STATUS_MAP,
  ASSET_CONDITION_MAP,
  ORGANIZATION_NAME,
  ORGANIZATION_FULL,
} from "@/lib/constants"

interface CategoryStat {
  code: string
  name: string
  count: number
  totalValue: number
}

interface RoomStat {
  id: string
  name: string
  building: string
  floor: string
  count: number
  totalValue: number
}

interface ConditionStat {
  condition: string
  count: number
  totalValue: number
}

interface StatusStat {
  status: string
  count: number
  totalValue: number
}

interface Props {
  totalAssets: number
  totalValue: number
  categoriesReport: CategoryStat[]
  roomsReport: RoomStat[]
  conditionReport: ConditionStat[]
  statusReport: StatusStat[]
}

export function RelatoriosContent({
  totalAssets,
  totalValue,
  categoriesReport,
  roomsReport,
  conditionReport,
  statusReport,
}: Props) {
  const [activeTab, setActiveTab] = useState<"CATEGORIES" | "ROOMS" | "CONDITIONS" | "STATUS">("CATEGORIES")

  const handleExportXlsx = () => {
    window.open("/api/reports/export?type=xlsx", "_blank")
  }

  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header (Oculto na impressão) */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">Relatórios Patrimoniais</h1>
            <p className="page-subtitle">
              Demonstrativo consolidado de existências físicas — Anexo IV (IN 41/2017)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintPdf}>
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </Button>
            <Button size="sm" onClick={handleExportXlsx} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (XLSX)</span>
            </Button>
          </div>
        </div>

        {/* Métricas Consolidadas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <span className="stat-card-label">Acervo Total de Bens</span>
            <span className="stat-card-value text-blue-600">
              {totalAssets.toLocaleString("pt-BR")} itens
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Valor Total do Patrimônio</span>
            <span className="stat-card-value text-emerald-600">
              {formatCurrency(totalValue)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Salas com Patrimônio</span>
            <span className="stat-card-value text-purple-600">
              {roomsReport.length} ambientes
            </span>
          </div>
        </div>

        {/* Tabs de Seleção de Relatório */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3 overflow-x-auto">
          <Button
            variant={activeTab === "CATEGORIES" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("CATEGORIES")}
          >
            Por Classificação SIAF ({categoriesReport.length})
          </Button>
          <Button
            variant={activeTab === "ROOMS" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("ROOMS")}
          >
            Por Localização / Sala ({roomsReport.length})
          </Button>
          <Button
            variant={activeTab === "CONDITIONS" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("CONDITIONS")}
          >
            Por Estado de Conservação
          </Button>
          <Button
            variant={activeTab === "STATUS" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("STATUS")}
          >
            Por Status Operacional
          </Button>
        </div>
      </div>

      {/* Cabeçalho Oficial do Relatório (visível na impressão) */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-black pb-4">
        <h2 className="text-xl font-black uppercase tracking-tight">{ORGANIZATION_NAME}</h2>
        <p className="text-xs text-gray-700">{ORGANIZATION_FULL}</p>
        <p className="text-sm font-bold uppercase mt-2">
          INVENTÁRIO DAS EXISTÊNCIAS FÍSICAS — ANEXO IV (IN 41/2017)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Emissão em: {new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} • Total: {totalAssets} itens ({formatCurrency(totalValue)})
        </p>
      </div>

      {/* Relatório 1: Categorias SIAF */}
      {activeTab === "CATEGORIES" && (
        <Card>
          <CardHeader className="print:hidden">
            <CardTitle className="text-base">Demonstrativo por Classificação SIAF</CardTitle>
            <CardDescription>Agrupamento por código orçamentário patrimonial</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código SIAF</th>
                  <th>Nome da Classificação</th>
                  <th className="text-right">Quantidade</th>
                  <th className="text-right">Valor Total (R$)</th>
                  <th className="text-right">% do Valor</th>
                </tr>
              </thead>
              <tbody>
                {categoriesReport.map((cat, idx) => {
                  const perc = totalValue > 0 ? ((cat.totalValue / totalValue) * 100).toFixed(1) : "0"

                  return (
                    <tr key={idx}>
                      <td className="font-mono font-bold text-blue-700">{cat.code}</td>
                      <td className="font-medium text-gray-900">{cat.name}</td>
                      <td className="text-right font-semibold text-gray-700">{cat.count}</td>
                      <td className="text-right font-bold text-emerald-600">
                        {formatCurrency(cat.totalValue)}
                      </td>
                      <td className="text-right text-xs text-gray-500">{perc}%</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                  <td colSpan={2}>TOTAL GERAL</td>
                  <td className="text-right">{totalAssets}</td>
                  <td className="text-right text-emerald-700">{formatCurrency(totalValue)}</td>
                  <td className="text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Relatório 2: Localizações / Salas */}
      {activeTab === "ROOMS" && (
        <Card>
          <CardHeader className="print:hidden">
            <CardTitle className="text-base">Demonstrativo por Ambiente / Sala</CardTitle>
            <CardDescription>Distribuição de bens e valores por espaço físico</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prédio</th>
                  <th>Andar</th>
                  <th>Sala / Ambiente</th>
                  <th className="text-right">Qtd Itens</th>
                  <th className="text-right">Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {roomsReport.map((room) => (
                  <tr key={room.id}>
                    <td className="text-gray-600 font-medium">{room.building}</td>
                    <td className="text-gray-500 text-xs">{room.floor}</td>
                    <td className="font-bold text-gray-900">{room.name}</td>
                    <td className="text-right font-semibold text-blue-600">{room.count}</td>
                    <td className="text-right font-bold text-emerald-600">
                      {formatCurrency(room.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Relatório 3: Estado de Conservação */}
      {activeTab === "CONDITIONS" && (
        <Card>
          <CardHeader className="print:hidden">
            <CardTitle className="text-base">Demonstrativo por Estado de Conservação</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estado Físico</th>
                  <th className="text-right">Qtd Itens</th>
                  <th className="text-right">Valor Total (R$)</th>
                  <th className="text-right">% Itens</th>
                </tr>
              </thead>
              <tbody>
                {conditionReport.map((cr, idx) => {
                  const condInfo = ASSET_CONDITION_MAP[cr.condition as keyof typeof ASSET_CONDITION_MAP]
                  const perc = totalAssets > 0 ? ((cr.count / totalAssets) * 100).toFixed(1) : "0"

                  return (
                    <tr key={idx}>
                      <td>
                        <Badge variant={condInfo?.color || "secondary"}>
                          {condInfo?.label || cr.condition}
                        </Badge>
                      </td>
                      <td className="text-right font-semibold text-gray-900">{cr.count}</td>
                      <td className="text-right font-bold text-emerald-600">{formatCurrency(cr.totalValue)}</td>
                      <td className="text-right text-xs text-gray-500">{perc}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Relatório 4: Status Operacional */}
      {activeTab === "STATUS" && (
        <Card>
          <CardHeader className="print:hidden">
            <CardTitle className="text-base">Demonstrativo por Status Operacional</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th className="text-right">Qtd Itens</th>
                  <th className="text-right">Valor Total (R$)</th>
                  <th className="text-right">% Itens</th>
                </tr>
              </thead>
              <tbody>
                {statusReport.map((sr, idx) => {
                  const statusInfo = ASSET_STATUS_MAP[sr.status as keyof typeof ASSET_STATUS_MAP]
                  const perc = totalAssets > 0 ? ((sr.count / totalAssets) * 100).toFixed(1) : "0"

                  return (
                    <tr key={idx}>
                      <td>
                        <Badge variant={statusInfo?.color || "secondary"}>
                          {statusInfo?.label || sr.status}
                        </Badge>
                      </td>
                      <td className="text-right font-semibold text-gray-900">{sr.count}</td>
                      <td className="text-right font-bold text-emerald-600">{formatCurrency(sr.totalValue)}</td>
                      <td className="text-right text-xs text-gray-500">{perc}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
