'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useToast } from '@/components/common/ToastProvider'

interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
}

interface Product {
  id: number
  name: string
 slug: string
  variants: ProductVariant[]
}

interface ProductVariant {
  id: number
  name: string
  price: number
}

interface OrderItem {
  productId: number
  variantId: number
  quantity: number
 price: number
  productName: string
  variantName: string
}

export default function OrderCreateModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState(1) // 1: Customer info, 2: Select products, 3: Review
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  
  // Form data
  const [customerData, setCustomerData] = useState({
    existingCustomerId: '',
    name: '',
    email: '',
    phone: ''
  })
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { productId: 0, variantId: 0, quantity: 1, price: 0, productName: '', variantName: '' }
 ])
  
  const { showSuccess, showError } = useToast()

  // Load data khi mở modal
  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  // Filter customers khi search thay đổi
  useEffect(() => {
    if (searchCustomer) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchCustomer.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers([])
    }
  }, [searchCustomer, customers])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers?limit=100')
      if (response.ok) {
        const result = await response.json()
        setCustomers(result.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=100')
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerData({
      existingCustomerId: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ''
    })
    setStep(2)
  }

  const handleNewCustomer = () => {
    setCustomerData({
      existingCustomerId: '',
      name: '',
      email: '',
      phone: ''
    })
    setStep(2)
  }

  const handleAddOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: 0, variantId: 0, quantity: 1, price: 0, productName: '', variantName: '' }
    ])
  }

  const handleRemoveOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems]
      newItems.splice(index, 1)
      setOrderItems(newItems)
    }
  }

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId)
    if (product && product.variants.length > 0) {
      const firstVariant = product.variants[0]
      const newItems = [...orderItems]
      newItems[index] = {
        ...newItems[index],
        productId,
        variantId: firstVariant.id,
        price: firstVariant.price,
        productName: product.name,
        variantName: firstVariant.name
      }
      setOrderItems(newItems)
    }
  }

  const handleVariantChange = (index: number, variantId: number) => {
    const item = orderItems[index]
    const product = products.find(p => p.id === item.productId)
    if (product) {
      const variant = product.variants.find(v => v.id === variantId)
      if (variant) {
        const newItems = [...orderItems]
        newItems[index] = {
          ...newItems[index],
          variantId,
          price: variant.price,
          variantName: variant.name
        }
        setOrderItems(newItems)
      }
    }
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...orderItems]
    newItems[index] = {
      ...newItems[index],
      quantity: Math.max(1, quantity)
    }
    setOrderItems(newItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const validateStep1 = () => {
    if (customerData.existingCustomerId) return true
    
    if (!customerData.name.trim()) {
      showError('Lỗi', 'Vui lòng nhập tên khách hàng')
      return false
    }
    
    if (!customerData.email.trim()) {
      showError('Lỗi', 'Vui lòng nhập email khách hàng')
      return false
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerData.email)) {
      showError('Lỗi', 'Email không hợp lệ')
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i]
      if (!item.productId || !item.variantId) {
        showError('Lỗi', `Vui lòng chọn sản phẩm và biến thể cho mục ${i + 1}`)
        return false
      }
      if (item.quantity <= 0) {
        showError('Lỗi', `Số lượng cho mục ${i + 1} phải lớn hơn 0`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep1()) return
    if (!validateStep2()) return

    setLoading(true)
    try {
      // Chuẩn bị dữ liệu gửi đi
      const orderData = {
        customerData: {
          existingCustomerId: customerData.existingCustomerId || null,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || null
        },
        items: orderItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          variantName: item.variantName
        })),
        totalAmount: calculateTotal()
      }

      const response = await fetch('/api/admin/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        showSuccess('Thành công', 'Đơn hàng đã được tạo thành công')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        showError('Lỗi', error.error || 'Không thể tạo đơn hàng')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      showError('Lỗi', 'Có lỗi xảy ra khi tạo đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Tạo đơn hàng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                1
              </div>
              <span className="ml-2">Thông tin khách hàng</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                2
              </div>
              <span className="ml-2">Chọn sản phẩm</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="ml-2">Xác nhận</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
                
                {/* Search existing customer */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm khách hàng đã có
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tìm theo tên hoặc email..."
                    />
                    {filteredCustomers.length > 0 && searchCustomer && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md">
                        {filteredCustomers.map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleNewCustomer}
                    className="mt-2 text-sm text-blue-60 hover:text-blue-800"
                  >
                    Tạo khách hàng mới
                  </button>
                </div>
                
                {/* Customer form (if creating new) */}
                {!customerData.existingCustomerId && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên khách hàng *
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên khách hàng"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập email khách hàng"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Select Products */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn sản phẩm</h3>
                
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Sản phẩm #{index + 1}</h4>
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOrderItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sản phẩm *
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="0">Chọn sản phẩm</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Biến thể *
                          </label>
                          <select
                            value={item.variantId}
                            onChange={(e) => handleVariantChange(index, parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!item.productId}
                          >
                            <option value="0">Chọn biến thể</option>
                            {item.productId ? (
                              products.find(p => p.id === item.productId)?.variants.map(variant => (
                                <option key={variant.id} value={variant.id}>
                                  {variant.name} - {variant.price.toLocaleString('vi-VN')}đ
                                </option>
                              ))
                            ) : null}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddOrderItem}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận thông tin</h3>
                
                {/* Customer Info */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tên</label>
                      <p className="mt-1 text-sm text-gray-90">{customerData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{customerData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Số điện thoại</label>
                      <p className="mt-1 text-sm text-gray-900">{customerData.phone || 'Không có'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="border border-gray-20 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sản phẩm trong đơn hàng</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              <div>{item.productName}</div>
                              <div className="text-gray-500">{item.variantName}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.price.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Tổng cộng:</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {calculateTotal().toLocaleString('vi-VN')}đ
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Hủy
          </button>
          
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Quay lại
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}