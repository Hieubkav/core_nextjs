'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ReviewCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewCreateModal({ onClose, onSuccess }: ReviewCreateModalProps) {
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<{id: number, name: string}[]>([])
  const [customers, setCustomers] = useState<{id: number, name: string, email: string}[]>([])
  const [filteredProducts, setFilteredProducts] = useState<{id: number, name: string}[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<{id: number, name: string, email: string}[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [productPage, setProductPage] = useState(1)
  const [customerPage, setCustomerPage] = useState(1)
  const [productTotalPages, setProductTotalPages] = useState(1)
  const [customerTotalPages, setCustomerTotalPages] = useState(1)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    rating: 5,
    title: '',
    content: '',
    sortOrder: 0,
    isVisible: true
  })

  // NEW: refs for dropdown containers
  const customerBoxRef = useRef<HTMLDivElement>(null);
  const productBoxRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async (page: number = 1, search: string = '') => {
    setLoadingProducts(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (search) {
          // For search, replace the filtered list
          setFilteredProducts(data.data || [])
        } else {
          // For pagination, append to existing list
          if (page === 1) {
            setProducts(data.data || [])
            setFilteredProducts(data.data || [])
          } else {
            setProducts(prev => [...prev, ...(data.data || [])])
            setFilteredProducts(prev => [...prev, ...(data.data || [])])
          }
        }
        setProductTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCustomers = async (page: number = 1, search: string = '') => {
    setLoadingCustomers(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (search) {
          // For search, replace the filtered list
          setFilteredCustomers(data.customers || [])
        } else {
          // For pagination, append to existing list
          if (page === 1) {
            setCustomers(data.customers || [])
            setFilteredCustomers(data.customers || [])
          } else {
            setCustomers(prev => [...prev, ...(data.customers || [])])
            setFilteredCustomers(prev => [...prev, ...(data.customers || [])])
          }
        }
        setCustomerTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  useEffect(() => {
    // Fetch initial products and customers
    fetchProducts(1)
    fetchCustomers(1)
  }, [])

  // Set default search values when customers/products change
  useEffect(() => {
    if (formData.customerId) {
      const customer = customers.find(c => c.id.toString() === formData.customerId)
      if (customer) {
        setSearchCustomer(customer.name || customer.email)
      }
    }
    
    if (formData.productId) {
      const product = products.find(p => p.id.toString() === formData.productId)
      if (product) {
        setSearchProduct(product.name)
      }
    }
  }, [customers, products, formData.customerId, formData.productId])

  useEffect(() => {
    // Fetch products when search changes
    const debounceTimer = setTimeout(() => {
      if (searchProduct) {
        fetchProducts(1, searchProduct)
        setProductPage(1)
      } else {
        setFilteredProducts(products)
        setProductPage(1)
        setProductTotalPages(Math.ceil(products.length / 5))
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchProduct, products])

  useEffect(() => {
    // Fetch customers when search changes
    const debounceTimer = setTimeout(() => {
      if (searchCustomer) {
        fetchCustomers(1, searchCustomer)
        setCustomerPage(1)
      } else {
        setFilteredCustomers(customers)
        setCustomerPage(1)
        setCustomerTotalPages(Math.ceil(customers.length / 5))
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchCustomer, customers])

  // GỘP click outside thành 1 hook, kiểm tra trên container ref
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (customerBoxRef.current && !customerBoxRef.current.contains(t)) {
        setShowCustomerDropdown(false);
      }
      if (productBoxRef.current && !productBoxRef.current.contains(t)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNextProductPage = () => {
    if (productPage < productTotalPages) {
      const nextPage = productPage + 1
      setProductPage(nextPage)
      if (searchProduct) {
        fetchProducts(nextPage, searchProduct)
      } else {
        fetchProducts(nextPage)
      }
    }
  }

  const handlePrevProductPage = () => {
    if (productPage > 1) {
      const prevPage = productPage - 1
      setProductPage(prevPage)
      if (searchProduct) {
        fetchProducts(prevPage, searchProduct)
      } else {
        fetchProducts(prevPage)
      }
    }
  }

  const handleNextCustomerPage = () => {
    if (customerPage < customerTotalPages) {
      const nextPage = customerPage + 1
      setCustomerPage(nextPage)
      if (searchCustomer) {
        fetchCustomers(nextPage, searchCustomer)
      } else {
        fetchCustomers(nextPage)
      }
    }
  }

  const handlePrevCustomerPage = () => {
    if (customerPage > 1) {
      const prevPage = customerPage - 1
      setCustomerPage(prevPage)
      if (searchCustomer) {
        fetchCustomers(prevPage, searchCustomer)
      } else {
        fetchCustomers(prevPage)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
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
      console.error('Error creating review:', error)
      alert('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[500px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Thêm đánh giá mới
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
              {/* Khách hàng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng <span className="text-red-500">*</span>
                </label>
                {/* NEW: ref vào container, KHÔNG đặt id lên input */}
                <div ref={customerBoxRef} className="relative">
                  <input
                    type="text"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-hidden">
                      {loadingCustomers ? (
                        <div className="px-3 py-2 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      ) : filteredCustomers.length > 0 ? (
                        <>
                          {filteredCustomers.slice(0, 5).map(customer => (
                            <div
                              key={customer.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              // Dùng onMouseDown để chắc chắn set trước khi dropdown có thể đóng
                              onMouseDown={() => {
                                setFormData(prev => ({ ...prev, customerId: String(customer.id) }));
                                setSearchCustomer(customer.name || customer.email);
                                setShowCustomerDropdown(false);
                              }}
                            >
                              {customer.name || customer.email} ({customer.email})
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 bg-gray-50 border-t">
                            <button
                              type="button"               // NEW
                              onClick={handlePrevCustomerPage}
                              disabled={customerPage === 1}
                              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="text-sm">{customerPage} / {customerTotalPages}</span>
                            <button
                              type="button"               // NEW
                              onClick={handleNextCustomerPage}
                              disabled={customerPage === customerTotalPages}
                              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="px-3 py-2 text-gray-500">Không tìm thấy khách hàng</div>
                      )}
                    </div>
                  )}
                </div>

                {formData.customerId && (
                  <div className="mt-2 px-3 py-2 bg-gray-100 rounded-md">
                    {(() => {
                      const customer = customers.find(c => c.id.toString() === formData.customerId)
                      return customer ? `${customer.name || customer.email} (${customer.email})` : ''
                    })()}
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => setFormData(prev => ({ ...prev, customerId: '' }))}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sản phẩm <span className="text-red-500">*</span>
                </label>
                {/* NEW: ref vào container */}
                <div ref={productBoxRef} className="relative">
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showProductDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-hidden">
                      {loadingProducts ? (
                        <div className="px-3 py-2 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      ) : filteredProducts.length > 0 ? (
                        <>
                          {filteredProducts.slice(0, 5).map(product => (
                            <div
                              key={product.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onMouseDown={() => {
                                setFormData(prev => ({ ...prev, productId: String(product.id) }));
                                setSearchProduct(product.name);
                                setShowProductDropdown(false);
                              }}
                            >
                              {product.name}
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 bg-gray-50 border-t">
                            <button type="button" onClick={handlePrevProductPage} disabled={productPage === 1}
                              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">
                              Prev
                            </button>
                            <span className="text-sm">{productPage} / {productTotalPages}</span>
                            <button type="button" onClick={handleNextProductPage} disabled={productPage === productTotalPages}
                              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">
                              Next
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="px-3 py-2 text-gray-500">Không tìm thấy sản phẩm</div>
                      )}
                    </div>
                  )}
                </div>

                {formData.productId && (
                  <div className="mt-2 px-3 py-2 bg-gray-100 rounded-md">
                    {(() => {
                      const product = products.find(p => p.id.toString() === formData.productId)
                      return product ? product.name : ''
                    })()}
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => setFormData(prev => ({ ...prev, productId: '' }))}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đánh giá <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tiêu đề đánh giá"
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung đánh giá..."
                />
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Hiển thị đánh giá này trên website
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
                disabled={saving || !formData.customerId || !formData.productId}
                className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Tạo đánh giá'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}