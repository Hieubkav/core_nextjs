import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

interface Product {
  id: number
  name: string
  slug: string
  description?: string
  shortDesc?: string
  features: string[]
  categoryId: number
  sortOrder: number
  isVisible: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  category: {
    id: number
    name: string
    slug: string
  }
  variants: ProductVariant[]
  images: ProductImage[]
  _count: {
    variants: number
    images: number
  }
}

interface ProductVariant {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  stock: number
  isDefault: boolean
  isVisible: boolean
  sortOrder: number
}

interface ProductImage {
  id: number
  sortOrder: number
  image: {
    id: number
    url: string
    alt: string
    title: string
  }
}

// GET - Lấy danh sách products với pagination và filter
export async function GET(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const isPublished = searchParams.get('isPublished')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions: any = {}
    
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      whereConditions.categoryId = parseInt(categoryId)
    }

    if (isPublished !== null) {
      whereConditions.isPublished = isPublished === 'true'
    }

    // Get products with relations
    const [products, totalCount] = await Promise.all([
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.product.findMany({
          where: whereConditions,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            variants: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
              take: 3 // Chỉ lấy 3 variants đầu cho preview
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
              orderBy: { sortOrder: 'asc' },
              take: 1 // Chỉ lấy ảnh đầu tiên cho preview
            },
            _count: {
              select: {
                variants: true,
                images: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder as 'asc' | 'desc'
          },
          skip: offset,
          take: limit
        })
      }),
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.product.count({
          where: whereConditions
        })
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Products API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy danh sách sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Tạo product mới
export async function POST(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { 
      name, 
      slug, 
      description, 
      shortDesc, 
      features, 
      categoryId, 
      variants,
      imageIds,
      sortOrder, 
      isVisible, 
      status 
    } = body

    // Validate required fields
    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tên, slug và danh mục là bắt buộc' 
        },
        { status: 400 }
      )
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Sản phẩm phải có ít nhất 1 variant' 
        },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existingProduct = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.findUnique({
        where: { slug }
      })
    })

    if (existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slug đã tồn tại' 
        },
        { status: 400 }
      )
    }

    // Create product with variants in transaction
    const product = await DatabaseHelper.transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          shortDesc,
          features: features || [],
          categoryId: parseInt(categoryId),
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
          isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
          status: status || 'active'
        }
      })

      // Create variants
      const variantPromises = variants.map((variant: any, index: number) => {
        return tx.productVariant.create({
          data: {
            name: variant.name,
            description: variant.description,
            price: parseFloat(variant.price),
            originalPrice: variant.originalPrice ? parseFloat(variant.originalPrice) : null,
            isDefault: variant.isDefault || index === 0, // First variant is default
            isVisible: variant.isVisible !== undefined ? Boolean(variant.isVisible) : true,
            sortOrder: variant.sortOrder !== undefined ? parseInt(variant.sortOrder) : index,
            productId: newProduct.id
          }
        })
      })

      await Promise.all(variantPromises)

      // Link images if provided
      if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
        const imagePromises = imageIds.map((imageId: number, index: number) => {
          return tx.productImage.create({
            data: {
              productId: newProduct.id,
              imageId,
              sortOrder: index
            }
          })
        })

        await Promise.all(imagePromises)
      }

      // Return product with relations
      return await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          variants: {
            orderBy: { sortOrder: 'asc' }
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
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
    })

    console.log(`✅ Created product: ${name}`)

    return NextResponse.json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: product
    }, { status: 201 })

  } catch (error) {
    console.error('Products API POST error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi tạo sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}