"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Package, Eye, EyeOff, Loader2, Shield, UserCheck } from "lucide-react"
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
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha incorretos. Verifique suas credenciais.")
      } else {
        window.location.href = callbackUrl
      }
    } catch {
      setError("Erro ao realizar login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail)
    setPassword(userPass)
    setError("")
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Email de Acesso
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
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
              Autenticando...
            </>
          ) : (
            "Entrar no Sistema"
          )}
        </Button>
      </form>

      {/* Atalhos de Acesso Rápido */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
          Acesso Rápido (Contas Cadastradas)
        </p>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => fillCredentials("setorbackstage@gmail.com", "02122024Dn@")}
            className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200/80 hover:border-blue-200 transition-colors flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700">Diogo Peçanha (Criador / Admin)</p>
              <p className="text-[10px] text-gray-500 font-mono">setorbackstage@gmail.com</p>
            </div>
            <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Usar →
            </span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials("diretoria@ciep395.edu.br", "ciep395diretoria")}
            className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200/80 hover:border-blue-200 transition-colors flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-gray-900 group-hover:text-blue-700">Diretoria Geral — CIEP 395</p>
              <p className="text-[10px] text-gray-500 font-mono">diretoria@ciep395.edu.br</p>
            </div>
            <span className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Usar →
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
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
          <p className="text-xs text-blue-600 font-semibold mt-0.5">{ORGANIZATION_NAME} • U.A. 180866</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Entrar no Sistema</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Informe suas credenciais ou selecione seu usuário abaixo
            </p>
          </div>

          <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {ORGANIZATION_FULL}
        </p>
      </div>
    </div>
  )
}
