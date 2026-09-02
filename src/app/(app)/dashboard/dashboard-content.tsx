"use client"

import {
  Package,
  DollarSign,
  MapPinOff,
  Tag,
  TrendingUp,
  ArrowRight,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ORGANIZATION_NAME } from "@/lib/constants"
import Link from "next/link"

interface DashboardData {
  totalAssets: number
  activeAssets: number
  assetsWithoutRoom: number
  assetsWithoutLabel: number
  totalValue: number
  categoryData: { name: string; count: number }[]
  recentMovements: {
    id: string
    movedAt: Date
    asset: { patrimonyNumber: string; description: string }
    movedBy: { name: string } | null
  }[]
}

export function DashboardContent({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: "Total de Patrimônios",
      value: data.totalAssets.toLocaleString("pt-BR"),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/patrimonios",
    },
    {
      label: "Valor Patrimonial",
      value: formatCurrency(data.totalValue),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/relatorios",
    },
    {
      label: "Sem Localização",
      value: data.assetsWithoutRoom.toLocaleString("pt-BR"),
      icon: MapPinOff,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/patrimonios?filter=sem-localizacao",
    },
    {
      label: "Sem Etiqueta",
      value: data.assetsWithoutLabel.toLocaleString("pt-BR"),
      icon: Tag,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/patrimonios?filter=sem-etiqueta",
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{ORGANIZATION_NAME}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="stat-card group cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="stat-card-label">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Categorias */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Patrimônios por Categoria
            </CardTitle>
            <Link href="/admin/categorias">
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.categoryData.length > 0 ? (
              <div className="space-y-3">
                {data.categoryData.map((cat, i) => {
                  const maxCount = data.categoryData[0]?.count || 1
                  const percentage = Math.round((cat.count / data.totalAssets) * 100)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {cat.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2 shrink-0">
                            {cat.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(cat.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state py-8">
                <Package className="empty-state-icon" />
                <p className="empty-state-title">Nenhum dado ainda</p>
                <p className="empty-state-description">
                  Importe a planilha para visualizar os dados patrimoniais
                </p>
                <Link href="/patrimonios/importar" className="mt-4">
                  <Button>Importar planilha</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentMovements.length > 0 ? (
              <div className="space-y-4">
                {data.recentMovements.map((mov) => (
                  <div key={mov.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {mov.asset.patrimonyNumber} — {mov.asset.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Movimentado por {mov.movedBy?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(mov.movedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <Activity className="empty-state-icon" />
                <p className="empty-state-title">Sem atividade</p>
                <p className="empty-state-description">
                  Movimentações e ações aparecerão aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile */}
      <div className="mt-8 lg:hidden">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/patrimonios/importar">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              <span className="text-xs">Importar Planilha</span>
            </Button>
          </Link>
          <Link href="/busca">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Tag className="w-6 h-6 text-emerald-600" />
              <span className="text-xs">Buscar Patrimônio</span>
            </Button>
          </Link>
          <Link href="/inventario/novo">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Activity className="w-6 h-6 text-amber-600" />
              <span className="text-xs">Novo Inventário</span>
            </Button>
          </Link>
          <Link href="/etiquetas">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Tag className="w-6 h-6 text-purple-600" />
              <span className="text-xs">Gerar Etiquetas</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
