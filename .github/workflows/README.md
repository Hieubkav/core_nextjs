# Triển khai Next.js lên GitHub Pages

Workflow này sẽ tự động xây dựng và triển khai ứng dụng Next.js của bạn lên GitHub Pages khi bạn push code lên nhánh chính.

## Cấu hình GitHub Pages

Để kích hoạt GitHub Pages cho repository của bạn, hãy làm theo các bước sau:

1. Truy cập vào repository của bạn trên GitHub
2. Vào tab "Settings"
3. Cuộn xuống phần "Pages" trong sidebar bên trái
4. Trong phần "Source", chọn "GitHub Actions"
5. Lưu cấu hình

## Cấu hình ứng dụng Next.js

Tệp `next.config.js` đã được cấu hình để hỗ trợ GitHub Pages:

- `output: 'export'`: Xuất ứng dụng thành các tệp tĩnh
- `images.unoptimized: true`: Tắt tối ưu hóa hình ảnh (GitHub Pages không hỗ trợ)

### Nếu repository của bạn có tên tùy chỉnh

Nếu repository của bạn không phải là repository người dùng (ví dụ: `username.github.io`) mà là repository dự án (ví dụ: `username/project-name`), bạn cần cập nhật `next.config.js`:

```javascript
const nextConfig = {
 output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      // ... cấu hình hiện tại
    ],
  },
  basePath: '/project-name', // Thêm dòng này với tên repository của bạn
  assetPrefix: '/project-name', // Thêm dòng này với tên repository của bạn
}
```

Sau khi cập nhật, commit và push thay đổi lên repository của bạn.

## Workflow

Workflow sẽ tự động chạy khi:
- Bạn push code lên nhánh `main` (hoặc `master`)
- Bạn kích hoạt workflow thủ công từ tab "Actions" trên GitHub

Bạn có thể theo dõi tiến trình triển khai trong tab "Actions" của repository.