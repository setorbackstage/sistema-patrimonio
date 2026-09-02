"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Layers,
  DoorOpen,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ROOM_TYPE_MAP } from "@/lib/constants"

interface Room {
  id: string
  name: string
  type: string
  responsible: string | null
  _count: {
    assets: number
  }
}

interface Floor {
  id: string
  name: string
  number: number
  rooms: Room[]
}

interface Building {
  id: string
  name: string
  description: string | null
  floors: Floor[]
}

interface Props {
  buildings: Building[]
  totalAssets: number
  unlocatedAssets: number
}

export function LocalizacoesContent({ buildings, totalAssets, unlocatedAssets }: Props) {
  const router = useRouter()
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [selectedFloorId, setSelectedFloorId] = useState("")
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomType, setNewRoomType] = useState("CLASSROOM")
  const [newRoomResponsible, setNewRoomResponsible] = useState("")
  const [loading, setLoading] = useState(false)

  // Estado para exclusão
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const locatedAssets = totalAssets - unlocatedAssets
  const locationPercentage = totalAssets > 0 ? Math.round((locatedAssets / totalAssets) * 100) : 0

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName || !selectedFloorId) return

    setLoading(true)
    try {
      const res = await fetch("/api/locations/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          floorId: selectedFloorId,
          type: newRoomType,
          responsible: newRoomResponsible || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao criar sala")
      }

      setShowAddRoom(false)
      setNewRoomName("")
      setNewRoomResponsible("")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar sala")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return
    setDeleteLoading(true)

    try {
      const res = await fetch(`/api/locations/rooms/${deletingRoom.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Erro ao excluir sala")
      }

      setDeletingRoom(null)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir sala")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Lista plana de todos os andares para o select
  const allFloors = buildings.flatMap((b) =>
    b.floors.map((f) => ({
      id: f.id,
      name: `${b.name} → ${f.name}`,
    }))
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Mapa de Localizações Físicas</h1>
          <p className="page-subtitle">Estrutura predial e distribuição de salas do CIEP 395</p>
        </div>
        <Button onClick={() => setShowAddRoom(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Nova Sala</span>
        </Button>
      </div>

      {/* Indicadores de Cobertura */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <span className="stat-card-label">Patrimônios Localizados</span>
          <div className="flex items-baseline gap-2">
            <span className="stat-card-value text-emerald-600">
              {locatedAssets.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-gray-500 font-medium">({locationPercentage}%)</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Sem Sala Atribuída</span>
          <span className="stat-card-value text-amber-600">
            {unlocatedAssets.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total de Ambientes</span>
          <span className="stat-card-value">
            {buildings.reduce((sum, b) => sum + b.floors.reduce((fSum, f) => fSum + f.rooms.length, 0), 0)} salas
          </span>
        </div>
      </div>

      {/* Árvore de Prédios, Andares e Salas */}
      <div className="space-y-6">
        {buildings.map((building) => (
          <Card key={building.id} className="overflow-hidden border-gray-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{building.name}</h2>
                  <p className="text-xs text-slate-400">{building.description || "Prédio escolar"}</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {building.floors.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum andar cadastrado neste prédio.</p>
              ) : (
                building.floors.map((floor) => (
                  <div key={floor.id} className="border-l-2 border-blue-500 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                        {floor.name}
                      </h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {floor.rooms.length} {floor.rooms.length === 1 ? "sala" : "salas"}
                      </Badge>
                    </div>

                    {/* Grid de Salas do Andar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {floor.rooms.map((room) => {
                        const typeInfo = ROOM_TYPE_MAP[room.type as keyof typeof ROOM_TYPE_MAP]

                        return (
                          <div
                            key={room.id}
                            className="relative group p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <Link
                              href={`/localizacoes/salas/${room.id}`}
                              className="block flex-1"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <DoorOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {room.name}
                                  </h4>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
                              </div>
                            </Link>

                            <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-gray-100">
                              <Badge variant="secondary" className="text-[10px] py-0 font-normal">
                                {typeInfo?.label || "Sala"}
                              </Badge>

                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-600">
                                  {room._count.assets} {room._count.assets === 1 ? "bem" : "bens"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDeletingRoom(room)
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Excluir sala"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Criar Nova Sala */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Cadastrar Nova Sala</h3>
            <p className="text-sm text-gray-500 mb-4">Adicione um novo ambiente para alocar patrimônios no CIEP 395</p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Andar / Localização *
                </label>
                <select
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione o andar</option>
                  {allFloors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome da Sala / Ambiente *
                </label>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Ex: Sala 104, Laboratório de Robótica, Sala de Vídeo..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tipo de Ambiente
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(ROOM_TYPE_MAP).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Responsável pelo Ambiente
                </label>
                <Input
                  value={newRoomResponsible}
                  onChange={(e) => setNewRoomResponsible(e.target.value)}
                  placeholder="Ex: Prof. Carlos, Coordenação Pedagógica..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddRoom(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !newRoomName || !selectedFloorId}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Criar Sala
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Sala */}
      {deletingRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Sala?</h3>
                <p className="text-xs text-gray-500">Esta ação removerá a sala do mapa de localizações</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja remover a sala <strong className="text-gray-900">{deletingRoom.name}</strong>?
              {deletingRoom._count.assets > 0 && (
                <span className="block mt-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
                  ⚠️ Esta sala possui <strong>{deletingRoom._count.assets} patrimônio(s)</strong> alocado(s).
                  Os itens não serão apagados, mas ficarão classificados como <em>"Sem Sala Atribuída"</em>.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingRoom(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteRoom}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Excluindo...
                  </>
                ) : (
                  "Sim, Excluir Sala"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
