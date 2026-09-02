import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// URL do pooler do Supabase (porta 6543) - compatível com Vercel serverless
// Fallback para DATABASE_URL se definida (local ou outra env)
const getDatabaseUrl = () => {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && envUrl.includes('aws-0-')) {
    return envUrl
  }
  // URL of the transaction pooler (IPv4 compatible, required for Vercel)
  return 'postgresql://postgres.tsysjcurvxzfzflpafkw:ktKdSi4Sogjuecbc@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
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
