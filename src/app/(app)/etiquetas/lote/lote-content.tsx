"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Printer,
  ArrowLeft,
  CheckSquare,
  Square,
  Filter,
  Package,
  Sliders,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  LabelConfig,
  DEFAULT_LABEL_CONFIG,
  LABEL_SIZES,
} from "@/lib/label-templates"
import { PatrimonioLabel } from "@/components/labels/patrimonio-label"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  category?: { name: string; code: string } | null
  room: {
    name: string
    floor: { name: string; building: { name: string } }
  } | null
}

interface Room {
  id: string
  name: string
  floor: { name: string; building: { name: string } }
}

interface Category {
  id: string
  name: string
}

interface Props {
  initialAssets: Asset[]
  rooms: Room[]
  categories: Category[]
  selectedRoomId: string
  selectedFilter: string
}

export function LoteContent({
  initialAssets,
  rooms,
  selectedRoomId,
  selectedFilter,
}: Props) {
  const router = useRouter()
  const [assets] = useState<Asset[]>(initialAssets)
  const [selectedIds, setSelectedIds] = useState<string[]>(initialAssets.map((a) => a.id))
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG)

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(assets.map((a) => a.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectedAssets = assets.filter((a) => selectedIds.includes(a.id))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header (oculto na impressão) */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/etiquetas">
              <Button variant="outline" size="icon-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="page-title">Impressão de Etiquetas em Lote</h1>
              <p className="page-subtitle">
                {selectedAssets.length} de {assets.length} etiquetas selecionadas para impressão
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedIds.length === assets.length ? (
                <>
                  <Square className="w-4 h-4 mr-1.5" />
                  <span>Desmarcar Todos</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-1.5" />
                  <span>Selecionar Todos ({assets.length})</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={selectedAssets.length === 0}
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Imprimir {selectedAssets.length} Etiquetas</span>
            </Button>
          </div>
        </div>

        {/* Filtros e Seleção de Formato */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filtrar Sala:</span>
              </div>

              <select
                value={selectedRoomId}
                onChange={(e) => router.push(`/etiquetas/lote?roomId=${e.target.value}`)}
                className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-xs text-gray-700 focus:border-blue-500"
              >
                <option value="">Todas as salas</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.floor.building.name} → {r.name}
                  </option>
                ))}
              </select>

              <Link href="/etiquetas/lote?filter=sem-etiqueta">
                <Button variant={selectedFilter === "sem-etiqueta" ? "default" : "outline"} size="sm">
                  Apenas sem etiqueta impressa
                </Button>
              </Link>
            </div>

            {/* Seletor de Formato do Lote */}
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <select
                value={config.size}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    size: e.target.value as LabelConfig["size"],
                  }))
                }
                className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 focus:border-blue-500"
              >
                {LABEL_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Etiquetas para Impressão */}
      {selectedAssets.length === 0 ? (
        <div className="empty-state py-16 print:hidden">
          <Package className="empty-state-icon" />
          <p className="empty-state-title">Nenhuma etiqueta selecionada</p>
          <p className="empty-state-description">Selecione ao menos um patrimônio para imprimir</p>
        </div>
      ) : (
        <div
          id="batch-print-container"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2 justify-items-center"
        >
          {selectedAssets.map((item) => (
            <div key={item.id} className="relative group w-full flex justify-center">
              {/* Checkbox interativo no preview */}
              <button
                type="button"
                onClick={() => toggleSelect(item.id)}
                className="absolute top-2 right-2 z-10 print:hidden text-gray-400 hover:text-blue-600 bg-white/90 p-1 rounded"
                title="Desmarcar da impressão"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </button>

              <PatrimonioLabel
                asset={item}
                config={config}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${config.size === "a4-pimaco-30" ? "A4" : "auto"};
            margin: ${config.size === "a4-pimaco-30" ? "10mm 5mm" : "0mm"};
          }
          body {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          #batch-print-container,
          #batch-print-container * {
            visibility: visible;
          }
          #batch-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 2mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .label-container {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1.5pt solid black !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
