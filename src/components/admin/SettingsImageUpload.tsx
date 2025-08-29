'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SettingsImageUploadProps {
  value: string
  onChange: (value: string) => void
  label: string
  description?: string
}

export default function SettingsImageUpload({ 
  value, 
  onChange, 
  label, 
  description 
}: SettingsImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [urlValue, setUrlValue] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('File quá lớn (tối đa 10MB)')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', label)
      formData.append('alt', label)

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      onChange(result.url)
      console.log('Upload successful:', result)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = () => {
    onChange(urlValue)
  }

  const handleRemove = () => {
    onChange('')
    setUrlValue('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Mode Toggle */}
      <div className="flex rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-2 text-sm font-medium border ${
            mode === 'url'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          } rounded-l-md`}
        >
          <LinkIcon className="w-4 h-4 inline mr-1" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-2 text-sm font-medium border-t border-r border-b ${
            mode === 'upload'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          } rounded-r-md`}
        >
          <CloudArrowUpIcon className="w-4 h-4 inline mr-1" />
          Upload
        </button>
      </div>

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Áp dụng
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                Đang tải lên...
              </div>
            ) : (
              <div>
                <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Nhấp để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP • Tối đa 10MB
                </p>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Current Image Preview */}
      {value && (
        <div className="relative">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
            <img
              src={value}
              alt={label}
              className="w-16 h-16 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png'
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Ảnh hiện tại
              </p>
              <p className="text-xs text-gray-500 truncate">
                {value}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700"
              title="Xóa ảnh"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}