import React from 'react';
import Link from 'next/link';

// Interface cho dữ liệu từ API
interface CategoryFromAPI {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

// Interface cho component (chỉ lấy các thuộc tính cần thiết)
interface Category {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
}

interface CategoryGridProps {
 categories: CategoryFromAPI[];
  title?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, title = "Danh mục game" }) => {
  // Map dữ liệu từ API sang dữ liệu cho component
  const mappedCategories: Category[] = categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category.productCount
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">
          {title}
        </h2>
        
        {mappedCategories && mappedCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mappedCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="card hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <div 
                    className="w-full h-40 bg-cover bg-center rounded-lg overflow-hidden"
                    style={{ 
                      backgroundImage: 'linear-gradient(45deg, #2196F3, #21CBF3)'
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-black opacity-30 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-center text-dark group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.productCount !== undefined && (
                  <p className="text-center text-gray-medium text-sm mt-1">
                    {category.productCount} sản phẩm
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-medium">Không có danh mục nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;