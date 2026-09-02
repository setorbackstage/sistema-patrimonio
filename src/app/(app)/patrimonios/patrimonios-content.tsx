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
  MoreHorizontal,
  Tag,
  ArrowUpDown,
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
  category: { name: string; code: string } | null
  unit: { name: string } | null
  room: {
    name: string
    floor: { name: string; building: { name: string } }
  } | null
}

interface Category {
  id: string
  code: string
  name: string
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
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const totalPages = Math.ceil(total / perPage)

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

  const filterLabel = filter === "sem-localizacao"
    ? "Sem localização"
    : filter === "sem-etiqueta"
    ? "Sem etiqueta"
    : ""

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Patrimônios</h1>
          <p className="page-subtitle">
            {total.toLocaleString("pt-BR")} {total === 1 ? "patrimônio" : "patrimônios"} encontrado{total !== 1 ? "s" : ""}
            {filterLabel && <Badge variant="warning" className="ml-2">{filterLabel}</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/patrimonios/importar">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
          </Link>
          <Link href="/patrimonios/novo">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Patrimônio</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="search-bar flex-1">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número, descrição ou observação..."
            className="pr-20"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            Buscar
          </Button>
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => updateUrl({ category: e.target.value, page: "" })}
          className="h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors min-w-[200px]"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {filter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateUrl({ filter: "", page: "" })}
            className="shrink-0"
          >
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nº Patrimônio</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Localização</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Etiqueta</th>
                  <th className="w-12"></th>
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
                          {initialSearch
                            ? `Nenhum resultado para "${initialSearch}"`
                            : "Importe a planilha para começar"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]
                    const labelInfo = LABEL_STATUS_MAP[asset.labelStatus as keyof typeof LABEL_STATUS_MAP]

                    return (
                      <tr key={asset.id}>
                        <td>
                          <Link
                            href={`/patrimonios/${asset.patrimonyNumber}`}
                            className="font-mono font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {asset.patrimonyNumber}
                          </Link>
                        </td>
                        <td>
                          <span className="text-gray-900 line-clamp-1 max-w-xs">
                            {asset.description}
                          </span>
                        </td>
                        <td>
                          <span className="text-gray-600 text-xs">
                            {asset.category?.name || "—"}
                          </span>
                        </td>
                        <td>
                          {asset.room ? (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {asset.room.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sem localização</span>
                          )}
                        </td>
                        <td>
                          <span className="text-gray-900 font-medium text-xs">
                            {formatCurrency(asset.unitValue)}
                          </span>
                        </td>
                        <td>
                          <Badge variant={statusInfo?.color || "secondary"}>
                            {statusInfo?.label || asset.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={labelInfo?.color || "secondary"}>
                            {labelInfo?.label || asset.labelStatus}
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
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {assets.length === 0 ? (
          <div className="empty-state py-12">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">Nenhum patrimônio encontrado</p>
          </div>
        ) : (
          assets.map((asset) => {
            const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]

            return (
              <Link key={asset.id} href={`/patrimonios/${asset.patrimonyNumber}`}>
                <Card className="p-4 active:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-blue-600">
                          {asset.patrimonyNumber}
                        </span>
                        <Badge variant={statusInfo?.color || "secondary"} className="text-[10px]">
                          {statusInfo?.label || asset.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                        {asset.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {asset.room ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {asset.room.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Sem localização
                          </span>
                        )}
                        <span className="font-medium text-gray-700">
                          {formatCurrency(asset.unitValue)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateUrl({ page: String(page - 1) })}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateUrl({ page: String(page + 1) })}
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
