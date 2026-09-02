"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  MapPin,
  ClipboardCheck,
  Tag,
  FileBarChart,
  Settings,
  ChevronDown,
  Search,
  Plus,
  Upload,
  Building2,
  Layers,
  DoorOpen,
  AlertTriangle,
  Printer,
  Users,
  FolderOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { APP_NAME, ORGANIZATION_NAME } from "@/lib/constants"

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: { label: string; href: string; icon?: React.ElementType }[]
}

const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Patrimônio",
    icon: Package,
    children: [
      { label: "Todos", href: "/patrimonios", icon: FolderOpen },
      { label: "Cadastrar", href: "/patrimonios/novo", icon: Plus },
      { label: "Sem localização", href: "/patrimonios?filter=sem-localizacao", icon: AlertTriangle },
      { label: "Sem etiqueta", href: "/patrimonios?filter=sem-etiqueta", icon: Tag },
      { label: "Importar", href: "/patrimonios/importar", icon: Upload },
    ],
  },
  {
    label: "Localizações",
    icon: MapPin,
    children: [
      { label: "Mapa Físico", href: "/localizacoes", icon: MapPin },
      { label: "Prédios", href: "/localizacoes/predios", icon: Building2 },
      { label: "Andares", href: "/localizacoes/andares", icon: Layers },
      { label: "Salas", href: "/localizacoes/salas", icon: DoorOpen },
    ],
  },
  {
    label: "Inventário",
    icon: ClipboardCheck,
    children: [
      { label: "Novo inventário", href: "/inventario/novo" },
      { label: "Em andamento", href: "/inventario?status=em-andamento" },
      { label: "Concluídos", href: "/inventario?status=concluido" },
      { label: "Divergências", href: "/inventario?status=divergencias" },
    ],
  },
  {
    label: "Etiquetas",
    icon: Tag,
    children: [
      { label: "Estação de etiquetagem", href: "/etiquetas" },
      { label: "Impressão em lote", href: "/etiquetas/lote" },
      { label: "Modelos", href: "/etiquetas/modelos" },
    ],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: FileBarChart,
  },
  {
    label: "Administração",
    icon: Settings,
    children: [
      { label: "Usuários", href: "/admin/usuarios", icon: Users },
      { label: "Categorias", href: "/admin/categorias" },
      { label: "Configurações", href: "/admin/configuracoes" },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userRole?: string
}

export function Sidebar({ isOpen, onClose, userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Patrimônio"])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href.split("?")[0])
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn("sidebar", isOpen ? "sidebar-open" : "sidebar-collapsed lg:translate-x-0")}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">{APP_NAME}</span>
              <span className="text-[10px] text-gray-400 leading-tight">Gestão Patrimonial</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Busca rápida */}
        <div className="px-3 py-3 border-b border-gray-100">
          <Link
            href="/busca"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-400 text-sm hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <Search className="w-4 h-4" />
            <span>Buscar patrimônio...</span>
            <kbd className="hidden lg:inline-flex ml-auto text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
              Ctrl+K
            </kbd>
          </Link>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {navigation.map((item) => (
              <li key={item.label}>
                {item.href && !item.children ? (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        item.children?.some((c) => isActive(c.href))
                          ? "text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          expandedItems.includes(item.label) && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedItems.includes(item.label) && item.children && (
                      <ul className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                              )}
                            >
                              {child.icon && <child.icon className="w-4 h-4 shrink-0" />}
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Usuário / Footer */}
        <div className="border-t border-gray-200 p-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName || "Administrador"}</p>
              <p className="text-xs text-gray-500 truncate">{userRole || "Admin"}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
