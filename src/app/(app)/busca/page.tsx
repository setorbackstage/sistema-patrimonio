import { Metadata } from "next"
import { BuscaContent } from "./busca-content"

export const metadata: Metadata = {
  title: "Busca Rápida – SisPatrimônio",
  description: "Busca rápida e leitor de patrimônio",
}

export default function BuscaPage() {
  return <BuscaContent />
}
