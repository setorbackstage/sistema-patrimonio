"use client"

import { AppLayout } from "@/components/layout/app-layout"

export function DashboardLayoutClient({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode
  userName: string
  userRole: string
}) {
  return (
    <AppLayout userName={userName} userRole={userRole}>
      {children}
    </AppLayout>
  )
}
