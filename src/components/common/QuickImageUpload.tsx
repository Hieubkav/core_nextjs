'use client'

import { useState, useRef } from 'react'
import { PhotoIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/common/ToastProvider'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface QuickImageUploadProps {
  onImageAdded: (imageId: number) => void
  className?: string
}

export default function QuickImageUpload({ onImageAdded, className = '' }: QuickImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showSuccess, showError } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Lỗi tệp', 'Chỉ chấp nhận file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Lỗi dung lượng', 'File không được vượt quá 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload immediately
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      // Save metadata to database
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName,
          originalName: file.name,
          alt: file.name.split('.')[0],
          title: file.name.split('.')[0],
          size: file.size,
          mimeType: file.type,
          url: publicUrl,
        }),
      })

      const result = await response.json()

      if (result.id) {
        showSuccess('Upload thành công', 'Ảnh đã được thêm vào thư viện')
        onImageAdded(result.id)
        setIsOpen(false)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error('Không thể lưu metadata')
      }

    } catch (error) {
      console.error('Upload error:', error)
      showError('Lỗi upload', 'Không thể upload ảnh')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (fileInputRef.current) {
        // Create a new FileList
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files
        
        // Trigger change event
        const event = new Event('change', { bubbles: true })
        fileInputRef.current.dispatchEvent(event)
      }
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Thêm ảnh mới
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Thêm ảnh nhanh</h3>
          <button
            onClick={() => {
              setIsOpen(false)
              setPreview(null)
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {preview ? (
            <div className="space-y-4">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              {uploading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Đang upload...</span>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="quick-image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Chọn ảnh hoặc kéo thả vào đây
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PNG, JPG, JPEG tối đa 5MB
                  </span>
                </label>
                <input
                  id="quick-image-upload"
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}