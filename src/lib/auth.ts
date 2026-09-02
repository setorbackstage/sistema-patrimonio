import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ciep395-patrimonio-secure-key-2026-seeduc",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const rawEmail = String(credentials.email).trim()
          const password = String(credentials.password)

          // Busca segura case-insensitive
          const user = await prisma.user.findFirst({
            where: {
              email: { equals: rawEmail, mode: "insensitive" },
              isActive: true,
              deletedAt: null,
            },
          })

          if (!user) {
            console.log(`[AUTH] Usuário não encontrado para email: ${rawEmail}`)
            return null
          }

          const isValid = await compare(password, user.passwordHash)

          if (!isValid) {
            console.log(`[AUTH] Senha inválida para usuário: ${user.email}`)
            return null
          }

          // Atualizar último login de forma assíncrona segura
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
          } catch (updateErr) {
            console.error("[AUTH] Erro ao atualizar lastLoginAt:", updateErr)
          }

          console.log(`[AUTH] Login bem-sucedido: ${user.email} (${user.role})`)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("[AUTH] Erro interno durante authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
})
