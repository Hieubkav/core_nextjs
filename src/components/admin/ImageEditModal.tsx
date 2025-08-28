'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Image {
  id: number
  filename: string
  originalName: string
  alt: string
  title: string
  size: number
  mimeType: string
  url: string
  sortOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

interface ImageEditModalProps {
  image: Image
  onClose: () => void
  onSuccess: () => void
}

export default function ImageEditModal({ image, onClose, onSuccess }: ImageEditModalProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    alt: image.alt || '',
    title: image.title || '',
    sortOrder: image.sortOrder || 0,
    isVisible: image.isVisible
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/images/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Có lỗi xảy ra khi cập nhật')
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[500px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Chỉnh sửa hình ảnh
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
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-contain bg-white"
                      style={{
                        maxHeight: '300px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>File:</strong> {image.filename}</p>
                  <p><strong>Size:</strong> {formatFileSize(image.size)} • {image.mimeType}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Nhập tiêu đề hình ảnh"
                />
              </div>

              <div>
                <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                  Alt text
                </label>
                <input
                  type="text"
                  id="alt"
                  value={formData.alt}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Mô tả hình ảnh cho SEO"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    id="sortOrder"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-900">
                    Hiển thị
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={image.url}
                    readOnly
                    className="flex-1 block w-full border-gray-300 rounded-l-md shadow-sm bg-gray-50 text-gray-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(image.url)}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
