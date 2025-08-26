-- ============================================================================
-- SIMPLE SUPABASE SCHEMA - NO RLS, NO PERMISSIONS
-- ============================================================================
-- Copy paste vào SQL Editor và chạy

-- 1. Bảng USERS (người dùng)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng CATEGORIES (danh mục)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng PRODUCTS (sản phẩm)
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

-- 4. Bảng ORDERS (đơn hàng)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng ORDER_ITEMS (chi tiết đơn hàng)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID,
  product_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bảng SETTINGS (cài đặt)
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT,
  site_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- THÊM DỮ LIỆU MẪU
-- ============================================================================

-- Data mẫu cho USERS
INSERT INTO users (email, full_name, role) VALUES 
('admin@example.com', 'Admin User', 'admin'),
('user@example.com', 'Regular User', 'user'),
('test@example.com', 'Test User', 'user'),
('john@example.com', 'John Doe', 'user'),
('jane@example.com', 'Jane Smith', 'user');

-- Data mẫu cho CATEGORIES
INSERT INTO categories (name, description, sort_order) VALUES 
('Electronics', 'Thiết bị điện tử', 1),
('Clothing', 'Thời trang', 2),
('Books', 'Sách và giáo dục', 3),
('Home & Garden', 'Nhà cửa và vườn', 4),
('Sports', 'Thể thao', 5);

-- Data mẫu cho PRODUCTS
INSERT INTO products (name, description, price, stock_quantity) VALUES 
('iPhone 15 Pro', 'Điện thoại iPhone mới nhất', 999.99, 50),
('MacBook Pro M3', 'Laptop chuyên nghiệp', 1999.99, 25),
('AirPods Pro', 'Tai nghe không dây', 249.99, 100),
('iPad Air', 'Máy tính bảng', 599.99, 75),
('Apple Watch', 'Đồng hồ thông minh', 399.99, 80),
('Áo thun Nike', 'Áo thun thể thao', 29.99, 200),
('Quần jeans Levi''s', 'Quần jeans classic', 79.99, 150),
('Giày sneaker Adidas', 'Giày thể thao', 89.99, 120),
('Sách lập trình', 'Học lập trình từ cơ bản', 39.99, 300),
('Laptop Dell', 'Laptop văn phòng', 699.99, 40);

-- Data mẫu cho SETTINGS
INSERT INTO settings (site_name, site_description, contact_email, contact_phone) VALUES 
('NextJS Core Shop', 'Website bán hàng với NextJS và Supabase', 'contact@example.com', '0123456789');

-- ============================================================================
-- HOÀN THÀNH
-- ============================================================================

SELECT 'Tạo database thành công! 🎉 Có ' || 
  (SELECT COUNT(*) FROM users) || ' users, ' ||
  (SELECT COUNT(*) FROM products) || ' products, ' ||
  (SELECT COUNT(*) FROM categories) || ' categories' as result;
