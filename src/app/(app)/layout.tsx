import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "./layout-client"
import { USER_ROLE_MAP } from "@/lib/constants"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const roleLabel = USER_ROLE_MAP[session.user.role as keyof typeof USER_ROLE_MAP]?.label || session.user.role

  return (
    <DashboardLayoutClient
      userName={session.user.name || "Usuário"}
      userRole={roleLabel}
    >
      {children}
    </DashboardLayoutClient>
  )
}
