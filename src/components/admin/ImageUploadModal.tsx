'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface ImageUploadModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ImageUploadModal({ onClose, onSuccess }: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileAlts, setFileAlts] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    // Validate file types
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      return allowedTypes.includes(file.type)
    })

    // Validate file sizes (max 10MB - will be optimized)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validSizeFiles = validFiles.filter(file => file.size <= maxSize)

    if (validSizeFiles.length !== files.length) {
      alert('Một số file không hợp lệ (chỉ chấp nhận JPG, PNG, GIF, WebP ≤ 10MB)')
    }

    setSelectedFiles(validSizeFiles)

    // Create previews
    const newPreviews = validSizeFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)

    // Initialize titles and alts with filename
    const newTitles = validSizeFiles.map(file => file.name.split('.')[0])
    const newAlts = validSizeFiles.map(file => file.name)
    setFileTitles(newTitles)
    setFileAlts(newAlts)
  }

  const removeFileFromList = (index: number) => {
    // Revoke preview URL
    URL.revokeObjectURL(previews[index])

    // Remove from arrays
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setFileTitles(prev => prev.filter((_, i) => i !== index))
    setFileAlts(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Create form data for new upload API
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', fileTitles[i] || file.name.split('.')[0])
        formData.append('alt', fileAlts[i] || file.name)

        // Upload using new optimized API
        const response = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        console.log('Upload successful:', result)
      }
      
      // Clean up previews
      previews.forEach(preview => URL.revokeObjectURL(preview))
      
      onSuccess()
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[600px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Tải lên hình ảnh
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Chọn file
              </span>{' '}
              hoặc kéo thả vào đây
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Hỗ trợ: PNG, JPG, GIF, WebP • Tối đa 5MB mỗi file
            </p>
          </div>

          {/* File Previews with Metadata */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Đã chọn ({selectedFiles.length})
              </h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {previews.map((preview, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <img
                        src={preview}
                        alt={selectedFiles[index].name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="text-xs text-gray-600 truncate">
                          {selectedFiles[index].name}
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tiêu đề (cho SEO)
                          </label>
                          <input
                            type="text"
                            value={fileTitles[index] || ''}
                            onChange={(e) => {
                              const newTitles = [...fileTitles]
                              newTitles[index] = e.target.value
                              setFileTitles(newTitles)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập tiêu đề cho ảnh..."
                          />
                        </div>

                        {/* Alt Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Alt text
                          </label>
                          <input
                            type="text"
                            value={fileAlts[index] || ''}
                            onChange={(e) => {
                              const newAlts = [...fileAlts]
                              newAlts[index] = e.target.value
                              setFileAlts(newAlts)
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Mô tả ảnh cho accessibility..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeFileFromList(index)}
                        className="text-red-500 hover:text-red-700 text-lg font-bold"
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Đang tải lên...
                </>
              ) : (
                `Tải lên ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
