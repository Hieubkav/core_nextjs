'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import ImageSelectModal from './ImageSelectModal'

interface Slider {
  id: number
  title: string
  subtitle: string | null
  content: string | null
  buttonText: string | null
  buttonLink: string | null
  imageId: number | null
  sortOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
  image: {
    id: number
    url: string
    alt: string | null
  } | null
}

interface SliderEditModalProps {
  slider: Slider
  onClose: () => void
  onSuccess: () => void
}

export default function SliderEditModal({ slider, onClose, onSuccess }: SliderEditModalProps) {
  const [saving, setSaving] = useState(false)
  const [showImageSelect, setShowImageSelect] = useState(false)
  const [formData, setFormData] = useState({
    title: slider.title || '',
    subtitle: slider.subtitle || '',
    content: slider.content || '',
    buttonText: slider.buttonText || '',
    buttonLink: slider.buttonLink || '',
    imageId: slider.imageId,
    sortOrder: slider.sortOrder || 0,
    isVisible: slider.isVisible
  })
  const [imagePreview, setImagePreview] = useState(slider.image)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update form data when slider prop changes
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      content: slider.content || '',
      buttonText: slider.buttonText || '',
      buttonLink: slider.buttonLink || '',
      imageId: slider.imageId,
      sortOrder: slider.sortOrder || 0,
      isVisible: slider.isVisible
    })
    setImagePreview(slider.image)
  }, [slider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/sliders/${slider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error updating slider:', error)
      alert('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  
    const handleImageSelect = (image: { id: number; url: string; alt: string | null }) => {
      setFormData(prev => ({ ...prev, imageId: image.id }))
      setImagePreview(image)
      setShowImageSelect(false)
    }
  
    const handleRemoveImage = () => {
      setFormData(prev => ({ ...prev, imageId: null }))
      setImagePreview(null)
    }
  
    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
  
      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      )
      
      if (files.length > 0) {
        handleFiles(files[0])
      }
    }
  
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        handleFiles(files[0])
      }
    }
  
    const handleFiles = async (file: File) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh JPG, PNG, GIF, WebP')
        return
      }
  
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('File ảnh không được lớn hơn 10MB')
        return
      }
  
      setUploading(true)
  
      try {
        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.split('.')[0])
        formData.append('alt', file.name)
  
        // Upload using API
        const response = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData
        })
  
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }
  
        const result = await response.json()
        
        // Set the uploaded image as the slider image
        setFormData(prev => ({ ...prev, imageId: result.image.id }))
        setImagePreview(result.image)
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setUploading(false)
      }
    }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[500px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Chỉnh sửa slider
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-4">
              {/* Slider Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>ID:</strong> {slider.id}</p>
                  <p><strong>Tạo lúc:</strong> {formatDate(slider.createdAt)}</p>
                  <p><strong>Cập nhật:</strong> {formatDate(slider.updatedAt)}</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tiêu đề slider"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phụ đề
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập phụ đề slider"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung slider..."
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Văn bản nút
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: Xem thêm, Mua ngay..."
                />
              </div>

              {/* Button Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liên kết nút
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: /san-pham, https://..."
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh
                </label>
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-16 w-24 relative">
                      <img
                        src={imagePreview.url}
                        alt={imagePreview.alt || 'Slider image'}
                        className="h-16 w-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {imagePreview.alt || 'Hình ảnh'}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setShowImageSelect(true)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Thay đổi
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-600">Tải ảnh lên</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowImageSelect(true)}
                        className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 0 01-2-2V6zM4 16a2 2 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="mt-2 text-sm text-gray-600">Chọn ảnh có sẵn</span>
                      </button>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      Hỗ trợ: PNG, JPG, GIF, WebP • Tối đa 10MB
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Upload area for drag and drop */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
                        </div>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            Kéo thả ảnh vào đây
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Số nhỏ hơn sẽ hiển thị trước
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Hiển thị slider này trên website
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || !formData.title.trim()}
                className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Select Modal */}
      {showImageSelect && (
        <ImageSelectModal
          onClose={() => setShowImageSelect(false)}
          onSelect={handleImageSelect}
          title="Chọn hình ảnh cho slider"
        />
      )}
    </div>
  )
}