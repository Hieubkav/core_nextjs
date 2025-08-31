import { PrismaClient } from '@/generated/prisma'

// Khai báo global type cho Prisma
declare global {
  var __prisma: PrismaClient | undefined
  var __prismaConnected: boolean | undefined
}

// Kiểm tra runtime environment
const isServerSide = typeof window === 'undefined'
const hasProcess = typeof process !== 'undefined'

// Tạo function để init Prisma với config tối ưu
function createPrismaClient() {
  if (!isServerSide) {
    throw new Error('Prisma Client should only be instantiated on the server side')
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          // Sử dụng session mode để tránh prepared statement issues
          url: process.env.DATABASE_URL + '?prepared_statements=false&pgbouncer=true&connection_limit=1&pool_timeout=0'
        }
      }
    })
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    throw error
  }
}

// Sử dụng singleton pattern cho development - chỉ trên server
let prismaClient: PrismaClient | undefined

if (isServerSide) {
  prismaClient = globalThis.__prisma ?? createPrismaClient()
  
  // Cache instance trong development để tránh multiple connections
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prismaClient
    if (globalThis.__prismaConnected === undefined) {
      globalThis.__prismaConnected = false
    }
  }
}

// Export prisma client với null check
export const prisma = prismaClient!

// Enhanced connection helpers
export const PrismaHelper = {
  /**
   * Kiểm tra nếu đang chạy trên server
   */
  isServerSide: () => isServerSide,

  /**
   * Ensure connection với retry logic
   */
  async ensureConnection() {
    if (!isServerSide || !prismaClient) {
      throw new Error('PrismaHelper can only be used on server side')
    }

    if (!globalThis.__prismaConnected) {
      try {
        await prismaClient.$connect()
        globalThis.__prismaConnected = true
        console.log('✅ Prisma connected successfully')
      } catch (error) {
        console.error('❌ Prisma connection failed:', error)
        globalThis.__prismaConnected = false
        throw error
      }
    }
  },

  /**
   * Force reconnection
   */
  async forceReconnect() {
    if (!isServerSide || !prismaClient) {
      throw new Error('PrismaHelper can only be used on server side')
    }

    try {
      await prismaClient.$disconnect()
      globalThis.__prismaConnected = false
      // Delay để đảm bảo disconnect hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 500))
      await this.ensureConnection()
      console.log('✅ Force reconnect successful')
    } catch (error) {
      console.error('❌ Force reconnect failed:', error)
      throw error
    }
  },

  /**
   * Health check với detailed info
   */
  async healthCheck() {
    if (!isServerSide || !prismaClient) {
      return { healthy: false, error: 'Not available on client side' }
    }

    try {
      const startTime = Date.now()
      await prismaClient.$queryRaw`SELECT 1 as health_check`
      const responseTime = Date.now() - startTime
      console.log(`✅ Database health check OK (${responseTime}ms)`)
      return { healthy: true, responseTime }
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Graceful shutdown chỉ chạy trên server side và không phải trong Edge Runtime
const isEdgeRuntime = typeof process !== 'undefined' && process.env?.NEXT_RUNTIME === 'edge';
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.on && !isEdgeRuntime) {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🔄 Received ${signal}. Gracefully shutting down...`)
    try {
      await prisma.$disconnect()
      globalThis.__prismaConnected = false
      console.log('✅ Prisma disconnected successfully')
    } catch (error) {
      console.error('❌ Error during Prisma disconnect:', error)
    } finally {
      process.exit(0)
    }
  }

  // Bảo vệ thêm với try-catch
  try {
    process.on('beforeExit', async () => {
      if (globalThis.__prismaConnected) {
        await prisma.$disconnect()
        globalThis.__prismaConnected = false
      }
    })
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'))
    
    console.log('🛡️ Process handlers registered successfully')
  } catch (error) {
    console.warn('⚠️ Could not register process handlers:', error)
  }
}
