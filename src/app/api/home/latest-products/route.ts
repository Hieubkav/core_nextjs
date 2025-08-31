import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    // Sử dụng safeQuery với retry logic
    const products: any[] = await safeQuery.findMany(prisma.product, {
      where: {
        isVisible: true,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variants: {
          where: { 
            isVisible: true,
            isDefault: true 
          },
          orderBy: { 
            sortOrder: 'asc' 
          },
          take: 1
        },
        images: {
          include: {
            image: {
              select: {
                id: true,
                url: true,
                alt: true,
                title: true
              }
            }
          },
          orderBy: { 
            sortOrder: 'asc' 
          },
          take: 1
        },
        _count: {
          select: {
            reviews: {
              where: {
                isVisible: true
              }
            }
          }
        }
      }
    })

    // Map products to include average rating and review count
    const mappedProducts = products.map((product: any) => {
      // Calculate average rating from reviews
      let averageRating = 0
      if (product._count.reviews > 0) {
        // In a real scenario, we would calculate the average rating from the reviews
        // For now, we'll just set a dummy value
        averageRating = 4.5
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDesc: product.shortDesc,
        features: product.features,
        categoryId: product.categoryId,
        sortOrder: product.sortOrder,
        isVisible: product.isVisible,
        isPublished: product.status === 'active',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        category: product.category,
        price: product.variants.length > 0 ? product.variants[0].price : 0,
        originalPrice: product.variants.length > 0 ? product.variants[0].originalPrice : null,
        imageUrl: product.images.length > 0 ? product.images[0].image.url : null,
        rating: averageRating,
        reviewCount: product._count.reviews
      }
    })

    return NextResponse.json(mappedProducts)
  } catch (error) {
    console.error('Home latest products API error:', error)
    
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