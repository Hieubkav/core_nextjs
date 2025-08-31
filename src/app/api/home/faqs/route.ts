import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Sử dụng safeQuery với retry logic
    const faqs: any[] = await safeQuery.findMany(prisma.fAQ, {
      where: {
        isVisible: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Map FAQs
    const mappedFaqs = faqs.map((faq: any) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt
    }))

    return NextResponse.json(mappedFaqs)
  } catch (error) {
    console.error('Home FAQs API error:', error)
    
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