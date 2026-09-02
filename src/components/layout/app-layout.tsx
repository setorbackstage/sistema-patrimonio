"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"

interface AppLayoutProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
}

export function AppLayout({ children, userName, userRole }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userRole={userRole}
      />

      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 pb-mobile-nav">
          {children}
        </main>
      </div>

      <MobileNav onMenuClick={() => setSidebarOpen(true)} />
    </div>
  )
}
