"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Printer,
  Search,
  Tag,
  Sliders,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  categoryId: string | null
  category: { name: string; code: string } | null
  room: {
    name: string
    floor: { name: string; building: { name: string } }
  } | null
}

interface Props {
  initialAsset: Asset | null
  autoPrint: boolean
}

export function EtiquetasContent({ initialAsset, autoPrint }: Props) {
  const [asset, setAsset] = useState<Asset | null>(
    initialAsset || {
      id: "demo-1",
      patrimonyNumber: "000001",
      description: "BOMBA DE ÁGUA DANCOR 30CV TRIFÁSICA",
      categoryId: null,
      category: { name: "MÁQUINAS E EQUIPAMENTOS ENERGÉTICOS", code: "1.2.3.1.1.01.20" },
      room: { name: "CASA DE BOMBAS", floor: { name: "Térreo", building: { name: "Prédio Principal" } } },
    }
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG)
  const [previewScale, setPreviewScale] = useState<number>(1)

  // Disparar impressão automática se solicitado pela URL
  useEffect(() => {
    if (autoPrint && asset) {
      setTimeout(() => {
        window.print()
      }, 600)
    }
  }, [autoPrint, asset])

  // Busca de patrimônio
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      const res = await fetch(`/api/assets?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await res.json()
      setSearchResults(data.data || [])
      if (data.data?.length === 1) {
        setAsset(data.data[0])
        setSearchResults([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header com instruções (oculto na impressão) */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">Estação de Etiquetagem</h1>
            <p className="page-subtitle">
              Gere e imprima etiquetas patrimoniais com QR Code + Código de Barras 1D Code128
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/etiquetas/lote">
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-1.5" />
                <span>Impressão em Lote</span>
              </Button>
            </Link>
            <Button size="sm" onClick={handlePrint} disabled={!asset}>
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Imprimir Etiqueta</span>
            </Button>
          </div>
        </div>

        {/* Barra de Busca de Patrimônio */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o número de patrimônio (ex: 000001, 000123) ou descrição..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchLoading}>
                Buscar
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setAsset(item)
                      setSearchResults([])
                    }}
                    className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600 mr-2">
                        {item.patrimonyNumber}
                      </span>
                      <span className="text-sm text-gray-700">{item.description}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      Selecionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal: Configurações & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Painel de Configuração (Oculto na impressão) */}
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Formato da Etiqueta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Tamanho / Tipo de Mídia
                </label>
                <div className="space-y-2">
                  {LABEL_SIZES.map((size) => (
                    <label
                      key={size.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        config.size === size.id
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="labelSize"
                        checked={config.size === size.id}
                        onChange={() =>
                          setConfig((prev) => ({
                            ...prev,
                            size: size.id as LabelConfig["size"],
                          }))
                        }
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">{size.name}</p>
                          {config.size === size.id && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{size.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSchoolName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showSchoolName: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Exibir cabeçalho da escola</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBarcode}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showBarcode: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Exibir código de barras 1D (Code 128)</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showQrCode}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showQrCode: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Exibir QR Code público</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showDescription}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showDescription: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Exibir descrição do item</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pré-visualização e Área de Impressão */}
        <div className="lg:col-span-2">
          <Card className="print:border-none print:shadow-none print:p-0">
            <CardHeader className="print:hidden pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>Pré-visualização da Etiqueta</span>
                    <Badge variant="success">Pronto para imprimir</Badge>
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Tamanho: {LABEL_SIZES.find((s) => s.id === config.size)?.name}
                  </CardDescription>
                </div>

                {/* Controles de Zoom para visualização */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewScale((s) => Math.max(0.75, s - 0.25))}
                    className="p-1 hover:bg-white rounded text-gray-600"
                    title="Diminuir zoom"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-semibold px-1 text-gray-700">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewScale((s) => Math.min(2, s + 0.25))}
                    className="p-1 hover:bg-white rounded text-gray-600"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(1)}
                    className="p-1 hover:bg-white rounded text-gray-600 ml-0.5"
                    title="Resetar zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-8 bg-slate-100/70 min-h-[300px] print:bg-white print:p-0 print:min-h-0 overflow-auto">
              {asset ? (
                <div id="print-area" className="flex items-center justify-center">
                  <PatrimonioLabel
                    asset={asset}
                    config={config}
                    scale={previewScale}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600">
                    Nenhum patrimônio selecionado
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Busque um item acima para gerar a etiqueta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS Exclusivo de Impressão Calibrada */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: fixed;
            left: 0;
            top: 0;
            margin: 0 !important;
            padding: 0 !important;
            width: auto;
            height: auto;
          }
          .label-container {
            border: 1.5pt solid black !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transform: none !important;
            page-break-after: always;
            break-inside: avoid;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  )
}
