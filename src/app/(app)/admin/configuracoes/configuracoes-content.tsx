"use client"

import { Building2, School, ShieldCheck, Database, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ORGANIZATION_NAME, ORGANIZATION_FULL, APP_NAME } from "@/lib/constants"

interface Unit {
  id: string
  name: string
  code: string
}

interface Org {
  id: string
  name: string
  code: string
}

interface Props {
  unit: Unit | null
  org: Org | null
}

export function ConfiguracoesContent({ unit, org }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header mb-6">
        <h1 className="page-title">Configurações do Sistema</h1>
        <p className="page-subtitle">Identificação da unidade escolar e parâmetros operacionais</p>
      </div>

      {/* Dados da Escola */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600" />
            Unidade Escolar
          </CardTitle>
          <CardDescription>Dados oficiais conforme cadastro na SEEDUC-RJ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Nome da Unidade
              </label>
              <Input value={unit?.name || ORGANIZATION_NAME} disabled className="bg-gray-50 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Código U.A. / SEEDUC
              </label>
              <Input value={unit?.code || "180866"} disabled className="bg-gray-50 font-mono font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Órgão / Secretaria
            </label>
            <Input value={org?.name || ORGANIZATION_FULL} disabled className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      {/* Infraestrutura e Banco de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Infraestrutura e Banco de Dados
          </CardTitle>
          <CardDescription>Status da conexão com PostgreSQL / Neon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">Provedor de Banco de Dados</p>
                <p className="text-xs text-gray-500">PostgreSQL (Neon Serverless / Prisma ORM)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Configurado via DATABASE_URL
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-900">Autenticação e Sessão</p>
                <p className="text-xs text-gray-500">NextAuth v5 (JWT com RBAC)</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Ativo
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
