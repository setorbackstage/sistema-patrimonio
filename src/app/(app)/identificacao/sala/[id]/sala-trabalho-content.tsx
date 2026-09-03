"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Printer,
  Tag,
  Package,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  brand: string | null
  model: string | null
  labelStatus: string
  category: { name: string; code: string } | null
}

interface Category {
  id: string
  name: string
}

interface Room {
  id: string
  name: string
  floor: string
  building: string
}

interface Props {
  roomId: string
  roomName: string
  roomFloor: string
  isUnlocated: boolean
  categories: Category[]
  rooms?: Room[]
  initialAssets: Asset[]
}

const LABEL_BADGE: Record<string, { text: string; cls: string }> = {
  APPLIED: { text: "Etiquetado", cls: "bg-green-100 text-green-700 border-green-300" },
  PRINTED: { text: "Impresso", cls: "bg-blue-100 text-blue-700 border-blue-300" },
  GENERATED: { text: "Gerado", cls: "bg-purple-100 text-purple-700 border-purple-300" },
  NOT_GENERATED: { text: "Sem etiqueta", cls: "bg-gray-100 text-gray-600 border-gray-300" },
  DAMAGED_LABEL: { text: "Danificada", cls: "bg-red-100 text-red-700 border-red-300" },
  REPLACED: { text: "Substituída", cls: "bg-amber-100 text-amber-700 border-amber-300" },
}

export function SalaTrabalhoContent({
  roomId,
  roomName,
  roomFloor,
  isUnlocated,
  categories,
  rooms = [],
  initialAssets,
}: Props) {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [targetRoomId, setTargetRoomId] = useState("")
  const [busy, setBusy] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ patrimonyNumber: "", description: "", unitValue: "", categoryId: "" })

  const applied = assets.filter((a) => a.labelStatus === "APPLIED").length
  const pct = assets.length === 0 ? 0 : Math.round((applied / assets.length) * 100)

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )

  // Marcar etiqueta como aplicada (fim do ciclo físico)
  const markApplied = async (asset: Asset) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelStatus: "APPLIED" }),
      })
      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, labelStatus: "APPLIED" } : a)),
        )
      }
    } finally {
      setBusy(false)
    }
  }

  // Alocar selecionados para uma sala (modo sem-localização)
  const allocateSelected = async () => {
    if (!targetRoomId || selectedIds.length === 0) return
    setBusy(true)
    try {
      const res = await fetch("/api/assets/bulk-allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: selectedIds, roomId: targetRoomId }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedIds([])
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  // Cadastro rápido de bem encontrado na sala
  const quickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patrimonyNumber.trim() || !form.description.trim()) return
    const finalRoomId = isUnlocated ? targetRoomId : roomId
    if (isUnlocated && !finalRoomId) {
      alert("Selecione a sala primeiro (menu acima).")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patrimonyNumber: form.patrimonyNumber.trim(),
          description: form.description.trim().toUpperCase(),
          unitValue: Number(form.unitValue) || 0,
          categoryId: form.categoryId || null,
          roomId: finalRoomId || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setForm({ patrimonyNumber: "", description: "", unitValue: "", categoryId: "" })
        setShowAdd(false)
        router.refresh()
        setAssets((prev) => [
          ...prev,
          {
            id: data.id || `tmp-${Date.now()}`,
            patrimonyNumber: data.patrimonyNumber || form.patrimonyNumber,
            description: data.description || form.description.toUpperCase(),
            brand: null,
            model: null,
            labelStatus: "NOT_GENERATED",
            category: null,
          },
        ])
      } else {
        alert(data.error || "Erro ao cadastrar")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link href="/identificacao">
            <Button variant="outline" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="page-title">{roomName}</h1>
            <p className="page-subtitle">{roomFloor}</p>
          </div>
        </div>
        {!isUnlocated && (
          <Link href={`/etiquetas/lote?roomId=${roomId}`}>
            <Button size="sm" variant="outline">
              <Printer className="w-4 h-4 mr-1.5" />
              Etiquetas desta sala
            </Button>
          </Link>
        )}
      </div>

      {/* Progresso da sala */}
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">
              {applied} de {assets.length} etiquetados nesta sala
            </p>
            <div className="w-64 max-w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all ${pct === 100 && assets.length > 0 ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          {pct === 100 && assets.length > 0 && (
            <Badge className="bg-green-100 text-green-700 border-green-300 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Sala concluída
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Seletor de sala destino (modo sem-localização) */}
      {isUnlocated && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-bold text-amber-900">
              Você está em qual sala agora?
            </p>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-amber-300 bg-white text-sm text-gray-700 focus:border-amber-500 min-w-[220px]"
            >
              <option value="">— Selecione a sala —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.building} → {r.floor} → {r.name}
                </option>
              ))}
            </select>
            {selectedIds.length > 0 && targetRoomId && (
              <Button size="sm" onClick={allocateSelected} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Tag className="w-4 h-4 mr-1.5" />}
                Alocar {selectedIds.length} para esta sala
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Barra de ações */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {assets.length} {assets.length === 1 ? "bem" : "bens"}
          {isUnlocated ? " aguardando sala" : " nesta sala"}
        </p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {showAdd ? "Fechar" : "Achar bem novo"}
        </Button>
      </div>

      {/* Formulário de cadastro rápido */}
      {showAdd && (
        <Card className="mb-4 border-blue-300">
          <CardContent className="p-4">
            <form onSubmit={quickAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Nº de tombamento"
                value={form.patrimonyNumber}
                onChange={(e) => setForm({ ...form, patrimonyNumber: e.target.value })}
                required
              />
              <Input
                placeholder="Descrição (ex: MESA DE MADEIRA 4 LUGARES)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <Input
                placeholder="Valor (R$)"
                type="number"
                step="0.01"
                value={form.unitValue}
                onChange={(e) => setForm({ ...form, unitValue: e.target.value })}
              />
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700"
              >
                <option value="">Categoria (opcional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="sm:col-span-2">
                <Button type="submit" size="sm" disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                  Cadastrar {isUnlocated && targetRoomId ? "e alocar na sala" : ""}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de bens */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum bem {isUnlocated ? "sem localização" : "alocado nesta sala"}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assets.map((a) => {
            const badge = LABEL_BADGE[a.labelStatus] || LABEL_BADGE.NOT_GENERATED
            const isSelected = selectedIds.includes(a.id)
            return (
              <Card key={a.id} className={isSelected ? "border-blue-400 bg-blue-50/40" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  {isUnlocated ? (
                    <button onClick={() => toggleSelect(a.id)} className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  ) : a.labelStatus === "APPLIED" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  ) : (
                    <button
                      onClick={() => markApplied(a)}
                      disabled={busy}
                      title="Marcar etiqueta como aplicada"
                      className="shrink-0"
                    >
                      <Circle className="w-6 h-6 text-gray-300 hover:text-green-500" />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-gray-900 text-sm">
                      {a.patrimonyNumber}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{a.description}</p>
                    {a.category && (
                      <p className="text-xs text-gray-400 truncate">{a.category.name}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${badge.cls}`}>
                    {badge.text}
                  </Badge>
                  <Link href={`/patrimonios/${a.patrimonyNumber}`} className="shrink-0">
                    <Button variant="ghost" size="icon-sm">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
