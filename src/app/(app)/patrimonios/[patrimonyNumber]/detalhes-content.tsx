"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QRCode from "qrcode"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  ArrowRightLeft,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  Layers,
  DoorOpen,
  History,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  ASSET_STATUS_MAP,
  ASSET_CONDITION_MAP,
  LABEL_STATUS_MAP,
  ORGANIZATION_NAME,
} from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  categoryId: string | null
  brand: string | null
  model: string | null
  serialNumber: string | null
  unitOfMeasure: string
  quantity: number
  unitValue: string
  totalValue: string
  status: string
  condition: string
  labelStatus: string
  notes: string | null
  specificLocation: string | null
  createdAt: string
  updatedAt: string
  category: { id: string; code: string; name: string } | null
  unit: { id: string; name: string; code: string } | null
  room: {
    id: string
    name: string
    floor: {
      id: string
      name: string
      building: {
        id: string
        name: string
      }
    }
  } | null
  movements: {
    id: string
    movedAt: string
    reason: string
    notes: string | null
    fromRoom: { name: string } | null
    toRoom: { name: string }
    movedBy: { name: string; email: string } | null
  }[]
  inventoryItems: {
    id: string
    status: string
    verifiedAt: string
    verifiedBy: { name: string } | null
    inventory: { title: string; year: number }
  }[]
  createdBy: { name: string } | null
}

interface Room {
  id: string
  name: string
  floor: {
    name: string
    building: {
      name: string
    }
  }
}

interface Props {
  asset: Asset
  rooms: Room[]
}

export function DetalhesContent({ asset, rooms }: Props) {
  const router = useRouter()
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [targetRoomId, setTargetRoomId] = useState("")
  const [moveReason, setMoveReason] = useState("")
  const [moveLoading, setMoveLoading] = useState(false)
  const [moveError, setMoveError] = useState("")

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Gerar QR Code para a URL pública do patrimônio
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const publicUrl = `${origin}/patrimonio/${asset.patrimonyNumber}`
    QRCode.toDataURL(publicUrl, { width: 200, margin: 1 })
      .then((url) => setQrCodeDataUrl(url))
      .catch(console.error)
  }, [asset.patrimonyNumber])

  const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]
  const conditionInfo = ASSET_CONDITION_MAP[asset.condition as keyof typeof ASSET_CONDITION_MAP]
  const labelInfo = LABEL_STATUS_MAP[asset.labelStatus as keyof typeof LABEL_STATUS_MAP]

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetRoomId) return

    setMoveLoading(true)
    setMoveError("")

    try {
      const res = await fetch(`/api/assets/${asset.id}/movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toRoomId: targetRoomId,
          reason: moveReason || "Transferência de localização",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao movimentar patrimônio")
      }

      setShowMoveModal(false)
      router.refresh()
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : "Erro ao transferir")
    } finally {
      setMoveLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Erro ao excluir patrimônio")
      }

      router.push("/patrimonios")
    } catch {
      alert("Erro ao excluir. Verifique suas permissões.")
      setDeleteLoading(false)
    }
  }

  const handlePrintLabel = () => {
    // Abre a estação de impressão individual
    window.open(`/etiquetas?patrimonio=${asset.patrimonyNumber}&autoPrint=true`, "_blank")
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/patrimonios">
            <Button variant="outline" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="page-title font-mono">{asset.patrimonyNumber}</h1>
              <Badge variant={statusInfo?.color || "secondary"}>
                {statusInfo?.label || asset.status}
              </Badge>
              <Badge variant={conditionInfo?.color || "secondary"}>
                {conditionInfo?.label || asset.condition}
              </Badge>
            </div>
            <p className="page-subtitle line-clamp-1">{asset.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowMoveModal(true)}>
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transferir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintLabel}>
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta</span>
          </Button>
          <Link href={`/patrimonios/${asset.patrimonyNumber}/editar`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal: Detalhes do Bem (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Descrição e Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Informações Principais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Descrição
                </span>
                <p className="text-base text-gray-900 font-medium">
                  {asset.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Classificação SIAF
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {asset.category ? `${asset.category.code}` : "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {asset.category?.name || "Não categorizado"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Marca / Modelo
                  </span>
                  <p className="text-sm text-gray-800">
                    {asset.brand || "—"} {asset.model ? `/ ${asset.model}` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Nº de Série
                  </span>
                  <p className="text-sm font-mono text-gray-800">
                    {asset.serialNumber || "—"}
                  </p>
                </div>
              </div>

              {asset.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Observações
                  </span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {asset.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Localização Física Atual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Localização Física Atual
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoveModal(true)}
              >
                Alterar Sala
              </Button>
            </CardHeader>
            <CardContent>
              {asset.room ? (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Prédio</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {asset.room.floor.building.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Andar</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {asset.room.floor.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Sala / Ambiente</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {asset.room.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {asset.specificLocation && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/50 text-xs text-emerald-900">
                      <strong>Posição específica:</strong> {asset.specificLocation}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Este bem ainda não possui sala definida</p>
                      <p className="text-xs text-amber-700">Atribua uma sala para manter o inventário e localização corretos</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setShowMoveModal(true)}>
                    Definir Sala
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {asset.movements.length > 0 ? (
                <div className="space-y-4">
                  {asset.movements.map((mov, i) => (
                    <div key={mov.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {mov.fromRoom ? mov.fromRoom.name : "Origem não definida"} → {mov.toRoom.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {mov.reason} • Por {mov.movedBy?.name || "Sistema"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatDateTime(mov.movedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nenhuma movimentação registrada
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: QR Code, Valores e Metadados (1 col) */}
        <div className="space-y-6">
          {/* Card QR Code e Etiqueta */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-base">Etiqueta e QR Code</CardTitle>
              <CardDescription>Escaneie para consultar em campo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code ${asset.patrimonyNumber}`}
                  className="w-40 h-40 border border-gray-200 rounded-xl p-2 shadow-sm mb-4"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 rounded-xl animate-pulse mb-4" />
              )}
              <div className="w-full space-y-2">
                <Button className="w-full" size="sm" onClick={handlePrintLabel}>
                  <Printer className="w-4 h-4" />
                  Imprimir Etiqueta
                </Button>
                <Link
                  href={`/patrimonio/${asset.patrimonyNumber}`}
                  target="_blank"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  <span className="flex items-center justify-center gap-1">
                    Abrir página pública de consulta <ExternalLink className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card Valores Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Valores Patrimoniais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Valor Unitário</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(asset.unitValue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Quantidade</span>
                <span className="font-semibold text-gray-900">
                  {asset.quantity} {asset.unitOfMeasure}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-base">
                <span className="font-semibold text-gray-700">Valor Global</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(asset.totalValue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadados e Auditoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Auditoria e Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Cadastrado em:</span>
                <span className="text-gray-900">{formatDateTime(asset.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cadastrado por:</span>
                <span className="text-gray-900">{asset.createdBy?.name || "Importação"}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização:</span>
                <span className="text-gray-900">{formatDateTime(asset.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Transferência de Sala */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Transferir Patrimônio
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Mover <strong>{asset.patrimonyNumber}</strong> para outra sala
            </p>

            {moveError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg mb-4">
                {moveError}
              </div>
            )}

            <form onSubmit={handleMove} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sala de Destino *
                </label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione a sala de destino</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor.building.name} → {r.floor.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Motivo da Movimentação
                </label>
                <Input
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="Ex: Remanejamento de mobiliário, manutenção..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMoveModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={moveLoading || !targetRoomId}>
                  {moveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Transferência"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Excluir Patrimônio?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja remover o patrimônio <strong>{asset.patrimonyNumber}</strong>? O registro será arquivado.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sim, Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
