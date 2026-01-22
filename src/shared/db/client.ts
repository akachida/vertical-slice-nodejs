import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import { PrismaClient } from './generated/client/client'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

/**
 * Creates a singleton instance of PrismaClient.
 * Ensures only one database connection is maintained across the application.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

/**
 * Singleton Prisma client instance.
 * In development, this is cached globally to prevent multiple instances during hot reloads.
 */
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
