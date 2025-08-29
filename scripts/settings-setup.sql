-- ===========================================
-- SETTINGS MODULE SETUP SQL SCRIPT
-- ===========================================
-- Tạo bảng settings nếu chưa có và insert các settings mới
-- Groups: General, Branding, Social, Payment, SEO

-- Xóa các settings cũ nếu có (optional - uncomment nếu muốn reset)
-- DELETE FROM "Setting" WHERE "group" IN ('general', 'branding', 'social', 'payment', 'seo');

-- ===========================================
-- 1. GENERAL SETTINGS
-- ===========================================
INSERT INTO "Setting" ("key", "value", "group", "label", "description", "type") VALUES
-- Basic info
('site_name', 'Digital Store', 'general', 'Tên website', 'Tên chính của website', 'text'),
('site_title', 'Digital Store - Cửa hàng sản phẩm số #1', 'general', 'Tiêu đề SEO', 'Tiêu đề hiển thị trên tab browser và search engine', 'text'),
('site_description', 'Cửa hàng sản phẩm số uy tín, chuyên cung cấp tài khoản GPT, CapCut Pro, Adobe Creative Cloud với giá tốt nhất', 'general', 'Mô tả website', 'Mô tả ngắn về website cho SEO', 'textarea'),
('site_keywords', 'tài khoản GPT, CapCut Pro, Adobe Creative Cloud, digital store, sản phẩm số', 'general', 'Từ khóa SEO', 'Các từ khóa chính cho SEO, phân tách bằng dấu phẩy', 'text'),

-- Contact info
('contact_phone', '0123456789', 'general', 'Số điện thoại', 'Số điện thoại liên hệ chính', 'text'),
('contact_email', 'contact@digitalstore.com', 'general', 'Email liên hệ', 'Email chính để khách hàng liên hệ', 'email'),
('business_hours', '24/7', 'general', 'Giờ làm việc', 'Thời gian phục vụ khách hàng', 'text'),
('address', '123 ABC Street, District 1, Ho Chi Minh City', 'general', 'Địa chỉ', 'Địa chỉ kinh doanh', 'textarea')

ON CONFLICT ("key") DO UPDATE SET 
  "value" = EXCLUDED."value",
  "group" = EXCLUDED."group",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "updatedAt" = NOW();

-- ===========================================
-- 2. BRANDING & MEDIA SETTINGS
-- ===========================================
INSERT INTO "Setting" ("key", "value", "group", "label", "description", "type") VALUES
-- Logo and branding
('logo_url', '', 'branding', 'Logo chính', 'Logo chính của website (PNG/SVG)', 'image'),
('logo_dark_url', '', 'branding', 'Logo dark mode', 'Logo cho chế độ tối', 'image'),
('favicon_url', '', 'branding', 'Favicon', 'Icon hiển thị trên tab browser (ICO/PNG)', 'image'),
('hero_banner', '', 'branding', 'Banner chính', 'Hình ảnh banner trang chủ', 'image'),
('default_product_image', '', 'branding', 'Ảnh sản phẩm mặc định', 'Ảnh hiển thị khi sản phẩm không có ảnh', 'image'),

-- Brand colors
('primary_color', '#3B82F6', 'branding', 'Màu chính', 'Màu chủ đạo của website', 'color'),
('secondary_color', '#10B981', 'branding', 'Màu phụ', 'Màu phụ của website', 'color'),
('brand_slogan', 'Uy tín - Chất lượng - Giá tốt', 'branding', 'Slogan', 'Câu khẩu hiệu của thương hiệu', 'text')

ON CONFLICT ("key") DO UPDATE SET 
  "value" = EXCLUDED."value",
  "group" = EXCLUDED."group",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "updatedAt" = NOW();

-- ===========================================
-- 3. SOCIAL MEDIA SETTINGS
-- ===========================================
INSERT INTO "Setting" ("key", "value", "group", "label", "description", "type") VALUES
-- Social links
('facebook_url', 'https://facebook.com/digitalstore', 'social', 'Facebook URL', 'Link trang Facebook chính', 'url'),
('zalo_phone', '0123456789', 'social', 'Số Zalo', 'Số điện thoại Zalo để khách hàng liên hệ', 'text'),
('telegram_url', 'https://t.me/digitalstore', 'social', 'Telegram URL', 'Link kênh/nhóm Telegram', 'url'),
('youtube_url', '', 'social', 'YouTube URL', 'Link kênh YouTube (optional)', 'url'),
('tiktok_url', '', 'social', 'TikTok URL', 'Link tài khoản TikTok (optional)', 'url'),

-- Social features
('social_sharing_enabled', 'true', 'social', 'Bật chia sẻ social', 'Cho phép khách hàng chia sẻ sản phẩm lên mạng xã hội', 'boolean'),
('facebook_app_id', '', 'social', 'Facebook App ID', 'ID ứng dụng Facebook cho social login', 'text')

ON CONFLICT ("key") DO UPDATE SET 
  "value" = EXCLUDED."value",
  "group" = EXCLUDED."group",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "updatedAt" = NOW();

-- ===========================================
-- 4. PAYMENT & BANKING SETTINGS
-- ===========================================
INSERT INTO "Setting" ("key", "value", "group", "label", "description", "type") VALUES
-- Bank info
('bank_name', 'Vietcombank', 'payment', 'Tên ngân hàng', 'Tên ngân hàng nhận thanh toán', 'text'),
('bank_account', '1234567890', 'payment', 'Số tài khoản', 'Số tài khoản ngân hàng', 'text'),
('bank_owner', 'TRAN MANH HIEU', 'payment', 'Chủ tài khoản', 'Tên chủ tài khoản ngân hàng', 'text'),
('bank_branch', 'Chi nhánh Quận 1', 'payment', 'Chi nhánh', 'Chi nhánh ngân hàng', 'text'),
('bank_qr_code', '', 'payment', 'QR Code ngân hàng', 'Ảnh QR code chuyển khoản ngân hàng', 'image'),

-- E-wallet
('momo_phone', '0123456789', 'payment', 'Số MoMo', 'Số điện thoại MoMo nhận thanh toán', 'text'),
('momo_qr_code', '', 'payment', 'QR Code MoMo', 'Ảnh QR code MoMo', 'image'),
('zalopay_phone', '0123456789', 'payment', 'Số ZaloPay', 'Số điện thoại ZaloPay (optional)', 'text'),

-- Payment settings
('auto_payment_check', 'false', 'payment', 'Tự động kiểm tra thanh toán', 'Tự động xác nhận thanh toán qua API ngân hàng', 'boolean'),
('payment_instructions', 'Vui lòng chuyển khoản đúng nội dung để được xử lý tự động', 'payment', 'Hướng dẫn thanh toán', 'Hướng dẫn chi tiết cho khách hàng', 'textarea')

ON CONFLICT ("key") DO UPDATE SET 
  "value" = EXCLUDED."value",
  "group" = EXCLUDED."group",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "updatedAt" = NOW();

-- ===========================================
-- 5. SEO & ANALYTICS SETTINGS
-- ===========================================
INSERT INTO "Setting" ("key", "value", "group", "label", "description", "type") VALUES
-- SEO basics
('meta_robots', 'index, follow', 'seo', 'Meta Robots', 'Chỉ thị cho search engine crawler', 'text'),
('canonical_url', 'https://digitalstore.com', 'seo', 'Canonical URL', 'URL chính thức của website', 'url'),
('og_image', '', 'seo', 'Open Graph Image', 'Ảnh hiển thị khi chia sẻ lên social media', 'image'),
('og_type', 'website', 'seo', 'Open Graph Type', 'Loại nội dung Open Graph', 'text'),

-- Analytics
('google_analytics_id', '', 'seo', 'Google Analytics ID', 'Mã tracking Google Analytics (GA4)', 'text'),
('google_tag_manager', '', 'seo', 'Google Tag Manager', 'Mã Google Tag Manager', 'text'),
('facebook_pixel_id', '', 'seo', 'Facebook Pixel ID', 'Mã Facebook Pixel cho tracking', 'text'),

-- SEO advanced
('schema_org_type', 'LocalBusiness', 'seo', 'Schema.org Type', 'Loại schema markup cho website', 'text'),
('sitemap_enabled', 'true', 'seo', 'Bật Sitemap', 'Tự động tạo sitemap.xml', 'boolean'),
('robots_txt_enabled', 'true', 'seo', 'Bật Robots.txt', 'Tự động tạo robots.txt', 'boolean')

ON CONFLICT ("key") DO UPDATE SET 
  "value" = EXCLUDED."value",
  "group" = EXCLUDED."group",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "updatedAt" = NOW();

-- ===========================================
-- VERIFY DATA
-- ===========================================
-- Kiểm tra dữ liệu đã insert
SELECT 
  "group",
  COUNT(*) as setting_count,
  STRING_AGG("key", ', ' ORDER BY "key") as keys
FROM "Setting" 
WHERE "group" IN ('general', 'branding', 'social', 'payment', 'seo')
GROUP BY "group"
ORDER BY "group";

-- Hiển thị tất cả settings vừa tạo
SELECT 
  "key",
  "value",
  "group",
  "label",
  "type"
FROM "Setting" 
WHERE "group" IN ('general', 'branding', 'social', 'payment', 'seo')
ORDER BY "group", "key";