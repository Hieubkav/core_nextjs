# Kế hoạch xây dựng website bán acc

## 1. Phân tích yêu cầu và mục tiêu

Website bán acc được xây dựng với mục tiêu:
- Cung cấp nền tảng bán acc game đáng tin cậy, dễ sử dụng
- Giao diện tươi sáng, hiện đại, bắt mắt
- Trải nghiệm người dùng tốt với nhiều component hữu ích

## 2. Các component cần thiết cho trang chủ

1. **Header** - Thanh điều hướng chính
2. **Slider/Banner** - Hiển thị chương trình khuyến mãi, acc nổi bật
3. **Danh mục game** - Hiển thị các danh mục game phổ biến
4. **Sản phẩm nổi bật** - Hiển thị các acc được đánh giá cao hoặc bán chạy
5. **Sản phẩm mới nhất** - Hiển thị các acc mới được thêm vào
6. **Đánh giá khách hàng** - Hiển thị phản hồi từ người dùng
7. **Blog/Tin tức** - Chia sẻ thông tin về game, acc
8. **Câu hỏi thường gặp** - Giải đáp thắc mắc của khách hàng
9. **Footer** - Thông tin liên hệ, chính sách

## 3. Cấu trúc component trang chủ với model tương ứng

| Component | Model sử dụng | Mô tả |
|-----------|---------------|-------|
| Header | Không dùng model | Thanh điều hướng chính với logo, menu, tìm kiếm |
| Slider/Banner | Slider | Hiển thị carousel các slider với hình ảnh, tiêu đề, nội dung |
| Danh mục game | Category | Hiển thị danh sách danh mục game phổ biến |
| Sản phẩm nổi bật | Product, ProductVariant, Image, Review | Hiển thị sản phẩm nổi bật với hình ảnh, giá, đánh giá |
| Sản phẩm mới nhất | Product, ProductVariant, Image | Hiển thị sản phẩm mới nhất theo ngày tạo |
| Đánh giá khách hàng | Review, Customer, Product | Hiển thị đánh giá từ khách hàng với rating, nội dung |
| Blog/Tin tức | Post, Image | Hiển thị các bài viết/blog nổi bật |
| Câu hỏi thường gặp | FAQ | Hiển thị các câu hỏi thường gặp dưới dạng accordion |
| Footer | Không dùng model | Thông tin liên hệ, chính sách, mạng xã hội |

## 4. Kế hoạch chi tiết cho từng component

### 4.1 Header
- Logo website
- Menu điều hướng chính (Trang chủ, Danh mục, Sản phẩm, Blog, Liên hệ)
- Thanh tìm kiếm
- Liên kết đến giỏ hàng
- Liên kết đến tài khoản người dùng
- Thiết kế responsive

### 4.2 Slider/Banner
- Carousel các slider với hiệu ứng chuyển động
- Hình ảnh nền, tiêu đề, nội dung phụ, nút hành động
- Dữ liệu từ Slider model (isVisible = true, sắp xếp theo sortOrder)
- Dot indicator và navigation arrow
- Tự động chuyển sau khoảng thời gian

### 4.3 Danh mục game
- Grid hoặc carousel các danh mục game
- Hình ảnh đại diện, tên danh mục, số lượng sản phẩm
- Dữ liệu từ Category model (isVisible = true, giới hạn 8 danh mục)
- Hiệu ứng hover
- Liên kết đến trang danh sách sản phẩm theo danh mục

### 4.4 Sản phẩm nổi bật
- Grid các sản phẩm nổi bật
- Hình ảnh, tên sản phẩm, giá, rating, nút thêm vào giỏ hàng
- Dữ liệu từ Product model (isVisible = true, filter theo tiêu chí nổi bật)
- Sắp xếp theo tiêu chí nổi bật (giới hạn 8 sản phẩm)

### 4.5 Sản phẩm mới nhất
- Grid các sản phẩm mới nhất
- Hình ảnh, tên sản phẩm, giá, rating, nút thêm vào giỏ hàng
- Dữ liệu từ Product model (isVisible = true, sắp xếp theo createdAt DESC)
- Giới hạn 8 sản phẩm

### 4.6 Đánh giá khách hàng
- Carousel hoặc grid các đánh giá
- Avatar, tên khách hàng, rating, tiêu đề, nội dung đánh giá
- Dữ liệu từ Review model (isVisible = true, rating >= 4)
- Sắp xếp theo ngày tạo giảm dần hoặc ngẫu nhiên
- Giới hạn 6 đánh giá

### 4.7 Blog/Tin tức
- Grid hoặc list các bài viết
- Hình ảnh thumbnail, tiêu đề, trích dẫn, ngày tạo, tác giả
- Dữ liệu từ Post model (status = 'published', isVisible = true)
- Sắp xếp theo ngày tạo giảm dần
- Giới hạn 4 bài viết

### 4.8 Câu hỏi thường gặp
- Accordion các câu hỏi thường gặp
- Tiêu đề câu hỏi, nội dung câu trả lời (ẩn/hiện khi click)
- Dữ liệu từ FAQ model (isVisible = true, sắp xếp theo sortOrder)
- Giới hạn 9 câu hỏi

### 4.9 Footer
- Logo và mô tả ngắn
- Liên kết nhanh (Về chúng tôi, Chính sách, Điều khoản, Liên hệ)
- Thông tin liên hệ (địa chỉ, email, điện thoại)
- Mạng xã hội
- Newsletter subscription
- Copyright
- Thiết kế responsive

## 5. Sơ đồ kiến trúc tổng thể

```mermaid
graph TD
    A[Trang chủ] --> B[Header]
    A --> C[Slider/Banner]
    A --> D[Danh mục game]
    A --> E[Sản phẩm nổi bật]
    A --> F[Sản phẩm mới nhất]
    A --> G[Đánh giá khách hàng]
    A --> H[Blog/Tin tức]
    A --> I[Câu hỏi thường gặp]
    A --> J[Footer]

    B -->|Không dùng model| B1[Logo]
    B -->|Không dùng model| B2[Menu]
    B -->|Không dùng model| B3[Tìm kiếm]
    B -->|Không dùng model| B4[Giỏ hàng]
    B -->|Không dùng model| B5[Tài khoản]

    C -->|Slider model| C1[Hình ảnh]
    C -->|Slider model| C2[Tiêu đề]
    C -->|Slider model| C3[Nội dung]
    C -->|Slider model| C4[Nút hành động]

    D -->|Category model| D1[Tên danh mục]
    D -->|Category model| D2[Hình ảnh]
    D -->|Category model| D3[Số lượng sản phẩm]

    E -->|Product model| E1[Tên sản phẩm]
    E -->|ProductVariant model| E2[Giá]
    E -->|Image model| E3[Hình ảnh]
    E -->|Review model| E4[Rating]

    F -->|Product model| F1[Tên sản phẩm]
    F -->|ProductVariant model| F2[Giá]
    F -->|Image model| F3[Hình ảnh]
    F -->|Review model| F4[Rating]

    G -->|Review model| G1[Rating]
    G -->|Customer model| G2[Tên khách hàng]
    G -->|Product model| G3[Tên sản phẩm]
    G -->|Review model| G4[Nội dung]

    H -->|Post model| H1[Tiêu đề]
    H -->|Image model| H2[Hình ảnh]
    H -->|Post model| H3[Trích dẫn]
    H -->|Post model| H4[Ngày tạo]

    I -->|FAQ model| I1[Câu hỏi]
    I -->|FAQ model| I2[Câu trả lời]

    J -->|Không dùng model| J1[Thông tin liên hệ]
    J -->|Không dùng model| J2[Liên kết]
    J -->|Không dùng model| J3[Mạng xã hội]