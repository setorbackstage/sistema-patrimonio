"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ClipboardCheck,
  Building2,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ORGANIZATION_NAME } from "@/lib/constants"

interface Room {
  id: string
  name: string
  floor: {
    name: string
    building: { name: string }
  }
  _count: {
    assets: number
  }
}

interface Props {
  rooms: Room[]
  totalAssets: number
  initialRoomId: string
}

export function NovoInventarioForm({ rooms, totalAssets, initialRoomId }: Props) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [title, setTitle] = useState(`Inventário Geral ${currentYear} – ${ORGANIZATION_NAME}`)
  const [year, setYear] = useState(currentYear)
  const [scope, setScope] = useState<"ALL" | "ROOM">(initialRoomId ? "ROOM" : "ALL")
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)
  const expectedItemsCount = scope === "ALL" ? totalAssets : selectedRoom?._count.assets || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          year,
          roomId: scope === "ROOM" ? selectedRoomId : null,
          notes: notes || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao iniciar inventário")
      }

      router.push(`/inventario/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar inventário")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/inventario">
          <Button variant="outline" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Iniciar Novo Ciclo de Inventário</h1>
          <p className="page-subtitle">Configure o escopo da contagem física e conferência</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              Identificação do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Título do Inventário *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Inventário Anual 2026, Conferência Laboratório..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Ano de Referência *
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Unidade Escolar
                </label>
                <Input value={ORGANIZATION_NAME} disabled className="bg-gray-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escopo do Inventário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Escopo da Contagem Física
            </CardTitle>
            <CardDescription>
              Defina se a conferência será em toda a escola ou em uma sala específica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  scope === "ALL"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "ALL"}
                  onChange={() => setScope("ALL")}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Toda a Escola (Geral)</p>
                  <p className="text-xs text-gray-500">
                    Conferir todos os {totalAssets} patrimônios cadastrados
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  scope === "ROOM"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "ROOM"}
                  onChange={() => setScope("ROOM")}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-900">Sala / Ambiente Específico</p>
                  <p className="text-xs text-gray-500">
                    Inventariar apenas uma sala ou laboratório determinado
                  </p>
                </div>
              </label>
            </div>

            {scope === "ROOM" && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Selecione a Sala *
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione uma sala</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor.building.name} → {r.floor.name} → {r.name} ({r._count.assets} itens)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between text-sm">
              <span className="text-gray-600">Patrimônios esperados no escopo:</span>
              <span className="font-bold text-gray-900 font-mono text-base">
                {expectedItemsCount} bens
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardContent className="p-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Observações / Instruções para os Conferentes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Verificar também estado físico das cadeiras, registrar se faltam computadores..."
              className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/inventario">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading || (scope === "ROOM" && !selectedRoomId)}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando Ciclo...
              </>
            ) : (
              "Iniciar Inventário"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
