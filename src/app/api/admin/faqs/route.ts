import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

// GET - List all FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { question: { contains: search, mode: 'insensitive' as const } },
        { answer: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    // Sử dụng safeQuery với retry logic
    const [faqs, total] = await Promise.all([
      safeQuery.findMany(prisma.fAQ, {
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      safeQuery.count(prisma.fAQ, { where })
    ])

    const pages = Math.ceil((total as number) / limit)

    return NextResponse.json({
      faqs,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('FAQs API error:', error)
    
    // Nếu là lỗi connection, thử reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, sortOrder, isVisible } = body

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    // Tạo FAQ mới với safeQuery
    const faq = await safeQuery.create(prisma.fAQ, {
      data: {
        question,
        answer,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true
      }
    })

    return NextResponse.json(faq, { status: 201 })

  } catch (error) {
    console.error('FAQ creation error:', error)
    
    // Nếu là lỗi connection, thử reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}