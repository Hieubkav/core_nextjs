import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import sharp from 'sharp'
import slugify from 'slugify'

// Helper function to create SEO-friendly filename
function createSEOFilename(originalName: string, title?: string): string {
  const baseName = title || originalName.split('.')[0]
  const slug = slugify(baseName, {
    lower: true,
    strict: true,
    locale: 'vi'
  })
  const timestamp = Date.now()
  return `${slug}-${timestamp}.webp`
}

// Helper function to optimize image
async function optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  let sharpInstance = sharp(buffer)
  
  // Get image metadata
  const metadata = await sharpInstance.metadata()
  
  // Resize if too large (max 1920px width)
  if (metadata.width && metadata.width > 1920) {
    sharpInstance = sharpInstance.resize(1920, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }
  
  // Convert to WebP with quality optimization
  return sharpInstance
    .webp({ 
      quality: 85,
      effort: 4 // Balance between compression and speed
    })
    .toBuffer()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const alt = formData.get('alt') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer, file.type)
    
    // Create SEO filename
    const seoFilename = createSEOFilename(file.name, title)
    const filePath = `images/${seoFilename}`

    // Upload to Supabase Storage using admin client
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 500 }
      )
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('banacc')
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('banacc')
      .getPublicUrl(filePath)

    // Save metadata to database
    const image = await prisma.image.create({
      data: {
        filename: seoFilename,
        originalName: file.name,
        alt: alt || file.name,
        title: title || file.name,
        size: optimizedBuffer.length, // Size of optimized image
        mimeType: 'image/webp',
        url: publicUrl,
        sortOrder: 0,
        isVisible: true
      }
    })

    return NextResponse.json(image, { status: 201 })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
