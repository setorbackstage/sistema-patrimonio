"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Barcode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  CheckCheck,
  Search,
  Volume2,
  VolumeX,
  X,
  Package,
  MapPin,
  Loader2,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { INVENTORY_STATUS_MAP, INVENTORY_ITEM_STATUS_MAP } from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  unitValue: string
  totalValue: string
  category: { name: string } | null
  room: {
    id: string
    name: string
    floor: { name: string; building: { name: string } }
  } | null
}

interface InventoryItem {
  id: string
  status: string
  verifiedAt: string | null
  notes: string | null
  asset: Asset
  foundRoom: {
    id: string
    name: string
    floor: { name: string; building: { name: string } }
  } | null
  verifiedBy: { name: string } | null
}

interface Inventory {
  id: string
  title: string
  year: number
  status: string
  startedAt: string
  completedAt: string | null
  responsible: { name: string; email: string } | null
  items: InventoryItem[]
}

interface Room {
  id: string
  name: string
  floor: { name: string; building: { name: string } }
}

interface Props {
  inventory: Inventory
  rooms: Room[]
}

export function ExecucaoInventarioContent({ inventory, rooms }: Props) {
  const router = useRouter()
  const [scanCode, setScanCode] = useState("")
  const [currentRoomId, setCurrentRoomId] = useState("")
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFERRED" | "DIVERGENT" | "MISSING">("ALL")
  const [cameraActive, setCameraActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loadingScan, setLoadingScan] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<{
    type: "CONFERRED" | "DIVERGENT" | "NOT_FOUND"
    message: string
    asset?: Asset
  } | null>(null)

  const scanInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus no input de bipagem
  useEffect(() => {
    scanInputRef.current?.focus()
  }, [])

  // Efeitos Sonoros via Web Audio API (sem dependências externas)
  const playBeep = (type: "SUCCESS" | "WARNING" | "ERROR") => {
    if (!soundEnabled || typeof window === "undefined") return
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)

      if (type === "SUCCESS") {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.12)
      } else if (type === "WARNING") {
        osc.frequency.setValueAtTime(450, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.25)
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.35)
      }
    } catch {
      // Audio não suportado ou bloqueado pelo navegador
    }
  }

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanCode.trim()) return

    setLoadingScan(true)
    try {
      const res = await fetch(`/api/inventory/${inventory.id}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: scanCode.trim(),
          currentRoomId: currentRoomId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setLastScanResult({
          type: "NOT_FOUND",
          message: data.message || "Patrimônio não cadastrado",
        })
        playBeep("ERROR")
      } else if (data.type === "CONFERRED") {
        setLastScanResult({
          type: "CONFERRED",
          message: data.message,
          asset: data.asset,
        })
        playBeep("SUCCESS")
        router.refresh()
      } else {
        setLastScanResult({
          type: "DIVERGENT",
          message: data.message,
          asset: data.asset,
        })
        playBeep("WARNING")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      playBeep("ERROR")
    } finally {
      setScanCode("")
      setLoadingScan(false)
      scanInputRef.current?.focus()
    }
  }

  // Scanner de Câmera Mobile
  const startCameraScanner = () => {
    setCameraActive(true)
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "inv-camera-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        )

        scanner.render(
          async (decodedText) => {
            scanner.clear()
            setCameraActive(false)
            setScanCode(decodedText)
            // Processar leitura diretamente
            const res = await fetch(`/api/inventory/${inventory.id}/scan`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: decodedText,
                currentRoomId: currentRoomId || undefined,
              }),
            })
            const data = await res.json()
            if (data.success) {
              setLastScanResult({
                type: data.type,
                message: data.message,
                asset: data.asset,
              })
              playBeep(data.type === "CONFERRED" ? "SUCCESS" : "WARNING")
              router.refresh()
            } else {
              setLastScanResult({
                type: "NOT_FOUND",
                message: data.message,
              })
              playBeep("ERROR")
            }
          },
          (error) => {}
        )
      }, 100)
    })
  }

  const handleFinalizeInventory = async () => {
    if (!confirm("Deseja realmente concluir este inventário?")) return

    try {
      const res = await fetch(`/api/inventory/${inventory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch {
      alert("Erro ao finalizar inventário")
    }
  }

  // Estatísticas
  const totalItems = inventory.items.length
  const conferredItems = inventory.items.filter((i) => i.status === "CONFERRED")
  const divergentItems = inventory.items.filter((i) => i.status === "DIVERGENT")
  const missingItems = inventory.items.filter((i) => i.status === "MISSING")
  const percentage = totalItems > 0 ? Math.round((conferredItems.length / totalItems) * 100) : 0

  // Filtragem da lista
  const filteredItems = inventory.items.filter((i) => {
    if (activeTab === "CONFERRED") return i.status === "CONFERRED"
    if (activeTab === "DIVERGENT") return i.status === "DIVERGENT"
    if (activeTab === "MISSING") return i.status === "MISSING"
    return true
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/inventario">
            <Button variant="outline" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{inventory.title}</h1>
              <Badge variant={inventory.status === "COMPLETED" ? "success" : "default"}>
                {inventory.status === "COMPLETED" ? "Concluído" : "Em Andamento"}
              </Badge>
            </div>
            <p className="page-subtitle">Ano de Referência: {inventory.year}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title={soundEnabled ? "Som ativado" : "Som desativado"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5" />}
          </button>
          {inventory.status === "IN_PROGRESS" && (
            <Button size="sm" onClick={handleFinalizeInventory}>
              <CheckCheck className="w-4 h-4" />
              <span>Concluir Inventário</span>
            </Button>
          )}
        </div>
      </div>

      {/* Seção de Leitura e Bipagem Ativa */}
      {inventory.status === "IN_PROGRESS" && (
        <Card className="mb-6 border-blue-300 shadow-md bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Seletor de Sala Atual */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sala onde você está agora
                </label>
                <select
                  value={currentRoomId}
                  onChange={(e) => setCurrentRoomId(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Qualquer sala / Não especificada</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor.building.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caixa de Entrada de Bipagem Rápida */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bipar Leitor USB ou Digitar Nº de Tombamento
                </label>
                <form onSubmit={handleScanSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <Input
                      ref={scanInputRef}
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value)}
                      placeholder="Aponte o leitor de código de barras ou digite o tombo..."
                      className="pl-11 h-12 text-base font-mono font-bold"
                      disabled={loadingScan}
                    />
                  </div>

                  <Button type="submit" className="h-12 px-5" disabled={loadingScan || !scanCode.trim()}>
                    {loadingScan ? <Loader2 className="w-4 h-4 animate-spin" /> : "Conferir"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-4"
                    onClick={startCameraScanner}
                    title="Usar Câmera do Celular"
                  >
                    <Camera className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Alerta de Feedback da Leitura */}
            {lastScanResult && (
              <div
                className={`p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 ${
                  lastScanResult.type === "CONFERRED"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : lastScanResult.type === "DIVERGENT"
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {lastScanResult.type === "CONFERRED" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : lastScanResult.type === "DIVERGENT" ? (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold">{lastScanResult.message}</p>
                    {lastScanResult.asset && (
                      <p className="text-xs opacity-90">
                        {lastScanResult.asset.patrimonyNumber} — {lastScanResult.asset.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setLastScanResult(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Câmera Mobile */}
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
              Escanear Etiqueta com a Câmera
            </h3>
            <div id="inv-camera-reader" className="overflow-hidden rounded-xl" />
          </div>
        </div>
      )}

      {/* Painel de Métricas do Inventário */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <span className="stat-card-label">Total no Escopo</span>
          <span className="stat-card-value text-xl">{totalItems}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Conferidos (OK)</span>
          <div className="flex items-baseline gap-2">
            <span className="stat-card-value text-xl text-emerald-600">{conferredItems.length}</span>
            <span className="text-xs text-emerald-700 font-bold">({percentage}%)</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Divergências</span>
          <span className="stat-card-value text-xl text-amber-600">{divergentItems.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Pendentes / Faltantes</span>
          <span className="stat-card-value text-xl text-red-600">{missingItems.length}</span>
        </div>
      </div>

      {/* Tabs de Filtro dos Itens */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={activeTab === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("ALL")}
        >
          Todos ({totalItems})
        </Button>
        <Button
          variant={activeTab === "CONFERRED" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("CONFERRED")}
        >
          Conferidos ({conferredItems.length})
        </Button>
        <Button
          variant={activeTab === "DIVERGENT" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("DIVERGENT")}
        >
          Divergentes ({divergentItems.length})
        </Button>
        <Button
          variant={activeTab === "MISSING" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("MISSING")}
        >
          Pendentes ({missingItems.length})
        </Button>
      </div>

      {/* Tabela de Itens do Inventário */}
      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Tombamento</th>
                <th>Descrição</th>
                <th>Sala Registrada</th>
                <th>Sala Encontrada</th>
                <th>Data Leitura</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state py-12">
                      <Package className="empty-state-icon" />
                      <p className="empty-state-title">Nenhum item nesta lista</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const statusInfo = INVENTORY_ITEM_STATUS_MAP[item.status as keyof typeof INVENTORY_ITEM_STATUS_MAP]

                  return (
                    <tr key={item.id}>
                      <td>
                        <Link
                          href={`/patrimonios/${item.asset.patrimonyNumber}`}
                          className="font-mono font-bold text-blue-600 hover:underline"
                        >
                          {item.asset.patrimonyNumber}
                        </Link>
                      </td>
                      <td>
                        <span className="text-gray-900 line-clamp-1 max-w-xs font-medium">
                          {item.asset.description}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-600">
                          {item.asset.room?.name || "Sem sala"}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-gray-900">
                          {item.foundRoom?.name || (item.status === "CONFERRED" ? item.asset.room?.name : "—")}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {item.verifiedAt ? formatDateTime(item.verifiedAt) : "—"}
                        </span>
                      </td>
                      <td>
                        <Badge variant={statusInfo?.color || "secondary"} className="text-[10px]">
                          {statusInfo?.label || item.status}
                        </Badge>
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
  )
}
