import { prisma, PrismaHelper } from './prisma'

/**
 * Database helper với enhanced retry logic và connection management
 */
export class DatabaseHelper {
  private static retryCount = 3
  private static retryDelay = 1000
  private static lastReconnectTime = 0
  private static reconnectCooldown = 5000 // 5 seconds cooldown

  /**
   * Kiểm tra nếu đang chạy trên server side
   */
  static ensureServerSide() {
    if (!PrismaHelper.isServerSide()) {
      throw new Error('DatabaseHelper can only be used on server side')
    }
  }

  /**
   * Kiểm tra nếu lỗi liên quan đến prepared statement
   */
  static isPreparedStatementError(error: any): boolean {
    if (!error?.message && !error?.code) return false
    
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code
    
    return (
      errorCode === '42P05' ||  // prepared statement already exists
      errorCode === '26000' ||  // prepared statement does not exist
      errorMessage.includes('prepared statement') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('does not exist')
    )
  }

  /**
   * Enhanced execute với smarter retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.retryCount
  ): Promise<T> {
    this.ensureServerSide()
    
    try {
      // Đảm bảo connection trước khi execute
      await PrismaHelper.ensureConnection()
      return await operation()
    } catch (error: any) {
      console.error(`Database operation failed:`, error?.message)
      
      if (this.isPreparedStatementError(error) && retries > 0) {
        console.warn(`🔄 Prepared statement error detected, retrying... (${retries} attempts left)`)
        
        // Smart reconnect với cooldown
        await this.smartReconnect()
        
        // Exponential backoff
        const delay = this.retryDelay * (this.retryCount - retries + 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return this.executeWithRetry(operation, retries - 1)
      }
      
      throw error
    }
  }

  /**
   * Smart reconnect với cooldown để tránh spam reconnections
   */
  static async smartReconnect(): Promise<void> {
    const now = Date.now()
    
    // Kiểm tra cooldown
    if (now - this.lastReconnectTime < this.reconnectCooldown) {
      console.log(`⏳ Reconnect cooldown active, skipping...`)
      return
    }
    
    try {
      console.log(`🔄 Attempting smart reconnection...`)
      await PrismaHelper.forceReconnect()
      this.lastReconnectTime = now
      console.log(`✅ Smart reconnection successful`)
    } catch (error) {
      console.error(`❌ Smart reconnection failed:`, error)
      this.lastReconnectTime = now // Vẫn set time để tránh spam
    }
  }

  /**
   * Legacy reconnect method - deprecated
   */
  static async reconnect(): Promise<void> {
    return this.smartReconnect()
  }

  /**
   * Enhanced health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await PrismaHelper.healthCheck()
      return result.healthy
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Simple transaction wrapper
   */
  static async transaction<T>(
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      return await prisma.$transaction(operation as any, {
        timeout: 10000, // 10 seconds timeout
        maxWait: 5000,  // 5 seconds max wait
      })
    })
  }
}

/**
 * Wrapper functions cho các operations thường dùng với server-side protection
 */
export const safeQuery = {
  /**
   * Safe findMany với retry
   */
  findMany: async <T>(model: any, args?: any): Promise<T[]> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.findMany(args))
  },

  /**
   * Safe findUnique với retry  
   */
  findUnique: async <T>(model: any, args: any): Promise<T | null> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.findUnique(args))
  },

  /**
   * Safe count với retry
   */
  count: async (model: any, args?: any): Promise<number> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.count(args))
  },

  /**
   * Safe create với retry
   */
  create: async <T>(model: any, args: any): Promise<T> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.create(args))
  },

  /**
   * Safe update với retry
   */
  update: async <T>(model: any, args: any): Promise<T> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.update(args))
  },

  /**
   * Safe delete với retry
   */
  delete: async <T>(model: any, args: any): Promise<T> => {
    DatabaseHelper.ensureServerSide()
    return DatabaseHelper.executeWithRetry(() => model.delete(args))
  },
}