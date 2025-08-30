'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageSelectModal from './ImageSelectModal'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  status: string
  sortOrder: number
  isVisible: boolean
  thumbnailId: number | null
  thumbnail: {
    id: number
    url: string
    alt: string | null
  } | null
  createdAt: string
  updatedAt: string
}

interface PostEditModalProps {
  post: Post
  onClose: () => void
  onSuccess: () => void
}

// Hàm tạo slug từ chuỗi
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PostEditModal({ post, onClose, onSuccess }: PostEditModalProps) {
  const [saving, setSaving] = useState(false)
  const [showImageSelectModal, setShowImageSelectModal] = useState(false)
  const [selectedThumbnail, setSelectedThumbnail] = useState<{
    id: number
    url: string
    alt: string | null
  } | null>(post.thumbnail)
  
  const [formData, setFormData] = useState({
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    sortOrder: post.sortOrder || 0,
    isVisible: post.isVisible,
    status: post.status || 'published'
  })

  // Cập nhật slug khi tiêu đề thay đổi
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === createSlug(post.title) || prev.slug === createSlug(prev.title) ? createSlug(title) : prev.slug
    }))
  }

  // Cập nhật slug thủ công
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      slug: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thumbnailId: selectedThumbnail?.id || null
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error updating Post:', error)
      alert('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleThumbnailSelect = (image: { id: number; url: string; alt: string | null }) => {
    setSelectedThumbnail(image)
    setShowImageSelectModal(false)
  }

  const handleRemoveThumbnail = () => {
    setSelectedThumbnail(null)
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
                Chỉnh sửa bài viết
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
              {/* Post Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>ID:</strong> {post.id}</p>
                  <p><strong>Tạo lúc:</strong> {formatDate(post.createdAt)}</p>
                  <p><strong>Cập nhật:</strong> {formatDate(post.updatedAt)}</p>
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
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn (slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="duong-dan-bai-viet"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Đường dẫn thân thiện với SEO
                </p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình đại diện
                </label>
                <div className="flex items-center gap-2">
                  {selectedThumbnail ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={selectedThumbnail.url} 
                        alt={selectedThumbnail.alt || ''} 
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => setShowImageSelectModal(true)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Thay đổi
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowImageSelectModal(true)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Chọn hình ảnh
                    </button>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mô tả ngắn..."
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
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung bài viết..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="hidden">Ẩn</option>
                </select>
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
                  className="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-30 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Hiển thị bài viết này trên website
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
                disabled={saving || !formData.title.trim() || !formData.slug.trim()}
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
      {showImageSelectModal && (
        <ImageSelectModal
          onClose={() => setShowImageSelectModal(false)}
          onSelect={handleThumbnailSelect}
          title="Chọn hình đại diện"
        />
      )}
    </div>
  )
}