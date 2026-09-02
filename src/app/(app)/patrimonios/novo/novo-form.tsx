"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ASSET_STATUS_MAP, ASSET_CONDITION_MAP } from "@/lib/constants"

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
  categories: Category[]
  rooms: Room[]
}

export function NovoPatrimonioForm({ categories, rooms }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    patrimonyNumber: "",
    description: "",
    categoryId: "",
    brand: "",
    model: "",
    serialNumber: "",
    unitOfMeasure: "Unid",
    quantity: 1,
    unitValue: 0,
    totalValue: 0,
    status: "ACTIVE",
    condition: "NOT_EVALUATED",
    roomId: "",
    specificLocation: "",
    notes: "",
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
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar patrimônio")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/patrimonios/${data.patrimonyNumber}`)
      }, 1000)
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
        <Link href="/patrimonios">
          <Button variant="outline" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Cadastrar Novo Patrimônio</h1>
          <p className="page-subtitle">Preencha as informações do bem patrimonial</p>
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
          <span>Patrimônio cadastrado com sucesso! Redirecionando...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-blue-600" />
              Identificação do Bem
            </CardTitle>
            <CardDescription>
              Dados fundamentais e tombamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nº de Patrimônio / Tombo *
                </label>
                <Input
                  name="patrimonyNumber"
                  value={formData.patrimonyNumber}
                  onChange={handleChange}
                  placeholder="Ex: 001234"
                  required
                  className="font-mono font-bold"
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
                placeholder="Descreva detalhadamente o item, características físicas, dimensões..."
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
                  placeholder="Ex: Dell, Epson, etc."
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
                  placeholder="Ex: OptiPlex 3080"
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
                  placeholder="Ex: SN-8746219"
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
            <CardDescription>
              Onde o bem está instalado ou guardado
            </CardDescription>
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
                  <option value="">Selecione a sala (ou deixe sem localização)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.floor.building.name} → {r.floor.name} → {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Localização Específica no Ambiente
                </label>
                <Input
                  name="specificLocation"
                  value={formData.specificLocation}
                  onChange={handleChange}
                  placeholder="Ex: Mesa do Diretor, Armário 02, Prateleira 3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores e Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Valores e Estado de Conservação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Unidade Medida
                </label>
                <Input
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  placeholder="Unid, CX, etc."
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Status Operacional
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
                  Estado de Conservação
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Observações Adicionais
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Informações adicionais, histórico, origem, número de processo..."
                className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/patrimonios">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Cadastrar Patrimônio"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
