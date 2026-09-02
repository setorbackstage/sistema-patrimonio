"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  MapPin,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSET_STATUS_MAP, ASSET_CONDITION_MAP, LABEL_STATUS_MAP } from "@/lib/constants"

interface Asset {
  id: string
  patrimonyNumber: string
  description: string
  categoryId: string | null
  brand: string | null
  model: string | null
  serialNumber: string | null
  unitOfMeasure: string
  quantity: number
  unitValue: string | number
  totalValue: string | number
  status: string
  condition: string
  labelStatus: string
  roomId: string | null
  specificLocation: string | null
  notes: string | null
}

interface Category {
  id: string
  code: string
  name: string
}

interface Room {
  id: string
  name: string
  floor: {
    name: string
    building: {
      name: string
    }
  }
}

interface Props {
  asset: Asset
  categories: Category[]
  rooms: Room[]
}

export function EditarPatrimonioForm({ asset, categories, rooms }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    description: asset.description || "",
    categoryId: asset.categoryId || "",
    brand: asset.brand || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    unitOfMeasure: asset.unitOfMeasure || "Unid",
    quantity: asset.quantity || 1,
    unitValue: Number(asset.unitValue) || 0,
    totalValue: Number(asset.totalValue) || 0,
    status: asset.status || "ACTIVE",
    condition: asset.condition || "NOT_EVALUATED",
    labelStatus: asset.labelStatus || "NOT_GENERATED",
    roomId: asset.roomId || "",
    specificLocation: asset.specificLocation || "",
    notes: asset.notes || "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === "unitValue" || name === "quantity") {
        const uv = name === "unitValue" ? Number(value) : prev.unitValue
        const q = name === "quantity" ? Number(value) : prev.quantity
        updated.totalValue = Number((uv * q).toFixed(2))
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar patrimônio")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/patrimonios/${asset.patrimonyNumber}`)
        router.refresh()
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/patrimonios/${asset.patrimonyNumber}`}>
          <Button variant="outline" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Editar Patrimônio {asset.patrimonyNumber}</h1>
          <p className="page-subtitle">Atualize os dados cadastrais do bem</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 mb-6">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Patrimônio atualizado com sucesso! Redirecionando...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-blue-600" />
              Identificação do Bem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nº de Patrimônio (Bloqueado)
                </label>
                <Input
                  value={asset.patrimonyNumber}
                  disabled
                  className="font-mono font-bold bg-gray-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Classificação SIAF / Categoria
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione uma classificação</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Descrição Completa do Bem *
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Marca
                </label>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Modelo
                </label>
                <Input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Número de Série
                </label>
                <Input
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localização Física */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Localização Física
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sala / Ambiente
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Sem localização definida</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor.building.name} → {r.floor.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Posição Específica
                </label>
                <Input
                  name="specificLocation"
                  value={formData.specificLocation}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores e Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Valores e Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Unidade
                </label>
                <Input
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Quantidade
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Valor Unitário (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="unitValue"
                  value={formData.unitValue}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Valor Global (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="totalValue"
                  value={formData.totalValue}
                  onChange={handleChange}
                  readOnly
                  className="bg-gray-50 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(ASSET_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Estado
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(ASSET_CONDITION_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Etiqueta
                </label>
                <select
                  name="labelStatus"
                  value={formData.labelStatus}
                  onChange={handleChange}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(LABEL_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Observações
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/patrimonios/${asset.patrimonyNumber}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando alterações...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
