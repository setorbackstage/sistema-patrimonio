"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Plus,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Eye,
  Tag,
  CheckSquare,
  Square,
  DoorOpen,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit2,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  ASSET_STATUS_MAP,
  ASSET_CONDITION_MAP,
  LABEL_STATUS_MAP,
} from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  unitValue: string
  totalValue: string
  status: string
  condition: string
  labelStatus: string
  roomId: string | null
  specificLocation?: string | null
  category: { name: string; code: string } | null
  unit: { name: string } | null
  room: {
    id?: string
    name: string
    floor: { name: string; building: { name: string } }
  } | null
}

interface Category {
  id: string
  code: string
  name: string
}

interface Room {
  id: string
  name: string
  type: string
  floor: {
    name: string
    building: {
      name: string
    }
  }
}

interface Props {
  assets: Asset[]
  total: number
  page: number
  perPage: number
  search: string
  filter: string
  categoryFilter: string
  categories: Category[]
  rooms?: Room[]
}

export function PatrimoniosContent({
  assets,
  total,
  page,
  perPage,
  search: initialSearch,
  filter,
  categoryFilter,
  categories,
  rooms = [],
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const totalPages = Math.ceil(total / perPage)

  // Multi-seleção para alocação em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Estado para modal de Alocação de Sala (Individual ou Lote)
  const [allocatingAsset, setAllocatingAsset] = useState<Asset | null>(null)
  const [isBulkAllocating, setIsBulkAllocating] = useState(false)
  const [targetRoomId, setTargetRoomId] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [allocatingLoading, setAllocatingLoading] = useState(false)

  const updateUrl = (params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      if (v) current.set(k, v)
      else current.delete(k)
    })
    router.push(`/patrimonios?${current.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ search: searchTerm, page: "" })
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(assets.map((a) => a.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Abrir modal para alocar um único patrimônio
  const openSingleAllocate = (asset: Asset) => {
    setAllocatingAsset(asset)
    setIsBulkAllocating(false)
    setTargetRoomId(asset.roomId || "")
    setSpecificLocation(asset.specificLocation || "")
  }

  // Abrir modal para alocação em lote
  const openBulkAllocate = () => {
    if (selectedIds.length === 0) return
    setAllocatingAsset(null)
    setIsBulkAllocating(true)
    setTargetRoomId("")
    setSpecificLocation("")
  }

  // Salvar alocação (individual ou lote)
  const handleSaveAllocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setAllocatingLoading(true)

    try {
      if (isBulkAllocating) {
        // Alocação em lote
        const res = await fetch("/api/assets/bulk-allocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetIds: selectedIds,
            roomId: targetRoomId || null,
            specificLocation: specificLocation.trim() || null,
          }),
        })

        if (!res.ok) throw new Error("Erro ao alocar patrimônios em lote")

        setIsBulkAllocating(false)
        setSelectedIds([])
      } else if (allocatingAsset) {
        // Alocação individual
        const res = await fetch(`/api/assets/${allocatingAsset.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: targetRoomId || null,
            specificLocation: specificLocation.trim() || null,
          }),
        })

        if (!res.ok) throw new Error("Erro ao alocar patrimônio")

        setAllocatingAsset(null)
      }

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar alocação")
    } finally {
      setAllocatingLoading(false)
    }
  }

  const filterLabel =
    filter === "sem-localizacao"
      ? "Sem localização"
      : filter === "sem-etiqueta"
      ? "Sem etiqueta"
      : ""

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Bens Patrimoniais</h1>
          <p className="page-subtitle">
            {total.toLocaleString("pt-BR")} itens cadastrados no CIEP 395
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/patrimonios/importar">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Importar Planilha</span>
            </Button>
          </Link>
          <Link href="/patrimonios/novo">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Novo Patrimônio</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra Flutuante de Ações em Lote (quando itens são selecionados) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-900 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-1 rounded-full">
              {selectedIds.length} selecionados
            </span>
            <p className="text-sm font-medium">Ações rápidas em lote:</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={openBulkAllocate}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
            >
              <DoorOpen className="w-4 h-4 mr-1.5 text-blue-600" />
              <span>Vincular Sala em Lote</span>
            </Button>

            <Link href={`/etiquetas/lote?ids=${selectedIds.join(",")}`}>
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Printer className="w-4 h-4 mr-1.5" />
                <span>Imprimir Etiquetas</span>
              </Button>
            </Link>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Desmarcar
            </Button>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por número do patrimônio ou descrição..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Buscar
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => updateUrl({ category: e.target.value, page: "" })}
                className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 focus:border-blue-500 max-w-[220px]"
              >
                <option value="">Todas as Categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={filter}
                onChange={(e) => updateUrl({ filter: e.target.value, page: "" })}
                className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 focus:border-blue-500"
              >
                <option value="">Todos os Status</option>
                <option value="sem-localizacao">Sem localização</option>
                <option value="sem-etiqueta">Sem etiqueta impressa</option>
              </select>
            </div>
          </div>

          {(searchTerm || filter || categoryFilter) && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500">Filtros ativos:</span>
              {searchTerm && <Badge variant="secondary">Busca: "{searchTerm}"</Badge>}
              {filterLabel && <Badge variant="warning">{filterLabel}</Badge>}
              {categoryFilter && <Badge variant="secondary">Categoria filtrada</Badge>}
              <button
                onClick={() => {
                  setSearchTerm("")
                  router.push("/patrimonios")
                }}
                className="text-blue-600 hover:underline font-semibold ml-2"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Patrimônios com Alocação Rápida */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Selecionar todos"
                    >
                      {selectedIds.length > 0 && selectedIds.length === assets.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th>Nº Patrimônio</th>
                  <th>Descrição</th>
                  <th>Classificação SIAF</th>
                  <th>Localização / Sala</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state py-12">
                        <Package className="empty-state-icon" />
                        <p className="empty-state-title">Nenhum patrimônio encontrado</p>
                        <p className="empty-state-description">
                          {searchTerm || filter || categoryFilter
                            ? "Tente ajustar os filtros ou o termo de busca"
                            : "Importe a planilha ou cadastre um novo item"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]
                    const isSelected = selectedIds.includes(asset.id)

                    return (
                      <tr key={asset.id} className={isSelected ? "bg-blue-50/40" : ""}>
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(asset.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td>
                          <Link
                            href={`/patrimonios/${asset.patrimonyNumber}`}
                            className="font-mono font-bold text-blue-600 hover:underline"
                          >
                            {asset.patrimonyNumber}
                          </Link>
                        </td>
                        <td>
                          <span className="text-gray-900 font-medium line-clamp-1 max-w-xs block">
                            {asset.description}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-gray-600">
                            {asset.category ? `${asset.category.code} - ${asset.category.name}` : "—"}
                          </span>
                        </td>

                        {/* COLUNA DE LOCALIZAÇÃO COM ALOCAÇÃO EM 1 CLIQUE */}
                        <td>
                          {asset.room ? (
                            <button
                              type="button"
                              onClick={() => openSingleAllocate(asset)}
                              className="group flex items-center gap-1.5 text-xs text-gray-900 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-gray-200 transition-all text-left"
                              title="Clique para alterar a sala deste patrimônio"
                            >
                              <DoorOpen className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                              <span className="font-semibold">{asset.room.name}</span>
                              <span className="text-[10px] text-gray-500">
                                ({asset.room.floor?.name})
                              </span>
                              <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 ml-1 transition-opacity" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openSingleAllocate(asset)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                              title="Clique para vincular este patrimônio a uma sala"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>+ Vincular Sala</span>
                            </button>
                          )}
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
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/patrimonios/${asset.patrimonyNumber}`}>
                              <Button variant="ghost" size="icon-sm" title="Ver detalhes e QR Code">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/patrimonios/${asset.patrimonyNumber}/editar`}>
                              <Button variant="ghost" size="icon-sm" title="Editar patrimônio">
                                <Edit2 className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                              </Button>
                            </Link>
                            <Link href={`/etiquetas?patrimonio=${asset.patrimonyNumber}`}>
                              <Button variant="ghost" size="icon-sm" title="Imprimir etiqueta">
                                <Tag className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Página {page} de {totalPages} ({total} registros)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateUrl({ page: String(page - 1) })}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: String(page + 1) })}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE ALOCAÇÃO DE SALA (INDIVIDUAL OU EM LOTE) */}
      {(allocatingAsset || isBulkAllocating) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <DoorOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isBulkAllocating ? "Vincular Sala em Lote" : "Vincular Localização Física"}
                </h3>
                <p className="text-xs text-gray-500">
                  {isBulkAllocating
                    ? `Alocar ${selectedIds.length} patrimônio(s) de uma só vez`
                    : `Patrimônio Nº ${allocatingAsset?.patrimonyNumber}`}
                </p>
              </div>
            </div>

            {allocatingAsset && (
              <div className="p-3 bg-gray-50 rounded-xl mb-4 border border-gray-200 text-xs">
                <span className="font-bold text-gray-900 block truncate">{allocatingAsset.description}</span>
                <span className="text-gray-500">Classificação: {allocatingAsset.category?.name || "Não definida"}</span>
              </div>
            )}

            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Selecione a Sala / Ambiente *
                </label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione o ambiente escolar</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor?.building?.name} → {r.floor?.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Posição Específica (Opcional)
                </label>
                <Input
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  placeholder="Ex: Bancada 02, Armário Superior, Mesa da Coordenação..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAllocatingAsset(null)
                    setIsBulkAllocating(false)
                  }}
                  disabled={allocatingLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={allocatingLoading || !targetRoomId}>
                  {allocatingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Salvando...
                    </>
                  ) : (
                    "Confirmar Alocação"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
