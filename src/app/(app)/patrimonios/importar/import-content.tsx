"use client"

import { useState, useCallback } from "react"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ParsedRow {
  rowIndex: number
  patrimonyNumber: string | null
  description: string | null
  classificationCode: string | null
  unitName: string | null
  unitOfMeasure: string | null
  quantity: number | null
  unitValue: number | null
  totalValue: number | null
  notes: string | null
  isValid: boolean
  errors: string[]
}

interface ImportResult {
  totalRows: number
  importedRows: number
  duplicateRows: number
  invalidRows: number
  ignoredRows: number
  errors: { row: number; message: string }[]
}

type Step = "upload" | "preview" | "importing" | "result"

export function ImportContent() {
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch("/api/import/parse", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao processar arquivo")
      }

      const data = await res.json()
      setParsedData(data.rows)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo")
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      handleFile(droppedFile)
    } else {
      setError("Formato inválido. Envie um arquivo .xlsx ou .xls")
    }
  }, [])

  const handleImport = async () => {
    setImporting(true)
    setStep("importing")

    try {
      const validRows = parsedData.filter((r) => r.isValid)

      const res = await fetch("/api/import/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro na importação")
      }

      const data = await res.json()
      setResult(data)
      setStep("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na importação")
      setStep("preview")
    } finally {
      setImporting(false)
    }
  }

  const validCount = parsedData.filter((r) => r.isValid).length
  const invalidCount = parsedData.filter((r) => !r.isValid).length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Importar Planilha</h1>
        <p className="page-subtitle">
          Importe patrimônios a partir de um arquivo Excel
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {["Upload", "Revisão", "Importando", "Resultado"].map((label, i) => {
          const steps: Step[] = ["upload", "preview", "importing", "result"]
          const isActive = steps.indexOf(step) >= i
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-gray-900" : "text-gray-400"
                } hidden sm:block`}
              >
                {label}
              </span>
              {i < 3 && (
                <div
                  className={`w-8 h-0.5 ${
                    isActive ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <Card>
          <CardContent className="p-8">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Arraste o arquivo Excel aqui
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Selecionar arquivo .xlsx
                  </span>
                </Button>
              </label>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Formato esperado
              </h3>
              <p className="text-sm text-gray-600">
                O sistema identifica automaticamente a estrutura da planilha oficial da SEEDUC-RJ
                (Inventário das Existências Físicas - Anexo IV - IN 41/2017).
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Colunas reconhecidas: Unidade, Código de Classificação, Nº de Patrimônio,
                Descrição, Unidade de Medida, Qtde, Valor Unitário, Valor Global, Observação.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <span className="stat-card-label">Total de registros</span>
              <span className="stat-card-value text-xl">{parsedData.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Válidos</span>
              <span className="stat-card-value text-xl text-emerald-600">{validCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Inválidos</span>
              <span className="stat-card-value text-xl text-red-600">{invalidCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Arquivo</span>
              <span className="text-sm font-medium text-gray-700 mt-2 truncate">{file?.name}</span>
            </div>
          </div>

          {/* Data preview table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pré-visualização dos dados</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th className="w-10">#</th>
                    <th>Patrimônio</th>
                    <th>Descrição</th>
                    <th>Classificação</th>
                    <th>Valor Unit.</th>
                    <th>Valor Global</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((row) => (
                    <tr key={row.rowIndex} className={!row.isValid ? "bg-red-50" : ""}>
                      <td className="text-gray-400">{row.rowIndex}</td>
                      <td className="font-mono font-semibold">{row.patrimonyNumber || "—"}</td>
                      <td className="max-w-xs truncate">{row.description || "—"}</td>
                      <td>{row.classificationCode || "—"}</td>
                      <td>{row.unitValue?.toFixed(2) || "—"}</td>
                      <td>{row.totalValue?.toFixed(2) || "—"}</td>
                      <td>
                        {row.isValid ? (
                          <Badge variant="success">Válido</Badge>
                        ) : (
                          <Badge variant="danger" title={row.errors.join(", ")}>
                            {row.errors[0]}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <p className="text-sm text-gray-500 p-4 text-center">
                  Mostrando 50 de {parsedData.length} registros
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button onClick={handleImport} disabled={validCount === 0}>
              Importar {validCount} patrimônios
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Importando patrimônios...
            </h2>
            <p className="text-sm text-gray-500">
              Processando {validCount} registros. Aguarde...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div>
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Importação concluída!
              </h2>
              <p className="text-sm text-gray-500">
                Os dados foram processados com sucesso
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="stat-card">
              <span className="stat-card-label">Total</span>
              <span className="stat-card-value text-xl">{result.totalRows}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Importados</span>
              <span className="stat-card-value text-xl text-emerald-600">{result.importedRows}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Duplicados</span>
              <span className="stat-card-value text-xl text-amber-600">{result.duplicateRows}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Inválidos</span>
              <span className="stat-card-value text-xl text-red-600">{result.invalidRows}</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Ignorados</span>
              <span className="stat-card-value text-xl text-gray-500">{result.ignoredRows}</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-red-700">Erros encontrados</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th>Linha</th>
                      <th>Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 20).map((err, i) => (
                      <tr key={i}>
                        <td className="font-mono">{err.row}</td>
                        <td className="text-red-700">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep("upload"); setParsedData([]); setResult(null); }}>
              Importar outro arquivo
            </Button>
            <a href="/patrimonios">
              <Button>
                <Package className="w-4 h-4" />
                Ver patrimônios
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
