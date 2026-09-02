"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Search,
  Camera,
  Barcode,
  Package,
  MapPin,
  ChevronRight,
  Loader2,
  X,
  ExternalLink,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ASSET_STATUS_MAP } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  unitValue: string
  status: string
  category: { name: string } | null
  room: {
    name: string
    floor: {
      name: string
      building: { name: string }
    }
  } | null
}

export function BuscaContent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus no input ao carregar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Buscar após 300ms de digitação
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/assets?search=${encodeURIComponent(query.trim())}&limit=20`)
        const data = await res.json()
        setResults(data.data || [])
      } catch (err) {
        console.error("Erro na busca:", err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Iniciar scanner de câmera mobile
  const startCameraScanner = () => {
    setCameraActive(true)
    // Inicialização dinâmica do Html5QrcodeScanner
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        )

        scanner.render(
          (decodedText) => {
            // Se for uma URL completa, extrair o número do patrimônio
            let patNum = decodedText
            if (decodedText.includes("/patrimonio/")) {
              patNum = decodedText.split("/patrimonio/")[1].split("?")[0]
            }
            setQuery(patNum)
            scanner.clear()
            setCameraActive(false)
          },
          (error) => {
            // Ignorar erros de frames intermediários
          }
        )
      }, 100)
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="page-header text-center sm:text-left mb-6">
        <h1 className="page-title">Busca Rápida de Patrimônio</h1>
        <p className="page-subtitle">
          Digite o número de tombo, use um leitor de código de barras USB ou a câmera do celular
        </p>
      </div>

      {/* Barra de Busca Principal */}
      <Card className="mb-6 shadow-sm border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nº do patrimônio, descrição ou bip o código..."
                className="pl-11 pr-10 h-12 text-base font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-12 px-4 shrink-0"
              onClick={startCameraScanner}
              title="Ler com a câmera"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Câmera</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scanner de Câmera Modal */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setCameraActive(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Aponte a câmera para o QR Code
            </h3>
            <div id="qr-reader" className="overflow-hidden rounded-xl" />
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Buscando patrimônios...</span>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="empty-state py-12">
            <Package className="empty-state-icon" />
            <p className="empty-state-title">Nenhum patrimônio encontrado</p>
            <p className="empty-state-description">
              Não encontramos resultados para &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {!loading &&
          results.map((asset) => {
            const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]

            return (
              <Link key={asset.id} href={`/patrimonios/${asset.patrimonyNumber}`}>
                <Card className="hover:border-blue-300 transition-all hover:shadow-md active:bg-gray-50">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-base text-blue-600">
                          {asset.patrimonyNumber}
                        </span>
                        <Badge variant={statusInfo?.color || "secondary"} className="text-[10px]">
                          {statusInfo?.label || asset.status}
                        </Badge>
                        {asset.category && (
                          <span className="text-xs text-gray-400 truncate hidden sm:inline">
                            • {asset.category.name}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-900 truncate mb-1">
                        {asset.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {asset.room ? (
                          <span className="flex items-center gap-1 text-emerald-700">
                            <MapPin className="w-3.5 h-3.5" />
                            {asset.room.floor.building.name} → {asset.room.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Sem localização
                          </span>
                        )}
                        <span>{formatCurrency(asset.unitValue)}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
      </div>
    </div>
  )
}
