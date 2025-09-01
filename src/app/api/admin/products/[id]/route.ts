import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy product theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params

    const product = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.findUnique({
        where: { id: parseInt(id) },
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
                  title: true,
                  filename: true
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
    })

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy sản phẩm' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        isPublished: product.status === 'active'
      }
    })

  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy thông tin sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params
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
      isPublished,
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

    // Check if product exists
    const existingProduct = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.findUnique({
        where: { id: parseInt(id) }
      })
    })

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy sản phẩm' 
        },
        { status: 404 }
      )
    }

    // Check slug uniqueness (exclude current product)
    const slugConflict = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.findFirst({
        where: { 
          slug,
          id: { not: parseInt(id) }
        }
      })
    })

    if (slugConflict) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slug đã tồn tại' 
        },
        { status: 400 }
      )
    }

    // Update product with variants in transaction
    const product = await DatabaseHelper.transaction(async (tx) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: parseInt(id) },
        data: {
          name,
          slug,
          description,
          shortDesc,
          features: features || [],
          categoryId: parseInt(categoryId),
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
          isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
          // Map isPublished to status field
          status: isPublished !== undefined 
            ? (Boolean(isPublished) ? 'active' : 'inactive')
            : (status || undefined)
        }
      })

      // Handle variants if provided
      if (variants && Array.isArray(variants)) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { productId: parseInt(id) }
        })

        // Create new variants
        const variantPromises = variants.map((variant: any, index: number) => {
          return tx.productVariant.create({
            data: {
              name: variant.name,
              description: variant.description,
              price: parseFloat(variant.price),
              originalPrice: variant.originalPrice ? parseFloat(variant.originalPrice) : null,
              isDefault: variant.isDefault || index === 0,
              isVisible: variant.isVisible !== undefined ? Boolean(variant.isVisible) : true,
              sortOrder: variant.sortOrder !== undefined ? parseInt(variant.sortOrder) : index,
              productId: parseInt(id)
            }
          })
        })

        await Promise.all(variantPromises)
      }

      // Handle images if provided
      if (imageIds && Array.isArray(imageIds)) {
        // Delete existing product images
        await tx.productImage.deleteMany({
          where: { productId: parseInt(id) }
        })

        // Create new product images
        if (imageIds.length > 0) {
          const imagePromises = imageIds.map((imageId: number, index: number) => {
            return tx.productImage.create({
              data: {
                productId: parseInt(id),
                imageId,
                sortOrder: index
              }
            })
          })

          await Promise.all(imagePromises)
        }
      }

      // Return updated product with relations
      return await tx.product.findUnique({
        where: { id: parseInt(id) },
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

    console.log(`✅ Updated product: ${name}`)

    return NextResponse.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: {
        ...product,
        isPublished: product?.status === 'active'
      }
    })

  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi cập nhật sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Xóa product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params

    // Check if product exists
    const existingProduct = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.findUnique({
        where: { id: parseInt(id) }
      })
    })

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy sản phẩm' 
        },
        { status: 404 }
      )
    }

    // Delete product (variants and images will be deleted by CASCADE)
    await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.product.delete({
        where: { id: parseInt(id) }
      })
    })

    console.log(`✅ Deleted product ID: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    })

  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi xóa sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
