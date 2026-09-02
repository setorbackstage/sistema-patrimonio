"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  ClipboardCheck,
  Printer,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ASSET_STATUS_MAP, ROOM_TYPE_MAP } from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  unitValue: string
  totalValue: string
  status: string
  labelStatus: string
  specificLocation: string | null
  category: { name: string; code: string } | null
}

interface Room {
  id: string
  name: string
  type: string
  responsible: string | null
  notes: string | null
  floor: {
    name: string
    building: {
      name: string
    }
  }
  assets: Asset[]
}

export function SalaDetalhesContent({ room }: { room: Room }) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const totalValue = room.assets.reduce((sum, a) => sum + Number(a.totalValue || 0), 0)
  const typeInfo = ROOM_TYPE_MAP[room.type as keyof typeof ROOM_TYPE_MAP]

  const handleDeleteRoom = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/locations/rooms/${room.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Erro ao excluir sala")
      }

      router.push("/localizacoes")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir sala")
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/localizacoes">
            <Button variant="outline" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{room.name}</h1>
              <Badge variant="secondary">{typeInfo?.label || "Ambiente"}</Badge>
            </div>
            <p className="page-subtitle flex items-center gap-1">
              <span>{room.floor.building.name}</span>
              <span>•</span>
              <span>{room.floor.name}</span>
              {room.responsible && (
                <>
                  <span>•</span>
                  <span>Responsável: {room.responsible}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/inventario/novo?roomId=${room.id}`}>
            <Button size="sm">
              <ClipboardCheck className="w-4 h-4 mr-1.5" />
              <span>Inventariar Sala</span>
            </Button>
          </Link>
          <Link href={`/etiquetas/lote?roomId=${room.id}`}>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Etiquetas</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Excluir Sala</span>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas da Sala */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <span className="stat-card-label">Patrimônios na Sala</span>
          <span className="stat-card-value text-blue-600">
            {room.assets.length} {room.assets.length === 1 ? "item" : "itens"}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Valor Total Alocado</span>
          <span className="stat-card-value text-emerald-600">
            {formatCurrency(totalValue)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Etiquetas Pendentes</span>
          <span className="stat-card-value text-amber-600">
            {room.assets.filter((a) => a.labelStatus === "NOT_GENERATED").length}
          </span>
        </div>
      </div>

      {/* Tabela de Bens da Sala */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Bens Patrimoniais Alocados</span>
            <span className="text-xs font-normal text-gray-500">
              {room.assets.length} registros
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Tombamento</th>
                <th>Descrição do Item</th>
                <th>Classificação</th>
                <th>Posição Específica</th>
                <th>Valor</th>
                <th>Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {room.assets.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state py-12">
                      <Package className="empty-state-icon" />
                      <p className="empty-state-title">Nenhum patrimônio nesta sala</p>
                      <p className="empty-state-description">
                        Transfira patrimônios para esta sala ou importe novos bens pela planilha
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                room.assets.map((asset) => {
                  const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]

                  return (
                    <tr key={asset.id}>
                      <td>
                        <Link
                          href={`/patrimonios/${asset.patrimonyNumber}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {asset.patrimonyNumber}
                        </Link>
                      </td>
                      <td>
                        <span className="text-gray-900 font-medium line-clamp-1 max-w-sm">
                          {asset.description}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-600">
                          {asset.category?.name || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {asset.specificLocation || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-gray-900">
                          {formatCurrency(asset.totalValue)}
                        </span>
                      </td>
                      <td>
                        <Badge variant={statusInfo?.color || "secondary"} className="text-[10px]">
                          {statusInfo?.label || asset.status}
                        </Badge>
                      </td>
                      <td>
                        <Link href={`/patrimonios/${asset.patrimonyNumber}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir {room.name}?</h3>
                <p className="text-xs text-gray-500">Esta ação removerá a sala da estrutura predial</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja remover esta sala?
              {room.assets.length > 0 && (
                <span className="block mt-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
                  ⚠️ Esta sala contém <strong>{room.assets.length} patrimônio(s)</strong>.
                  Os bens não serão excluídos, mas ficarão marcados como <em>"Sem Sala Atribuída"</em> para que você possa realocá-los.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteRoom}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Excluindo...
                  </>
                ) : (
                  "Sim, Excluir Sala"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
