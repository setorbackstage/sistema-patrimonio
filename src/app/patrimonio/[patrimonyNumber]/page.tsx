import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import {
  Package,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  ASSET_STATUS_MAP,
  ASSET_CONDITION_MAP,
  ORGANIZATION_NAME,
  ORGANIZATION_FULL,
} from "@/lib/constants"

interface PageProps {
  params: Promise<{ patrimonyNumber: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { patrimonyNumber } = await params
  return {
    title: `Patrimônio ${patrimonyNumber} – ${ORGANIZATION_NAME}`,
    description: `Consulta pública do bem patrimonial tombado ${patrimonyNumber}`,
  }
}

export default async function PublicAssetPage({ params }: PageProps) {
  const { patrimonyNumber } = await params

  const asset = await prisma.asset.findFirst({
    where: {
      patrimonyNumber,
      deletedAt: null,
    },
    include: {
      category: true,
      unit: true,
      room: {
        include: {
          floor: {
            include: {
              building: true,
            },
          },
        },
      },
    },
  })

  if (!asset) {
    notFound()
  }

  const statusInfo = ASSET_STATUS_MAP[asset.status as keyof typeof ASSET_STATUS_MAP]
  const conditionInfo = ASSET_CONDITION_MAP[asset.condition as keyof typeof ASSET_CONDITION_MAP]

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Header Oficial */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 shadow-md text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {ORGANIZATION_NAME}
          </h1>
          <p className="text-xs text-gray-500">{ORGANIZATION_FULL}</p>
          <p className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mt-1">
            Sistema de Identificação Patrimonial
          </p>
        </div>

        {/* Card Principal do Bem */}
        <Card className="shadow-lg border-blue-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                Nº de Tombamento
              </span>
              <div className="flex gap-1.5">
                <Badge className="bg-white/20 text-white border-transparent">
                  {statusInfo?.label || asset.status}
                </Badge>
              </div>
            </div>
            <p className="text-3xl font-mono font-bold mt-1 tracking-tight">
              {asset.patrimonyNumber}
            </p>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Descrição */}
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Descrição do Item
              </span>
              <p className="text-base font-semibold text-gray-900 leading-snug">
                {asset.description}
              </p>
            </div>

            {/* Localização Atual */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-2">
                Localização Física Registrada
              </span>
              {asset.room ? (
                <div className="space-y-1 text-sm text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Prédio:</strong> {asset.room.floor.building.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Andar / Sala:</strong> {asset.room.floor.name} — {asset.room.name}</span>
                  </div>
                  {asset.specificLocation && (
                    <p className="text-xs text-emerald-800 pt-1">
                      <strong>Posição:</strong> {asset.specificLocation}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Sem sala atribuída no sistema
                </p>
              )}
            </div>

            {/* Metadados Técnicos */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100">
              <div>
                <span className="font-medium text-gray-500 block">Classificação:</span>
                <span className="font-semibold text-gray-800">
                  {asset.category ? `${asset.category.name} (${asset.category.code})` : "—"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Estado:</span>
                <span className="font-semibold text-gray-800">
                  {conditionInfo?.label || asset.condition}
                </span>
              </div>
              {asset.brand && (
                <div>
                  <span className="font-medium text-gray-500 block">Marca / Modelo:</span>
                  <span className="font-semibold text-gray-800">
                    {asset.brand} {asset.model ? `/ ${asset.model}` : ""}
                  </span>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <span className="font-medium text-gray-500 block">Nº de Série:</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {asset.serialNumber}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botão de Acesso Administrativo */}
        <div className="text-center space-y-3">
          <Link href={`/login?callbackUrl=/patrimonios/${asset.patrimonyNumber}`}>
            <Button variant="outline" className="w-full">
              Acessar Painel Administrativo
            </Button>
          </Link>
          <p className="text-[11px] text-gray-400">
            CIEP 395 Luiz Henrique Rezende Novaes • SEEDUC-RJ
          </p>
        </div>
      </div>
    </div>
  )
}
