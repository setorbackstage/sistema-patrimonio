"use client"

import Link from "next/link"
import { Layers, Package, DollarSign, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  code: string
  name: string
  description: string | null
  assetCount: number
  totalValue: number
}

export function CategoriasContent({ categories }: { categories: Category[] }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header mb-6">
        <h1 className="page-title">Classificações Patrimoniais SIAF</h1>
        <p className="page-subtitle">
          Códigos de classificação contábil e orçamentária do Estado do Rio de Janeiro
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código SIAF</th>
                <th>Nome da Classificação</th>
                <th className="text-right">Patrimônios Cadastrados</th>
                <th className="text-right">Valor Total Acumulado</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="font-mono font-bold text-blue-600">{cat.code}</td>
                  <td className="font-medium text-gray-900">{cat.name}</td>
                  <td className="text-right font-semibold text-gray-700">
                    {cat.assetCount} {cat.assetCount === 1 ? "item" : "itens"}
                  </td>
                  <td className="text-right font-bold text-emerald-600">
                    {formatCurrency(cat.totalValue)}
                  </td>
                  <td>
                    <Link href={`/patrimonios?category=${cat.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
