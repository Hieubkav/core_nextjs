'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import ImageUploadModal from '../../../components/admin/ImageUploadModal'
import ImageEditModal from '../../../components/admin/ImageEditModal'
import DeleteConfirmModal from '../../../components/admin/DeleteConfirmModal'

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

export default function AdminImages() {
  const [images, setImages] = useState<Image[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [deletingImage, setDeletingImage] = useState<Image | null>(null)

  useEffect(() => {
    fetchImages()
  }, [pagination.page, search])

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



  const handleEdit = (image: Image) => {
    setEditingImage(image)
    setShowEditModal(true)
  }

  const handleDelete = (image: Image) => {
    setDeletingImage(image)
    setShowDeleteModal(true)
  }

  const handleUploadSuccess = () => {
    fetchImages()
    setShowUploadModal(false)
  }

  const handleEditSuccess = () => {
    fetchImages()
    setShowEditModal(false)
    setEditingImage(null)
  }

  const handleDeleteSuccess = () => {
    fetchImages()
    setShowDeleteModal(false)
    setDeletingImage(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý hình ảnh</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý thư viện hình ảnh của website
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tải lên hình ảnh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="p-2 flex gap-2 justify-end bg-gray-50">
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title="Mở ảnh ở trang mới"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleEdit(image)}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Chỉnh sửa ảnh"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(image)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Xóa ảnh"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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

      {/* Modals */}
      {showUploadModal && (
        <ImageUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showEditModal && editingImage && (
        <ImageEditModal
          image={editingImage}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && deletingImage && (
        <DeleteConfirmModal
          title="Xóa hình ảnh"
          message={`Bạn có chắc chắn muốn xóa hình ảnh "${deletingImage.title || deletingImage.originalName}"?`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              const response = await fetch(`/api/admin/images/${deletingImage.id}`, {
                method: 'DELETE'
              })
              if (response.ok) {
                handleDeleteSuccess()
              }
            } catch (error) {
              console.error('Error deleting image:', error)
            }
          }}
        />
      )}
    </div>
  )
}
