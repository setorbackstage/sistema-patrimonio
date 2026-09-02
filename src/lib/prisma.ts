import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// URL do pooler do Supabase (porta 6543) - compatível com Vercel serverless
// Fallback para DATABASE_URL se definida (local ou outra env)
const getDatabaseUrl = () => {
  const envUrl = process.env.DATABASE_URL
  // Se já está configurada com a porta correta, usa ela
  if (envUrl && (envUrl.includes(':6543') || envUrl.includes('pgbouncer=true'))) {
    return envUrl
  }
  // Força a URL do pooler para garantir compatibilidade com a Vercel
  return 'postgresql://postgres:ktKdSi4Sogjuecbc@db.tsysjcurvxzfzflpafkw.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1'
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
