# 🚀 Supabase Integration Guide

## 📋 Tổng quan

Dự án NextJS Core Template đã được nâng cấp với **Supabase integration** hoàn chỉnh. Chỉ cần điền environment variables là có thể sử dụng ngay!

## ✨ Tính năng đã tích hợp

### 🔧 **Core Features**
- ✅ **Supabase Client** với type safety
- ✅ **CRUD Hooks** (useCrud) cho mọi table
- ✅ **Form Validation** với React Hook Form + Zod
- ✅ **File Upload** với drag & drop, progress bar
- ✅ **Toast Notifications** system
- ✅ **Loading States** và Skeleton components
- ✅ **Error Handling** comprehensive

### 📊 **Database Schema**
Đã định nghĩa sẵn các table:
- `users` - Quản lý người dùng
- `products` - Quản lý sản phẩm  
- `categories` - Danh mục sản phẩm
- `orders` & `order_items` - Đơn hàng
- `settings` - Cài đặt hệ thống

## 🚀 Quick Start

### 1. **Setup Supabase Project**

```bash
# 1. Tạo project tại https://app.supabase.com
# 2. Copy project URL và anon key
# 3. Tạo .env.local từ .env.example
```

### 2. **Environment Variables**

```bash
# Copy file example
cp .env.example .env.local

# Điền thông tin Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. **Database Setup**

```sql
-- Tạo table users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo table products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category_id UUID,
  image_url TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho public access (demo)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);
```

### 4. **Start Development**

```bash
pnpm dev
# Truy cập http://localhost:3000/demo để xem demo
```

## 📚 Cách sử dụng

### 🔄 **CRUD Operations**

```tsx
import { useCrud } from '@/hooks/useCrud';

function UsersList() {
  const { data, loading, create, update, remove, fetchAll } = useCrud('users');
  
  // Fetch data
  useEffect(() => {
    fetchAll({ limit: 10, orderBy: { column: 'created_at', ascending: false } });
  }, []);
  
  // Create new user
  const handleCreate = async () => {
    await create({
      email: 'user@example.com',
      full_name: 'John Doe',
      role: 'user'
    });
  };
  
  // Update user
  const handleUpdate = async (id: string) => {
    await update(id, { full_name: 'Jane Doe' });
  };
  
  // Delete user
  const handleDelete = async (id: string) => {
    await remove(id);
  };
  
  return (
    <div>
      {loading ? <Skeleton /> : (
        <ul>
          {data.map(user => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 📝 **Form Validation**

```tsx
import { useContactForm } from '@/hooks/useForm';

function ContactForm() {
  const form = useContactForm();
  
  const handleSubmit = form.submitWithToast(
    async (data) => {
      // API call
      await submitContact(data);
    },
    {
      loadingMessage: 'Đang gửi...',
      successMessage: 'Gửi thành công!',
    }
  );
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input {...form.register('name')} placeholder="Họ tên" />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      
      <button type="submit">Gửi</button>
    </form>
  );
}
```

### 📁 **File Upload**

```tsx
import { FileUpload } from '@/components/ui/FileUpload';

function ImageUpload() {
  return (
    <FileUpload
      bucket="images"
      folder="products"
      maxSizeInMB={5}
      allowedTypes={['image/jpeg', 'image/png']}
      onUploadSuccess={(result) => {
        console.log('Uploaded:', result.url);
      }}
    />
  );
}
```

### 🔔 **Toast Notifications**

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { success, error, loading } = useToast();
  
  const handleAction = async () => {
    const toastId = loading('Đang xử lý...');
    
    try {
      await someAsyncAction();
      success('Thành công!');
    } catch (err) {
      error('Lỗi', err.message);
    }
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

## 🎯 **Best Practices**

### 1. **Type Safety**
```tsx
import { User, Product } from '@/lib/supabase';

// Sử dụng types đã định nghĩa
const user: User = await usersCrud.fetchById('user-id');
```

### 2. **Error Handling**
```tsx
// Tự động hiển thị toast error
await usersCrud.create(userData); // Auto toast on error

// Tắt toast tự động
await usersCrud.create(userData, { showToast: false });
```

### 3. **Loading States**
```tsx
import { LoadingButton, Skeleton } from '@/components/ui';

// Button với loading
<LoadingButton loading={isSubmitting}>Submit</LoadingButton>

// Skeleton cho loading data
{loading ? <Skeleton /> : <DataComponent />}
```

## 🔧 **Customization**

### **Thêm Table mới**
1. Cập nhật `Database` interface trong `src/lib/supabase.ts`
2. Tạo validation schema trong `src/lib/validations.ts`
3. Sử dụng `useCrud('your_table')` hook

### **Custom Form Hook**
```tsx
export const useProductForm = () => {
  const schema = z.object({
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    price: z.number().min(0, 'Giá phải >= 0'),
  });
  
  return useForm(schema, {
    defaultValues: { name: '', price: 0 },
    successMessage: 'Lưu sản phẩm thành công!',
  });
};
```

## 🚀 **Production Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### **Environment Variables for Production**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📖 **Demo & Examples**

Truy cập `/demo` để xem:
- ✅ CRUD operations với Users & Products
- ✅ Form validation real-time
- ✅ File upload với preview
- ✅ Toast notifications
- ✅ Loading states & skeletons

## 🆘 **Troubleshooting**

### **Lỗi thường gặp:**

1. **"Supabase client not configured"**
   - Kiểm tra `.env.local` có đúng format không
   - Restart development server

2. **"Table doesn't exist"**
   - Tạo table trong Supabase dashboard
   - Enable RLS và tạo policies

3. **"Upload failed"**
   - Tạo bucket trong Supabase Storage
   - Set bucket public nếu cần

## 🎉 **Kết luận**

Dự án đã sẵn sàng cho production với:
- ⚡ **Performance**: Optimized hooks & components
- 🔒 **Security**: Type-safe với comprehensive error handling  
- 🎨 **UX**: Loading states, toast notifications, form validation
- 🚀 **Scalability**: Modular architecture, easy to extend

**Chỉ cần điền env và bắt đầu code! 🚀**
