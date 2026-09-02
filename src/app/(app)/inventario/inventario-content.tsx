"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ClipboardCheck,
  Plus,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { INVENTORY_STATUS_MAP } from "@/lib/constants"
import { formatDateTime } from "@/lib/utils"

interface InventoryItem {
  id: string
  title: string
  year: number
  status: string
  startedAt: string
  completedAt: string | null
  responsibleName: string
  total: number
  conferred: number
  divergent: number
  missing: number
  percentage: number
}

interface Props {
  inventories: InventoryItem[]
  statusFilter: string
}

export function InventarioContent({ inventories, statusFilter }: Props) {
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Inventário Físico</h1>
          <p className="page-subtitle">
            Ciclos de conferência, leitura em campo e conciliação de patrimônio
          </p>
        </div>
        <Link href="/inventario/novo">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            <span>Novo Inventário</span>
          </Button>
        </Link>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        <Link href="/inventario">
          <Button variant={!statusFilter ? "default" : "ghost"} size="sm">
            Todos
          </Button>
        </Link>
        <Link href="/inventario?status=em-andamento">
          <Button variant={statusFilter === "em-andamento" ? "default" : "ghost"} size="sm">
            Em Andamento
          </Button>
        </Link>
        <Link href="/inventario?status=concluido">
          <Button variant={statusFilter === "concluido" ? "default" : "ghost"} size="sm">
            Concluídos
          </Button>
        </Link>
      </div>

      {/* Lista de Ciclos de Inventário */}
      {inventories.length === 0 ? (
        <div className="empty-state py-16">
          <ClipboardCheck className="empty-state-icon" />
          <p className="empty-state-title">Nenhum inventário encontrado</p>
          <p className="empty-state-description">
            Inicie um novo ciclo de inventário para começar a conferir os bens patrimoniais
          </p>
          <Link href="/inventario/novo" className="mt-4">
            <Button>
              <Plus className="w-4 h-4" />
              Iniciar Primeiro Inventário
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inventories.map((inv) => {
            const statusInfo = INVENTORY_STATUS_MAP[inv.status as keyof typeof INVENTORY_STATUS_MAP]

            return (
              <Card key={inv.id} className="hover:border-blue-300 transition-all shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{inv.title}</h3>
                        <Badge variant={statusInfo?.color || "secondary"}>
                          {statusInfo?.label || inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ano {inv.year}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {inv.responsibleName}
                        </span>
                        {inv.startedAt && (
                          <>
                            <span>•</span>
                            <span>Iniciado em {formatDateTime(inv.startedAt)}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <Link href={`/inventario/${inv.id}`}>
                      <Button size="sm" variant={inv.status === "IN_PROGRESS" ? "default" : "outline"}>
                        {inv.status === "IN_PROGRESS" ? (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Continuar Leitura</span>
                          </>
                        ) : (
                          <>
                            <span>Ver Relatório</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>

                  {/* Barra de Progresso e Métricas */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">
                        Progresso: {inv.conferred} de {inv.total} itens conferidos ({inv.percentage}%)
                      </span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-emerald-600 font-semibold">
                          ✓ {inv.conferred} conferidos
                        </span>
                        {inv.divergent > 0 && (
                          <span className="text-amber-600 font-semibold">
                            ⚠ {inv.divergent} divergentes
                          </span>
                        )}
                        <span className="text-gray-400 font-semibold">
                          {inv.missing} pendentes
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(inv.conferred / (inv.total || 1)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${(inv.divergent / (inv.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
