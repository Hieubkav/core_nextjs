'use client';

import React from 'react';
import Link from 'next/link';

// Interface cho dữ liệu từ API
interface ProductFromAPI {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  features: string[] | null;
  categoryId: number;
  sortOrder: number;
  isVisible: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
}

// Interface cho component (chỉ lấy các thuộc tính cần thiết)
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductGridProps {
 products: ProductFromAPI[];
  title?: string;
  showAddToCart?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title = "Sản phẩm", 
  showAddToCart = true 
}) => {
  // Hàm render rating stars
  const renderRating = (rating: number, reviewCount: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.18l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-light" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return (
      <div className="flex items-center">
        <div className="flex mr-1">
          {stars}
        </div>
        <span className="text-gray-medium text-sm">
          ({reviewCount})
        </span>
      </div>
    );
  };

  // Map dữ liệu từ API sang dữ liệu cho component
  const mappedProducts: Product[] = products.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice || undefined,
    imageUrl: product.imageUrl || undefined,
    rating: product.rating,
    reviewCount: product.reviewCount
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">
          {title}
        </h2>
        
        {mappedProducts && mappedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mappedProducts.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow duration-300">
                <Link href={`/products/${product.slug}`}>
                  {/* Hình ảnh sản phẩm */}
                  <div className="aspect-w-1 aspect-h-1 mb-4">
                    <div 
                      className="w-full h-48 bg-cover bg-center rounded-lg overflow-hidden"
                      style={{ 
                        backgroundImage: product.imageUrl 
                          ? `url(${product.imageUrl})` 
                          : 'linear-gradient(45deg, #2196F3, #21CBF3)'
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-b from-transparent to-black opacity-10 hover:opacity-20 transition-opacity"></div>
                    </div>
                  </div>
                  
                  {/* Thông tin sản phẩm */}
                  <h3 className="text-lg font-semibold text-dark mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Giá sản phẩm */}
                  <div className="mb-3">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex items-center">
                        <span className="text-primary font-bold text-lg">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-gray-medium text-sm line-through ml-2">
                          {product.originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-lg">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  {product.rating !== undefined && product.reviewCount !== undefined && (
                    <div className="mb-4">
                      {renderRating(product.rating, product.reviewCount)}
                    </div>
                  )}
                </Link>
                
                {/* Nút thêm vào giỏ hàng */}
                {showAddToCart && (
                  <button className="btn w-full py-2 text-sm">
                    Thêm vào giỏ hàng
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-medium">Không có sản phẩm nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;