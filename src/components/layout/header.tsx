"use client"

import { Menu, Bell } from "lucide-react"
import { ORGANIZATION_NAME } from "@/lib/constants"

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="main-header">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 mr-3 transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        {title ? (
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        ) : (
          <p className="text-sm text-gray-500 truncate hidden sm:block">
            {ORGANIZATION_NAME}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
