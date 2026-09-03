"use client"

import Link from "next/link"
import {
  MapPin,
  ArrowRight,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RoomProgress {
  id: string
  name: string
  building: string
  floor: string
  total: number
  labeled: number
}

interface Props {
  rooms: RoomProgress[]
  unlocatedCount: number
  totalAssets: number
  appliedCount: number
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  const color =
    pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : pct > 0 ? "bg-amber-500" : "bg-gray-300"
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function IdentificacaoContent({ rooms, unlocatedCount, totalAssets, appliedCount }: Props) {
  const globalPct = totalAssets === 0 ? 0 : Math.round((appliedCount / totalAssets) * 100)
  const doneRooms = rooms.filter((r) => r.total > 0 && r.labeled === r.total).length
  const emptyRooms = rooms.filter((r) => r.total === 0).length

  // Agrupa por prédio
  const byBuilding = rooms.reduce<Record<string, RoomProgress[]>>((acc, r) => {
    ;(acc[r.building] ||= []).push(r)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          Identificação em Campo
        </h1>
        <p className="page-subtitle">
          Percorra o prédio sala por sala: confirme o que está na sala, registre o que faltar e
          etiquete. Seu progresso aparece aqui em tempo real.
        </p>
      </div>

      {/* Resumo geral */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Progresso geral da escola
              </p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {appliedCount}
                <span className="text-lg font-bold text-gray-400"> / {totalAssets} bens etiquetados</span>
                <span className="ml-3 text-xl font-black text-blue-600">{globalPct}%</span>
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-black text-green-600">{doneRooms}</p>
                <p className="text-gray-500">salas concluídas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">{rooms.length - doneRooms - emptyRooms}</p>
                <p className="text-gray-500">em andamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-400">{emptyRooms}</p>
                <p className="text-gray-500">não visitadas</p>
              </div>
            </div>
          </div>
          <ProgressBar value={appliedCount} max={totalAssets} />
        </CardContent>
      </Card>

      {/* Pendência de localização */}
      {unlocatedCount > 0 && (
        <Link href="/identificacao/sala/sem-localizacao" className="block mb-6">
          <Card className="border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900">
                    {unlocatedCount} bens ainda sem sala definida
                  </p>
                  <p className="text-sm text-amber-700">
                    Itens importados da planilha que ainda não foram distribuídos nas salas
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Salas por prédio */}
      {Object.entries(byBuilding).map(([building, list]) => (
        <div key={building} className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
            <Building2 className="w-5 h-5 text-gray-500" />
            {building}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((r) => {
              const pct = r.total === 0 ? 0 : Math.round((r.labeled / r.total) * 100)
              const done = r.total > 0 && r.labeled === r.total
              return (
                <Link key={r.id} href={`/identificacao/sala/${r.id}`}>
                  <Card
                    className={`h-full hover:shadow-md transition-shadow ${
                      done ? "border-green-300 bg-green-50/50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-500">{r.floor}</p>
                        </div>
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        ) : (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {r.labeled}/{r.total}
                          </Badge>
                        )}
                      </div>
                      <ProgressBar value={r.labeled} max={r.total} />
                      <p className="text-xs text-gray-400 mt-2">
                        {r.total === 0
                          ? "Nenhum bem alocado ainda"
                          : done
                          ? "Etiquetagem concluída ✓"
                          : `${pct}% etiquetado`}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Dica de fluxo */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <ClipboardCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Como funciona o fluxo em cada sala:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
              <li>Selecione a sala e veja os bens que "moram" nela</li>
              <li>Confirme os que estão lá (check) — o divergente é alertado</li>
              <li>Adicione na hora o bem que está na sala mas não constava</li>
              <li>Exporte as etiquetas da sala (PNG 203dpi ou impressão direta)</li>
              <li>Cole e escaneie o QR — a sala fica verde quando completar</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
