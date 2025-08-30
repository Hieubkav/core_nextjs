'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, MagnifyingGlassIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ImageSelectModalProps {
  onClose: () => void
  onSelect: (image: Image) => void
  title?: string
}

export default function ImageSelectModal({ onClose, onSelect, title = 'Chọn hình ảnh' }: ImageSelectModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select')
  
  // Select image state
  const [images, setImages] = useState<Image[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Upload image state
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileAlts, setFileAlts] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch images for select tab
  useEffect(() => {
    if (activeTab === 'select') {
      fetchImages()
    }
  }, [activeTab, pagination.page, search])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/images?${params}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchImages()
  }

  const handleSelectImage = (image: Image) => {
    onSelect(image)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Upload image functions
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

    // Validate file sizes (max 10MB)
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
      
      // Reset upload state
      setSelectedFiles([])
      setPreviews([])
      setFileTitles([])
      setFileAlts([])
      
      // Switch back to select tab and refresh images
      setActiveTab('select')
      fetchImages()
      
      alert(`Đã upload ${selectedFiles.length} ảnh thành công`)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:max-h-[80vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {title}
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

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('select')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'select'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chọn ảnh có sẵn
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload ảnh mới
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:px-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'select' ? (
              <>
                {/* Search */}
                <div className="mb-4">
                  <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tìm kiếm hình ảnh..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Tìm kiếm
                    </button>
                  </form>
                </div>

                {/* Images Grid */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                            onClick={() => handleSelectImage(image)}
                          >
                            {/* Image */}
                            <div className="relative w-full h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>

                            {/* Info */}
                            <div className="p-3">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {image.title || image.originalName}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(image.size)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có hình ảnh nào</p>
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Trước
                          </button>
                          
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, page }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Sau
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Upload Tab Content */
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
                    Hỗ trợ: PNG, JPG, GIF, WebP • Tối đa 10MB mỗi file
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
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 sm:px-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Đóng
              </button>
              {activeTab === 'upload' && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}