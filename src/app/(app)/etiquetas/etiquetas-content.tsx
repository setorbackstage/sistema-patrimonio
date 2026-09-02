"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import QRCode from "qrcode"
import JsBarcode from "jsbarcode"
import {
  Printer,
  Search,
  Tag,
  Settings2,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Package,
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
import { ORGANIZATION_NAME } from "@/lib/constants"

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
  const [asset, setAsset] = useState<Asset | null>(initialAsset)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const barcodeRef = useRef<SVGSVGElement>(null)

  // Gerar QR Code e Barcode sempre que o patrimônio ou config mudar
  useEffect(() => {
    if (!asset) return

    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const publicUrl = `${origin}/patrimonio/${asset.patrimonyNumber}`

    // QR Code
    QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeUrl(url))
      .catch(console.error)

    // Barcode 1D (Code128)
    if (barcodeRef.current && config.showBarcode) {
      try {
        JsBarcode(barcodeRef.current, asset.patrimonyNumber, {
          format: "CODE128",
          width: 1.5,
          height: 28,
          displayValue: false,
          margin: 0,
        })
      } catch (err) {
        console.error("Erro ao gerar barcode:", err)
      }
    }
  }, [asset, config.showBarcode])

  // Disparar impressão automática se solicitado pela URL
  useEffect(() => {
    if (autoPrint && asset && qrCodeUrl) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [autoPrint, asset, qrCodeUrl])

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
              Gere e imprima etiquetas térmicas ou para folha A4 com QR Code oficial
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/etiquetas/lote" className="btn-secondary">
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4" />
                <span>Impressão em Lote</span>
              </Button>
            </Link>
            <Button size="sm" onClick={handlePrint} disabled={!asset}>
              <Printer className="w-4 h-4" />
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
                  placeholder="Digite o número do patrimônio para gerar a etiqueta..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchLoading}>
                Buscar
              </Button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
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
                          ? "border-blue-500 bg-blue-50/50"
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
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{size.name}</p>
                        <p className="text-xs text-gray-500">{size.description}</p>
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
                  <span>Exibir código de barras 1D</span>
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
            <CardHeader className="print:hidden">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Pré-visualização em Tempo Real</span>
                {asset && <Badge variant="success">Pronto para imprimir</Badge>}
              </CardTitle>
              <CardDescription>
                Tamanho real configurado: {LABEL_SIZES.find((s) => s.id === config.size)?.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-8 bg-slate-100/50 print:bg-white print:p-0">
              {asset ? (
                /* ETIQUETA PADRÃO DE TOMBAMENTO CIEP 395 */
                <div
                  id="print-label"
                  className="bg-white border-2 border-black rounded-md p-2.5 text-black flex flex-col justify-between shadow-md print:shadow-none print:border-black print:rounded-none"
                  style={{
                    width: config.size === "thermal-50x30" ? "210px" : config.size === "thermal-60x40" ? "260px" : "340px",
                    height: config.size === "thermal-50x30" ? "130px" : config.size === "thermal-60x40" ? "170px" : "190px",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Cabeçalho */}
                  {config.showSchoolName && (
                    <div className="text-center border-b border-black pb-0.5 mb-1">
                      <p className="text-[9px] font-black uppercase tracking-wider leading-none">
                        {ORGANIZATION_NAME}
                      </p>
                      <p className="text-[7px] font-semibold text-gray-700 leading-none mt-0.5">
                        SEEDUC-RJ • CONTROLE PATRIMONIAL
                      </p>
                    </div>
                  )}

                  {/* Corpo: QR Code + Número */}
                  <div className="flex items-center gap-2 flex-1 min-h-0">
                    {config.showQrCode && qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="QR"
                        className="w-16 h-16 shrink-0 border border-black p-0.5"
                      />
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[7px] font-bold uppercase tracking-widest text-gray-600 block">
                        PATRIMÔNIO Nº
                      </span>
                      <p className="text-base font-black font-mono tracking-tight leading-tight">
                        {asset.patrimonyNumber}
                      </p>

                      {config.showDescription && (
                        <p className="text-[8px] font-medium line-clamp-2 leading-tight text-gray-900 mt-0.5">
                          {asset.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barcode inferior */}
                  {config.showBarcode && (
                    <div className="flex justify-center mt-1 pt-0.5 border-t border-gray-300">
                      <svg ref={barcodeRef} className="max-h-6 w-full" />
                    </div>
                  )}
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

      {/* Estilos específicos de impressão */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-label,
          #print-label * {
            visibility: visible;
          }
          #print-label {
            position: fixed;
            left: 0;
            top: 0;
            margin: 0 !important;
            padding: 2mm !important;
            page-break-after: always;
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
