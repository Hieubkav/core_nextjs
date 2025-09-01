import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useToast } from '@/components/common/ToastProvider'
import QuickImageUpload from '@/components/common/QuickImageUpload'

interface Category {
  id: number
  name: string
  slug: string
}

interface LibraryImage {
  id: number
  url: string
  alt: string
  title: string
  filename: string
}

interface ProductVariant {
  id?: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  isDefault: boolean
  isVisible: boolean
  sortOrder: number
  // Thêm fields cho validation
  priceInput?: string
  priceValid?: boolean
  priceError?: string
  originalPriceInput?: string
  originalPriceValid?: boolean
  originalPriceError?: string
}

interface ProductCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ProductCreateModal({ isOpen, onClose, onSuccess }: ProductCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<LibraryImage[]>([])
  const [showImageSelector, setShowImageSelector] = useState(false)
  const { showSuccess, showError, showWarning } = useToast()

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    categoryId: '',
    isVisible: true,
    isPublished: false,
    status: 'active', // active, inactive, sold_out
    sortOrder: 0
  })

  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      name: 'Mặc định',
      description: '',
      price: 0,
      originalPrice: 0,
      
      isDefault: true,
      isVisible: true,
      sortOrder: 0,
      priceInput: '',
      priceValid: true,
      priceError: '',
      originalPriceInput: '',
      originalPriceValid: true,
      originalPriceError: ''
    }
  ])
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      fetchImages()
    }
  }, [isOpen])

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDesc: '',
        categoryId: '',
        isVisible: true,
        isPublished: false,
        status: 'active',
        sortOrder: 0
      })
      setVariants([
        {
          name: 'Mặc định',
          description: '',
          price: 0,
          originalPrice: 0,
          
          isDefault: true,
          isVisible: true,
          sortOrder: 0,
          priceInput: '',
          priceValid: true,
          priceError: '',
          originalPriceInput: '',
          originalPriceValid: true,
          originalPriceError: ''
        }
      ])
      setSelectedImageIds([])
      setErrors({})
      setShowImageSelector(false)
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const result = await response.json()
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      showError('Lỗi tải dữ liệu', 'Không thể tải danh sách danh mục. Vui lòng thử lại.')
    }
  }

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/admin/images?limit=50')
      if (response.ok) {
        const result = await response.json()
        setImages(result.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      showError('Lỗi tải ảnh', 'Không thể tải danh sách hình ảnh. Vui lòng thử lại.')
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      name: `Variant ${variants.length + 1}`,
      description: '',
      price: 0,
      originalPrice: 0,
      isDefault: false,
      isVisible: true,
      sortOrder: variants.length,
      priceInput: '',
      priceValid: true,
      priceError: '',
      originalPriceInput: '',
      originalPriceValid: true,
      originalPriceError: ''
    }
    setVariants([...variants, newVariant])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    
    const newVariants = variants.filter((_, i) => i !== index)
    if (!newVariants.some(v => v.isDefault)) {
      newVariants[0].isDefault = true
    }
    setVariants(newVariants)
  }

  // Helper function để format giá tiền
  const formatPrice = (price: number) => {
    if (!price || price === 0) return ''
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const parsePrice = (value: string) => {
    // Loại bỏ dấu phay, đ và khoảng trắng
    const numericValue = value.replace(/[,đ\s]/g, '')
    return parseFloat(numericValue) || 0
  }

  const validatePriceInput = (value: string) => {
    // Kiểm tra nếu empty thì OK
    if (!value.trim()) return { isValid: true, numericValue: 0 }
    
    // Kiểm tra format number
    const cleanValue = value.replace(/[,\s]/g, '')
    const numericValue = parseFloat(cleanValue)
    
    // Kiểm tra có phải số hợp lệ không
    if (isNaN(numericValue) || numericValue < 0) {
      return { isValid: false, numericValue: 0, error: 'Giá trị không hợp lệ' }
    }
    
    return { isValid: true, numericValue }
  }

  const handlePriceInputChange = (index: number, field: 'price' | 'originalPrice', value: string) => {
    const validation = validatePriceInput(value)
    
    // Cập nhật tất cả trong một lần để tránh conflict
    const newVariants = [...variants]
    const variant = { ...newVariants[index] }
    
    // Cập nhật giá trị số
    if (field === 'originalPrice') {
      variant[field] = validation.isValid ? (validation.numericValue > 0 ? validation.numericValue : undefined) : 0
    } else {
      variant[field] = validation.isValid ? validation.numericValue : 0
    }
    
    // Cập nhật trạng thái validation
    // Update validation state with explicit keys to satisfy TS in prod builds
    const inputKey = field === 'price' ? 'priceInput' : 'originalPriceInput'
    const validKey = field === 'price' ? 'priceValid' : 'originalPriceValid'
    const errorKey = field === 'price' ? 'priceError' : 'originalPriceError'
    ;(variant as any)[inputKey] = value
    ;(variant as any)[validKey] = validation.isValid
    ;(variant as any)[errorKey] = validation.error || ''
    
    newVariants[index] = variant
    setVariants(newVariants)
  }
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    
    if (field === 'isDefault' && value === true) {
      newVariants.forEach((variant, i) => {
        if (i !== index) variant.isDefault = false
      })
    }
    
    setVariants(newVariants)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug không được để trống'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục cho sản phẩm'
    }

    // Validate variants chi tiết hơn
    let hasVariantError = false
    variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        newErrors[`variant_${index}_name`] = `Tên variant ${index + 1} không được để trống`
        hasVariantError = true
      }
      // Kiểm tra giá hợp lệ thông qua priceValid flag
      if (!variant.priceValid || variant.price <= 0) {
        newErrors[`variant_${index}_price`] = `Giá variant ${index + 1} phải là số hợp lệ và lớn hơn 0`
        hasVariantError = true
      }
      // Kiểm tra giá gốc nếu có nhập
      if (variant.originalPriceInput && !variant.originalPriceValid) {
        newErrors[`variant_${index}_originalPrice`] = `Giá gốc variant ${index + 1} không hợp lệ`
        hasVariantError = true
      }
    })

    if (!variants.some(v => v.isDefault)) {
      newErrors.variants = 'Phải có ít nhất 1 variant được đánh dấu là mặc định'
    } else if (hasVariantError) {
      newErrors.variants = 'Có lỗi trong thông tin variants, vui lòng kiểm tra lại'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Hiển thị lỗi cụ thể đầu tiên thay vì thông báo chung
      const firstError = Object.values(errors)[0]
      if (firstError) {
        showWarning('Kiểm tra thông tin', firstError)
      } else {
        showWarning('Validation lỗi', 'Vui lòng kiểm tra lại thông tin')
      }
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        variants: variants.map((variant, index) => ({
          ...variant,
          sortOrder: index
        })),
        imageIds: selectedImageIds
      }

      console.log('📤 Submitting product data:', submitData)

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      console.log('📡 Response status:', response.status, response.statusText)

      // Kiểm tra response có ok không trước khi parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP Error Response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`
        showError('Lỗi tạo sản phẩm', errorMessage)
        return
      }

      const result = await response.json()
      console.log('✅ API Response:', result)

      if (result.success) {
        showSuccess('Tạo thành công', `Sản phẩm "${formData.name}" đã được tạo thành công`)
        onSuccess()
        resetForm()
        onClose()
      } else {
        // Hiển thị lỗi cụ thể từ API
        const errorMessage = result.error || result.details || result.message || 'Có lỗi xảy ra khi tạo sản phẩm'
        console.error('❌ API Error:', errorMessage)
        showError('Lỗi tạo sản phẩm', errorMessage)
      }
    } catch (error) {
      console.error('💥 Exception creating product:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('NetworkError')) {
          showError('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.')
        } else if (error.message.includes('JSON')) {
          showError('Lỗi phản hồi', 'Server trả về dữ liệu không hợp lệ. Vui lòng thử lại sau.')
        } else {
          showError('Lỗi hệ thống', `Chi tiết: ${error.message}`)
        }
      } else {
        showError('Lỗi không xác định', 'Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại sau.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDesc: '',
      categoryId: '',
      isVisible: true,
      isPublished: false,
      status: 'active',
      sortOrder: 0
    })
    setVariants([
      {
        name: 'Mặc định',
        description: '',
        price: 0,
        originalPrice: 0,
        isDefault: true,
        isVisible: true,
        sortOrder: 0,
        priceInput: '',
        priceValid: true,
        priceError: '',
        originalPriceInput: '',
        originalPriceValid: true,
        originalPriceError: ''
      }
    ])
    setSelectedImageIds([])
    setErrors({})
  }

  const handleImageSelect = (imageId: number) => {
    setSelectedImageIds(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId)
      } else {
        return [...prev, imageId]
      }
    })
  }

  const handleQuickImageAdded = (imageId: number) => {
    // Refresh images list
    fetchImages()
    // Auto select the new image
    setSelectedImageIds(prev => [...prev, imageId])
  }

  const selectedImages = images?.filter(img => selectedImageIds.includes(img.id)) || []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tạo sản phẩm mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="san-pham-moi"
                />
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn danh mục</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.shortDesc}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDesc: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn gọn về sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Hiển thị sản phẩm</span>
              </label>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="sold_out">Hết hàng</option>
                </select>
              </div>
            </div>

            {/* Variants Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Variants sản phẩm</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Thêm variant
                </button>
              </div>

              {errors.variants && <p className="text-red-500 text-sm mb-4">{errors.variants}</p>}

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Variant #{index + 1}
                        {variant.isDefault && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Mặc định
                          </span>
                        )}
                      </h4>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên variant *
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`variant_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Tên variant"
                        />
                        {errors[`variant_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá bán *
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={variant.priceInput || ''}
                            onChange={(e) => handlePriceInputChange(index, 'price', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`variant_${index}_price`] || !variant.priceValid ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nhập giá bán"
                          />
                          {/* Hiển thị preview giá */}
                          {variant.priceInput && (
                            <div className="text-sm">
                              {variant.priceValid ? (
                                <span className="text-green-600">
                                  💰 {variant.price > 0 ? formatPrice(variant.price) : '0đ'}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  ❌ {variant.priceError}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {errors[`variant_${index}_price`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_price`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá gốc
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={variant.originalPriceInput || ''}
                            onChange={(e) => handlePriceInputChange(index, 'originalPrice', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              !variant.originalPriceValid ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nhập giá gốc (tùy chọn)"
                          />
                          {/* Hiển thị preview giá */}
                          {variant.originalPriceInput && (
                            <div className="text-sm">
                              {variant.originalPriceValid ? (
                                <span className="text-green-600">
                                  💰 {variant.originalPrice && variant.originalPrice > 0 ? formatPrice(variant.originalPrice) : '0đ'}
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  ❌ {variant.originalPriceError}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mô tả variant
                        </label>
                        <input
                          type="text"
                          value={variant.description || ''}
                          onChange={(e) => updateVariant(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mô tả chi tiết variant"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={variant.isDefault}
                          onChange={(e) => updateVariant(index, 'isDefault', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mặc định</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={variant.isVisible}
                          onChange={(e) => updateVariant(index, 'isVisible', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Hiển thị</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Hình ảnh sản phẩm</h3>
                <div className="flex space-x-2">
                  <QuickImageUpload onImageAdded={handleQuickImageAdded} />
                  <button
                    type="button"
                    onClick={() => setShowImageSelector(!showImageSelector)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    {showImageSelector ? 'Ẩn' : 'Chọn từ thư viện'}
                  </button>
                </div>
              </div>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Đã chọn ({selectedImages.length} ảnh):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map(image => (
                      <div key={image.id} className="relative group">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          width={60}
                          height={60}
                          className="w-15 h-15 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageSelect(image.id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Selector */}
              {showImageSelector && (
                <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {images?.map(image => (
                      <div
                        key={image.id}
                        onClick={() => handleImageSelect(image.id)}
                        className={`relative cursor-pointer group ${
                          selectedImageIds.includes(image.id) ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded border hover:opacity-75 transition-opacity"
                        />
                        {selectedImageIds.includes(image.id) && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}

