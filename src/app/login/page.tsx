"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Package, Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_NAME, ORGANIZATION_NAME, ORGANIZATION_FULL } from "@/lib/constants"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Email ou senha incorretos.")
      }

      // Redirecionamento limpo para a URL de destino
      window.location.href = callbackUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
          >
            Email de Acesso
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@exemplo.com"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
          >
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-sm font-bold shadow-md shadow-blue-600/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Entrar no Sistema
            </>
          )}
        </Button>
      </form>

      {/* Link para Registro / Criar Conta */}
      <div className="pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 mb-2">Ainda não possui uma conta de acesso?</p>
        <Link href="/register">
          <Button variant="outline" className="w-full text-xs font-semibold">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Criar Nova Conta / Registrar
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50" />

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25 mb-3">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestão Patrimonial</p>
          <p className="text-xs text-blue-600 font-semibold mt-0.5">
            {ORGANIZATION_NAME} • U.A. 180866
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Entrar no Sistema</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Informe seu email e senha para acessar o painel
            </p>
          </div>

          <Suspense
            fallback={
              <div className="h-40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">{ORGANIZATION_FULL}</p>
      </div>
    </div>
  )
}
