import { NextRequest, NextResponse } from 'next/server'
import { DatabaseHelper } from '@/lib/database-helper'
import { PrismaHelper } from '@/lib/prisma'

/**
 * Health check endpoint cho database connection với server-side protection
 */
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra server-side environment
    if (!PrismaHelper.isServerSide()) {
      return NextResponse.json({
        status: 'error',
        database: 'not-available-client-side',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    const startTime = Date.now()
    
    // Kiểm tra database connection
    const isHealthy = await DatabaseHelper.healthCheck()
    
    const responseTime = Date.now() - startTime
    
    if (isHealthy) {
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}