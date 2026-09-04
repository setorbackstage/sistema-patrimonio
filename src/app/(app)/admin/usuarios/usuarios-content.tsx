"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { USER_ROLE_MAP } from "@/lib/constants"
import { formatDateTime } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export function UsuariosContent({ users }: { users: User[] }) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("OPERATOR")
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const openAddModal = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("OPERATOR")
    setIsActive(true)
    setError("")
    setShowAddModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setPassword("") // Blank means keep current
    setRole(user.role)
    setIsActive(user.isActive)
    setError("")
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário")
      }

      setShowAddModal(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setLoading(true)
    setError("")

    try {
      const payload: any = { name, email, role, isActive }
      if (password.trim()) {
        payload.password = password.trim()
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar usuário")
      }

      setEditingUser(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuário")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir usuário")
      }

      setDeletingUser(null)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Gestão de Usuários e Acessos</h1>
          <p className="page-subtitle">
            Cadastre a diretora, professores e operadores do CIEP 395
          </p>
        </div>
        <Button onClick={openAddModal}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          <span>Novo Usuário</span>
        </Button>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardContent className="p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome / Colaborador</th>
                <th>Email de Login</th>
                <th>Perfil de Acesso</th>
                <th>Status</th>
                <th>Último Acesso</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleInfo = USER_ROLE_MAP[user.role as keyof typeof USER_ROLE_MAP]

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-500">Cadastrado em {new Date(user.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-700 text-xs font-mono font-medium">{user.email}</td>
                    <td>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {roleInfo?.label || user.role}
                      </Badge>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <XCircle className="w-3.5 h-3.5" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Nunca acessou"}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditModal(user)}
                          title="Editar dados e senha"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingUser(user)}
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Criar Novo Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Cadastrar Novo Usuário</h3>
            <p className="text-sm text-gray-500 mb-4">Crie um acesso para a diretora ou operador da escola</p>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Profª. Maria (Diretora Geral)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email de Login *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="diretoria@ciep395.edu.br"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Senha de Acesso *
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina uma senha (mínimo 6 dígitos)"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Perfil de Acesso *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500"
                >
                  {Object.entries(USER_ROLE_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label} — {val.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Cadastrar Usuário
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário / Trocar Senha */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Editar Usuário</h3>
            <p className="text-sm text-gray-500 mb-4">Atualize permissões ou redefina a senha</p>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email de Login *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-blue-500"
                >
                  {Object.entries(USER_ROLE_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label} — {val.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="userActiveCheck" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Acesso Ativo ao Sistema
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Usuário?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja remover o acesso de <strong className="text-gray-900">{deletingUser.name}</strong> ({deletingUser.email})?
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeletingUser(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteUser} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
