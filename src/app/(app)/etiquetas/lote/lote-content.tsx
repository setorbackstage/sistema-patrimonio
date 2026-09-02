"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QRCode from "qrcode"
import {
  Printer,
  Layers,
  ArrowLeft,
  CheckSquare,
  Square,
  Filter,
  Package,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ORGANIZATION_NAME } from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
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
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [selectedIds, setSelectedIds] = useState<string[]>(initialAssets.map((a) => a.id))
  const [qrMap, setQrMap] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)

  // Gerar QR codes para todos os patrimônios selecionados
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const map: Record<string, string> = {}

    const generateAll = async () => {
      setGenerating(true)
      for (const asset of assets) {
        try {
          const url = await QRCode.toDataURL(`${origin}/patrimonio/${asset.patrimonyNumber}`, {
            width: 150,
            margin: 1,
          })
          map[asset.id] = url
        } catch (e) {
          console.error(e)
        }
      }
      setQrMap(map)
      setGenerating(false)
    }

    generateAll()
  }, [assets])

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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedIds.length === assets.length ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Desmarcar Todos</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Selecionar Todos ({assets.length})</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={selectedAssets.length === 0 || generating}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir {selectedAssets.length} Etiquetas</span>
            </Button>
          </div>
        </div>

        {/* Filtros rápidos */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filtrar por Sala:</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Grid de Etiquetas para Impressão */}
      {generating ? (
        <div className="flex items-center justify-center py-20 text-gray-500 gap-2 print:hidden">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Gerando QR Codes em alta resolução...</span>
        </div>
      ) : selectedAssets.length === 0 ? (
        <div className="empty-state py-16 print:hidden">
          <Package className="empty-state-icon" />
          <p className="empty-state-title">Nenhuma etiqueta selecionada</p>
          <p className="empty-state-description">Selecione ao menos um patrimônio para imprimir</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
          {selectedAssets.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-black rounded-md p-2.5 text-black flex flex-col justify-between break-inside-avoid shadow-sm print:shadow-none print:rounded-none relative group"
            >
              {/* Checkbox interativo no preview */}
              <button
                onClick={() => toggleSelect(item.id)}
                className="absolute top-2 right-2 print:hidden text-gray-400 hover:text-blue-600"
                title="Desmarcar da impressão"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </button>

              {/* Cabeçalho */}
              <div className="text-center border-b border-black pb-0.5 mb-1 pr-6 print:pr-0">
                <p className="text-[8px] font-black uppercase tracking-wider leading-none">
                  {ORGANIZATION_NAME}
                </p>
                <p className="text-[6px] font-bold text-gray-600 leading-none mt-0.5">
                  SEEDUC-RJ • CONTROLE PATRIMONIAL
                </p>
              </div>

              {/* Corpo */}
              <div className="flex items-center gap-2">
                {qrMap[item.id] && (
                  <img
                    src={qrMap[item.id]}
                    alt="QR"
                    className="w-14 h-14 shrink-0 border border-black p-0.5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[6px] font-bold uppercase text-gray-500 block">
                    Nº TOMBAMENTO
                  </span>
                  <p className="text-sm font-black font-mono tracking-tight leading-tight">
                    {item.patrimonyNumber}
                  </p>
                  <p className="text-[7px] font-medium line-clamp-2 leading-tight text-gray-900 mt-0.5">
                    {item.description}
                  </p>
                  {item.room && (
                    <p className="text-[6px] text-gray-500 font-semibold mt-0.5 truncate">
                      {item.room.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm 5mm;
          }
          body {
            background: white !important;
          }
          .main-header,
          .sidebar,
          .mobile-nav {
            display: none !important;
          }
          .main-content {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
