import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Em DEV/TEST: usa sempre o DATABASE_URL do .env (banco local).
// Em PRODUÇÃO: mantém o pooler IPv4 do Supabase (necessário para Vercel),
// a menos que DATABASE_URL esteja explicitamente definida como pooler.
const getDatabaseUrl = () => {
  const envUrl = process.env.DATABASE_URL
  if (process.env.NODE_ENV !== "production" && envUrl) {
    return envUrl
  }
  if (envUrl && envUrl.includes('aws-0-')) {
    return envUrl
  }
  // URL of the transaction pooler (IPv4 compatible, required for Vercel)
  return 'postgresql://postgres.tsysjcurvxzfzflpafkw:***@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
