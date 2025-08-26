'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useCrud } from '@/hooks/useCrud';
import { useToast } from '@/hooks/useToast';
import { LoadingButton } from '@/components/ui/LoadingSpinner';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const { success, error: showError } = useToast();
  
  // Test CRUD hooks
  const usersCrud = useCrud('users');
  const productsCrud = useCrud('products');

  // Test connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setConnectionStatus('error');
          setError('Supabase chưa được cấu hình. Vui lòng kiểm tra .env.local');
          return;
        }

        // Test simple query
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (error) {
          setConnectionStatus('error');
          setError(`Database error: ${error.message}`);
        } else {
          setConnectionStatus('connected');
          success('Kết nối Supabase thành công!');
        }
      } catch (err) {
        setConnectionStatus('error');
        setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, [success]);

  // Load sample data
  const loadSampleData = async () => {
    try {
      await usersCrud.fetchAll({ limit: 5 });
      await productsCrud.fetchAll({ limit: 5 });
      success('Tải dữ liệu thành công!');
    } catch (err) {
      showError('Lỗi tải dữ liệu', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Test create user
  const testCreateUser = async () => {
    try {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        full_name: `Test User ${Date.now()}`,
        role: 'user' as const,
      };
      
      await usersCrud.create(newUser);
      success('Tạo user thành công!');
    } catch (err) {
      showError('Lỗi tạo user', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Test create product
  const testCreateProduct = async () => {
    try {
      const newProduct = {
        name: `Test Product ${Date.now()}`,
        description: 'This is a test product',
        price: Math.floor(Math.random() * 1000) + 100,
        stock_quantity: Math.floor(Math.random() * 100) + 1,
      };
      
      await productsCrud.create(newProduct);
      success('Tạo product thành công!');
    } catch (err) {
      showError('Lỗi tạo product', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Supabase Integration</h1>
      
      {/* Connection Status */}
      <div className="mb-8 p-4 rounded-lg border">
        <h2 className="text-xl font-semibold mb-3">📡 Connection Status</h2>
        
        {connectionStatus === 'checking' && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Đang kiểm tra kết nối...</span>
          </div>
        )}
        
        {connectionStatus === 'connected' && (
          <div className="flex items-center space-x-2 text-green-600">
            <span className="text-xl">✅</span>
            <span className="font-medium">Kết nối Supabase thành công!</span>
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-xl">❌</span>
              <span className="font-medium">Lỗi kết nối Supabase</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            
            {error.includes('chưa được cấu hình') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm font-medium mb-2">Hướng dẫn khắc phục:</p>
                <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
                  <li>Tạo project tại <a href="https://app.supabase.com" className="underline">app.supabase.com</a></li>
                  <li>Copy Project URL và anon key từ Settings → API</li>
                  <li>Cập nhật file .env.local với thông tin thực</li>
                  <li>Restart development server</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Actions */}
      {connectionStatus === 'connected' && (
        <div className="space-y-6">
          {/* Load Data Test */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📊 Test Load Data</h3>
            <LoadingButton
              onClick={loadSampleData}
              loading={usersCrud.loading || productsCrud.loading}
              loadingText="Đang tải..."
            >
              Load Sample Data
            </LoadingButton>
            
            {(usersCrud.data.length > 0 || productsCrud.data.length > 0) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Users */}
                {usersCrud.data.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">👥 Users ({usersCrud.data.length})</h4>
                    <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                      {usersCrud.data.slice(0, 3).map((user: any) => (
                        <div key={user.id} className="text-sm py-1">
                          {user.email} - {user.role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Products */}
                {productsCrud.data.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">📦 Products ({productsCrud.data.length})</h4>
                    <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                      {productsCrud.data.slice(0, 3).map((product: any) => (
                        <div key={product.id} className="text-sm py-1">
                          {product.name} - ${product.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CRUD Tests */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🔄 Test CRUD Operations</h3>
            <div className="flex flex-wrap gap-3">
              <LoadingButton
                onClick={testCreateUser}
                loading={usersCrud.loading}
                loadingText="Creating..."
                variant="primary"
              >
                Create Test User
              </LoadingButton>
              
              <LoadingButton
                onClick={testCreateProduct}
                loading={productsCrud.loading}
                loadingText="Creating..."
                variant="secondary"
              >
                Create Test Product
              </LoadingButton>
            </div>
          </div>

          {/* Environment Info */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">ℹ️ Environment Info</h3>
            <div className="text-sm space-y-1">
              <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</div>
              <div>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</div>
              <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🚀 Next Steps</h3>
        <p className="text-sm text-blue-700 mb-3">
          Sau khi test thành công, bạn có thể:
        </p>
        <div className="flex flex-wrap gap-2">
          <a 
            href="/demo" 
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Xem Full Demo
          </a>
          <a 
            href="/" 
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
