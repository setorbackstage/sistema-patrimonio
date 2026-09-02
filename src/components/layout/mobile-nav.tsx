"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Search,
  Menu,
} from "lucide-react"

const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patrimônio", href: "/patrimonios", icon: Package },
  { label: "Busca", href: "/busca", icon: Search },
  { label: "Inventário", href: "/inventario", icon: ClipboardCheck },
  { label: "Menu", href: "#menu", icon: Menu },
]

interface MobileNavProps {
  onMenuClick: () => void
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      {mobileNavItems.map((item) => {
        const isMenu = item.href === "#menu"
        const isActive = !isMenu && pathname.startsWith(item.href.split("?")[0])

        if (isMenu) {
          return (
            <button
              key={item.label}
              onClick={onMenuClick}
              className="mobile-nav-item"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn("mobile-nav-item", isActive && "active")}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
