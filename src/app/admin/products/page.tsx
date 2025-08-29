'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import ProductCreateModal from '@/components/admin/ProductCreateModal'
import ProductEditModal from '@/components/admin/ProductEditModal'

interface Product {
  id: number
  name: string
  slug: string
  description?: string
  shortDesc?: string
  features: string[]
  categoryId: number
  sortOrder: number
  isVisible: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: number
    name: string
    slug: string
  }
  variants: ProductVariant[]
  images: ProductImage[]
  _count: {
    variants: number
    images: number
  }
}

interface ProductVariant {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  stock: number
  isDefault: boolean
  isVisible: boolean
  sortOrder: number
}

interface ProductImage {
  id: number
  sortOrder: number
  image: {
    id: number
    url: string
    alt: string
    title: string
  }
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [pagination.page, search, selectedCategory, publishedFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (publishedFilter) params.append('isPublished', publishedFilter)

      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const result = await response.json()
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchProducts()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleDelete = (product: Product) => {
    setDeletingProduct(product)
    setShowDeleteModal(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchProducts()
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setDeletingProduct(null)
    fetchProducts()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getDefaultVariant = (variants: ProductVariant[]) => {
    if (!variants || variants.length === 0) return null
    return variants.find(v => v.isDefault) || variants[0]
  }

  const renderProductGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((product) => {
          const defaultVariant = getDefaultVariant(product.variants)
          const mainImage = product.images[0]?.image

          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-square relative">
                {mainImage ? (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.isPublished ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                </div>
                
                {!product.isVisible && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Ẩn
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {product.category.name}
                </p>
                
                {/* Price */}
                {defaultVariant && (
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(defaultVariant.price)}
                    </span>
                    {defaultVariant.originalPrice && (
                      <span className="ml-1 text-xs text-gray-500 line-through">
                        {formatPrice(defaultVariant.originalPrice)}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center">
                    <PhotoIcon className="h-3 w-3 mr-1" />
                    {product._count.images}
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {product._count.variants}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 mr-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded border border-blue-200"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 ml-1 px-2 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded border border-red-200"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderProductList = () => {
    return (
      <div className="space-y-4">
        {products?.map((product) => {
          const defaultVariant = getDefaultVariant(product.variants)
          const mainImage = product.images[0]?.image

          return (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.shortDesc || product.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <TagIcon className="h-4 w-4 mr-1" />
                          {product.category.name}
                        </span>
                        <span className="flex items-center">
                          <PhotoIcon className="h-4 w-4 mr-1" />
                          {product._count.images} ảnh
                        </span>
                        <span className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {product._count.variants} variants
                        </span>
                      </div>

                      {/* Default Variant Price */}
                      {defaultVariant && (
                        <div className="mt-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatPrice(defaultVariant.price)}
                          </span>
                          {defaultVariant.originalPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatPrice(defaultVariant.originalPrice)}
                            </span>
                          )}
                          <span className="ml-2 text-sm text-gray-600">
                            ({defaultVariant.name})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Status Badges */}
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                        
                        {!product.isVisible && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Ẩn
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                          title="Xóa"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý sản phẩm và variants của cửa hàng
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium border ${
                  viewMode === 'list'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-l-md`}
                title="Hiển thị dạng danh sách"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium border-t border-r border-b ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-r-md`}
                title="Hiển thị dạng lưới"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tìm kiếm sản phẩm..."
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published Filter */}
              <div>
                <select
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="true">Đã xuất bản</option>
                  <option value="false">Nháp</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có sản phẩm</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách thêm sản phẩm đầu tiên
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Thêm sản phẩm
                    </button>
                  </div>
                </div>
              ) : (
                viewMode === 'list' ? renderProductList() : renderProductGrid()
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                trong tổng số <span className="font-medium">{pagination.total}</span> sản phẩm
              </div>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1
                  return (
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
                  )
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={!pagination.hasNext}
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
      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ProductEditModal
        isOpen={showEditModal}
        product={editingProduct}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />

      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn xóa sản phẩm "{deletingProduct.name}"? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/products/${deletingProduct.id}`, {
                      method: 'DELETE'
                    })
                    if (response.ok) {
                      handleDeleteSuccess()
                    }
                  } catch (error) {
                    console.error('Error deleting product:', error)
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}