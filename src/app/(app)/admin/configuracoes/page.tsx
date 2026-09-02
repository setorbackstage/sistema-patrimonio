import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { ConfiguracoesContent } from "./configuracoes-content"

export const metadata: Metadata = {
  title: "Configurações da Unidade – SisPatrimônio",
  description: "Parâmetros e dados cadastrais da unidade escolar",
}

export default async function ConfiguracoesPage() {
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
}
