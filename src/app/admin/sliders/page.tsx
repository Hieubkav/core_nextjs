'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import SliderCreateModal from '../../../components/admin/SliderCreateModal'
import SliderEditModal from '../../../components/admin/SliderEditModal'
import DeleteConfirmModal from '../../../components/admin/DeleteConfirmModal'

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminSliders() {
  const [sliders, setSliders] = useState<Slider[]>([])
 const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)
  const [deletingSlider, setDeletingSlider] = useState<Slider | null>(null)

  useEffect(() => {
    fetchSliders()
  }, [pagination.page, search])

  const fetchSliders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/sliders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSliders(data.sliders)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSliders()
  }

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider)
    setShowEditModal(true)
  }

  const handleDelete = (slider: Slider) => {
    setDeletingSlider(slider)
    setShowDeleteModal(true)
  }

  const handleCreateSuccess = () => {
    fetchSliders()
    setShowCreateModal(false)
  }

  const handleEditSuccess = () => {
    fetchSliders()
    setShowEditModal(false)
    setEditingSlider(null)
  }

  const handleDeleteSuccess = () => {
    fetchSliders()
    setShowDeleteModal(false)
    setDeletingSlider(null)
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sliders</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý sliders hiển thị trên trang chủ
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm slider
          </button>
        </div>

        {/* Helper: Hướng dẫn ảnh hero */}
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <div className="flex items-start gap-3">
            <PhotoIcon className="h-5 w-5 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">Gợi ý ảnh hero (slider) tối ưu cho responsive</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Kích thước khuyến nghị: <b>1920x1080</b> (16:9) hoặc <b>1920x960</b> (~2:1). Màn hình lớn có thể dùng <b>2560x1440</b>/<b>2400x1000</b> nếu ảnh đã nén tốt.</li>
                <li>Định dạng ưu tiên: <b>WebP/AVIF</b> (nhẹ), dung lượng nên <b>&lt; 500KB</b>.</li>
                <li>Thiết kế an toàn: giữ nội dung quan trọng trong <b>vùng giữa 60%</b> (hai bên sẽ dễ bị crop khi dùng cover).</li>
                <li>Không nhúng chữ vào ảnh; sử dụng tiêu đề/nút của hệ thống để đảm bảo rõ nét.</li>
              </ul>
            </div>
          </div>
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
                placeholder="Tìm kiếm slider..."
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

      {/* Sliders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {sliders.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hình ảnh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thứ tự
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sliders.map((slider) => (
                      <tr key={slider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {slider.title}
                            </div>
                            {slider.subtitle && (
                              <div className="text-sm text-gray-500">
                                {slider.subtitle}
                              </div>
                            )}
                            {slider.content && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {slider.content}
                              </div>
                            )}
                            {(slider.buttonText || slider.buttonLink) && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {slider.buttonText || 'Xem thêm'}
                                  {slider.buttonLink && `: ${slider.buttonLink}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {slider.image ? (
                            <div className="flex-shrink-0 h-16 w-24 relative">
                              <img 
                                src={slider.image.url} 
                                alt={slider.image.alt || slider.title} 
                                className="h-16 w-24 object-cover rounded-md"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-16 w-24 bg-gray-10 rounded-md">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slider.sortOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            slider.isVisible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slider.isVisible ? (
                              <>
                                <EyeIcon className="h-3 w-3 mr-1" />
                                Hiển thị
                              </>
                            ) : (
                              <>
                                <EyeSlashIcon className="h-3 w-3 mr-1" />
                                Ẩn
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(slider.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(slider)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(slider)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Xóa"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có slider nào</p>
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
      {showCreateModal && (
        <SliderCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && editingSlider && (
        <SliderEditModal
          slider={editingSlider}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && deletingSlider && (
        <DeleteConfirmModal
          title="Xóa slider"
          message={`Bạn có chắc chắn muốn xóa slider "${deletingSlider.title}"?`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              const response = await fetch(`/api/admin/sliders/${deletingSlider.id}`, {
                method: 'DELETE'
              })
              if (response.ok) {
                handleDeleteSuccess()
              } else {
                const error = await response.json()
                alert(error.error || 'Có lỗi xảy ra')
              }
            } catch (error) {
              console.error('Error deleting slider:', error)
            }
          }}
        />
      )}
    </div>
  )
}
