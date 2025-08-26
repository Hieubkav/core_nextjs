'use client';

import React, { useState, useEffect } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { useContactForm } from '@/hooks/useForm';
import { FileUpload } from '@/components/ui/FileUpload';
import { LoadingButton, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { isSupabaseConfigured } from '@/lib/supabase';
import { User, Product } from '@/lib/supabase';

export const SupabaseDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'form' | 'upload'>('users');
  const { success, error, info } = useToast();
  
  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  // CRUD hooks
  const usersCrud = useCrud('users');
  const productsCrud = useCrud('products');

  // Form hook
  const contactForm = useContactForm();

  // Load data on mount
  useEffect(() => {
    if (supabaseConfigured) {
      usersCrud.fetchAll({ limit: 10 });
      productsCrud.fetchAll({ limit: 10 });
    }
  }, [supabaseConfigured]);

  // Handle form submission
  const handleContactSubmit = contactForm.submitWithToast(
    async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contact form data:', data);
    },
    {
      loadingMessage: 'Đang gửi liên hệ...',
      successMessage: 'Gửi liên hệ thành công!',
      errorMessage: 'Lỗi gửi liên hệ',
    }
  );

  // Handle file upload
  const handleFileUpload = (result: any) => {
    success(`Upload thành công: ${result.path}`);
  };

  // Handle create user
  const handleCreateUser = async () => {
    const newUser = {
      email: `user${Date.now()}@example.com`,
      full_name: `User ${Date.now()}`,
      role: 'user' as const,
    };
    
    await usersCrud.create(newUser);
  };

  // Handle create product
  const handleCreateProduct = async () => {
    const newProduct = {
      name: `Product ${Date.now()}`,
      description: 'Demo product description',
      price: Math.floor(Math.random() * 1000) + 100,
      stock_quantity: Math.floor(Math.random() * 100) + 1,
    };
    
    await productsCrud.create(newProduct);
  };

  if (!supabaseConfigured) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Supabase chưa được cấu hình
          </h2>
          <p className="text-yellow-700 mb-4">
            Để sử dụng demo này, bạn cần cấu hình Supabase:
          </p>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Tạo project tại <a href="https://app.supabase.com" className="underline">app.supabase.com</a></li>
            <li>Copy file <code>.env.example</code> thành <code>.env.local</code></li>
            <li>Điền <code>NEXT_PUBLIC_SUPABASE_URL</code> và <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            <li>Restart development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 NextJS Core Template Demo
        </h1>
        <p className="text-gray-600">
          Demo các tính năng: Supabase CRUD, Form Validation, File Upload, Toast Notifications
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: '👥 Users CRUD' },
            { id: 'products', label: '📦 Products CRUD' },
            { id: 'form', label: '📝 Form Validation' },
            { id: 'upload', label: '📁 File Upload' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Users CRUD Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Users Management</h2>
              <LoadingButton
                onClick={handleCreateUser}
                loading={usersCrud.loading}
                loadingText="Đang tạo..."
              >
                Tạo User Mới
              </LoadingButton>
            </div>
            
            {usersCrud.loading && usersCrud.data.length === 0 ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersCrud.data.map((user: User) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Products CRUD Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Products Management</h2>
              <LoadingButton
                onClick={handleCreateProduct}
                loading={productsCrud.loading}
                loadingText="Đang tạo..."
              >
                Tạo Product Mới
              </LoadingButton>
            </div>
            
            {productsCrud.loading && productsCrud.data.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsCrud.data.map((product: Product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-sm text-gray-500">
                        Kho: {product.stock_quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Validation Tab */}
        {activeTab === 'form' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Contact Form với Validation</h2>
            <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên *
                </label>
                <input
                  {...contactForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên"
                />
                {contactForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {contactForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...contactForm.register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email"
                />
                {contactForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {contactForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề *
                </label>
                <input
                  {...contactForm.register('subject')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề"
                />
                {contactForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {contactForm.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tin nhắn *
                </label>
                <textarea
                  {...contactForm.register('message')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tin nhắn"
                />
                {contactForm.formState.errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {contactForm.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...contactForm.register('privacy_agreed')}
                  type="checkbox"
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Tôi đồng ý với chính sách bảo mật *
                </label>
              </div>
              {contactForm.formState.errors.privacy_agreed && (
                <p className="text-red-500 text-sm">
                  {contactForm.formState.errors.privacy_agreed.message}
                </p>
              )}

              <LoadingButton
                type="submit"
                loading={contactForm.formState.isSubmitting}
                loadingText="Đang gửi..."
                className="w-full"
              >
                Gửi liên hệ
              </LoadingButton>
            </form>
          </div>
        )}

        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">File Upload Demo</h2>
            <FileUpload
              bucket="demo-uploads"
              folder="test"
              maxSizeInMB={5}
              allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
              onUploadSuccess={handleFileUpload}
              onUploadError={(error) => error('Upload failed', error)}
              placeholder="Kéo thả hình ảnh vào đây hoặc click để chọn"
            />
          </div>
        )}
      </div>

      {/* Toast Demo Buttons */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Toast Notifications Demo</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => success('Thành công!')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Success Toast
          </button>
          <button
            onClick={() => error('Lỗi!', 'Đây là thông báo lỗi')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Error Toast
          </button>
          <button
            onClick={() => info('Thông tin quan trọng')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Info Toast
          </button>
        </div>
      </div>
    </div>
  );
};
