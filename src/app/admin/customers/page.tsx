'use client'

import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useToast } from '@/components/common/ToastProvider'

interface Customer {
  id: number
  name: string | null
  email: string
  password: string | null
  sdt: string | null
  diaChi: string | null
  ghiChu: string | null
  isActive: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminCustomers() {
  const { showError, showSuccess } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Bulk selection
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  
  // Form tạo khách hàng mới
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    password: '',
    sdt: '',
    diaChi: '',
    ghiChu: ''
  })
  
  // Form chỉnh sửa khách hàng
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [updatingCustomer, setUpdatingCustomer] = useState(false)
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    email: '',
    password: '',
    sdt: '',
    diaChi: '',
    ghiChu: '',
    isActive: true
  })

  useEffect(() => {
    console.log('Fetching customers...')
    fetchCustomers()
  }, [pagination.page, search])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Customers data:', data)
        setCustomers(data.customers || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCustomers()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingCustomer(true)
    
    try {
      const response = await fetch('/api/admin/customers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          password: newCustomer.password || null,
          sdt: newCustomer.sdt || null,
          diaChi: newCustomer.diaChi || null,
          ghiChu: newCustomer.ghiChu || null
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Reset form
        setNewCustomer({
          name: '',
          email: '',
          password: '',
          sdt: '',
          diaChi: '',
          ghiChu: ''
        })
        setShowCreateModal(false)
        fetchCustomers() // Refresh customer list
        showSuccess('Thành công', 'Khách hàng đã được tạo thành công')
      } else {
        const error = await response.json()
        showError('Lỗi', error.error || 'Không thể tạo khách hàng')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      showError('Lỗi', 'Có lỗi xảy ra khi tạo khách hàng')
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditCustomer({
      name: customer.name || '',
      email: customer.email,
      password: customer.password || '',
      sdt: customer.sdt || '',
      diaChi: customer.diaChi || '',
      ghiChu: customer.ghiChu || '',
      isActive: customer.isActive !== null ? customer.isActive : true
    })
    setShowEditModal(true)
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingCustomer(true)
    
    if (!editingCustomer) return
    
    try {
      const response = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editCustomer.name,
          email: editCustomer.email,
          password: editCustomer.password || null,
          sdt: editCustomer.sdt || null,
          diaChi: editCustomer.diaChi || null,
          ghiChu: editCustomer.ghiChu || null,
          isActive: editCustomer.isActive
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setShowEditModal(false)
        fetchCustomers() // Refresh customer list
        showSuccess('Thành công', 'Khách hàng đã được cập nhật thành công')
      } else {
        const error = await response.json()
        showError('Lỗi', error.error || 'Không thể cập nhật khách hàng')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      showError('Lỗi', 'Có lỗi xảy ra khi cập nhật khách hàng')
    } finally {
      setUpdatingCustomer(false)
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCustomers() // Refresh customer list
        showSuccess('Thành công', 'Khách hàng đã được xóa thành công')
      } else {
        const error = await response.json()
        showError('Lỗi', error.error || 'Không thể xóa khách hàng')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      showError('Lỗi', 'Có lỗi xảy ra khi xóa khách hàng')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      showError('Lỗi', 'Vui lòng chọn ít nhất một khách hàng để xóa')
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedCustomers.length} khách hàng đã chọn không?`)) {
      return
    }
    
    try {
      const response = await fetch('/api/admin/customers/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerIds: selectedCustomers }),
      })

      if (response.ok) {
        setSelectedCustomers([])
        fetchCustomers() // Refresh customer list
        showSuccess('Thành công', `${selectedCustomers.length} khách hàng đã được xóa thành công`)
      } else {
        const error = await response.json()
        showError('Lỗi', error.error || 'Không thể xóa khách hàng')
      }
    } catch (error) {
      console.error('Error bulk deleting customers:', error)
      showError('Lỗi', 'Có lỗi xảy ra khi xóa khách hàng')
    }
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(customer => customer.id))
    }
  }

  const handleSelectCustomer = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId))
    } else {
      setSelectedCustomers([...selectedCustomers, customerId])
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý danh sách khách hàng của website
            </p>
          </div>
          <div className="flex space-x-2">
            {selectedCustomers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Xóa {selectedCustomers.length} khách hàng
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Thêm khách hàng
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
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
                placeholder="Tìm kiếm khách hàng..."
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

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {customers.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === customers.length && customers.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số điện thoại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => {
                      console.log('Rendering customer:', customer)
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleSelectCustomer(customer.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name || 'Chưa có tên'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.sdt || 'Chưa có'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.diaChi || 'Chưa có'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-10 text-red-800'
                            }`}>
                              {customer.isActive ? 'Hoạt động' : 'Vô hiệu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có khách hàng nào</p>
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

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Thêm khách hàng mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email khách hàng"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="text"
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={newCustomer.sdt}
                    onChange={(e) => setNewCustomer({...newCustomer, sdt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={newCustomer.diaChi}
                    onChange={(e) => setNewCustomer({...newCustomer, diaChi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={newCustomer.ghiChu}
                    onChange={(e) => setNewCustomer({...newCustomer, ghiChu: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {creatingCustomer ? 'Đang tạo...' : 'Tạo khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa khách hàng</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateCustomer}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-50"
                    placeholder="Nhập tên khách hàng"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email khách hàng"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="text"
                    value={editCustomer.password}
                    onChange={(e) => setEditCustomer({...editCustomer, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu (để trống nếu không thay đổi)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={editCustomer.sdt}
                    onChange={(e) => setEditCustomer({...editCustomer, sdt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editCustomer.diaChi}
                    onChange={(e) => setEditCustomer({...editCustomer, diaChi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={editCustomer.ghiChu}
                    onChange={(e) => setEditCustomer({...editCustomer, ghiChu: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editCustomer.isActive}
                    onChange={(e) => setEditCustomer({...editCustomer, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Kích hoạt tài khoản
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updatingCustomer ? 'Đang cập nhật...' : 'Cập nhật khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}