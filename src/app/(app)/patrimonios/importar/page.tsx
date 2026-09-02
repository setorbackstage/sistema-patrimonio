import { Metadata } from "next"
import { ImportContent } from "./import-content"

export const metadata: Metadata = {
  title: "Importar Planilha – SisPatrimônio",
  description: "Importar dados patrimoniais de planilha Excel",
}

export default function ImportPage() {
  return <ImportContent />
}
