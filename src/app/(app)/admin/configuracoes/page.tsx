import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { ConfiguracoesContent } from "./configuracoes-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Configurações da Unidade – SisPatrimônio",
  description: "Parâmetros e dados cadastrais da unidade escolar",
}

export default async function ConfiguracoesPage() {
  try {
    const [unit, org] = await Promise.all([
      prisma.unit.findFirst({ where: { code: "180866" } }),
      prisma.organization.findFirst(),
    ])

    return (
      <ConfiguracoesContent
        unit={unit ? JSON.parse(JSON.stringify(unit)) : null}
        org={org ? JSON.parse(JSON.stringify(org)) : null}
      />
    )
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
    return (
      <ConfiguracoesContent
        unit={{
          id: "ciep395",
          name: "CIEP 395 LUIZ HENRIQUE REZENDE NOVAES",
          code: "180866",
        }}
        org={{
          id: "seeduc",
          name: "Secretaria de Estado de Educação do Rio de Janeiro",
          code: "SEEDUC-RJ",
        }}
      />
    )
  }
}
