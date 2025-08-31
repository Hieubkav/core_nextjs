/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thêm cấu hình cho GitHub Pages
  output: 'export',
  images: {
    unoptimized: true, // GitHub Pages không hỗ trợ tối ưu hóa hình ảnh của Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Nếu repository của bạn có tên khác với tên người dùng GitHub, bạn cần thêm cấu hình basePath:
  // basePath: '/repository-name',
  // Nếu bạn cần cấu hình assetPrefix:
  // assetPrefix: '/repository-name',
}

module.exports = nextConfig
