import React from 'react';
import Link from 'next/link';

// Interface cho dữ liệu từ API
interface PostFromAPI {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
}

// Interface cho component (chỉ lấy các thuộc tính cần thiết)
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  createdAt: string;
  author?: string;
}

interface BlogGridProps {
 posts: PostFromAPI[];
  title?: string;
}

const BlogGrid: React.FC<BlogGridProps> = ({ 
  posts, 
  title = "Tin tức & Bài viết" 
}) => {
  // Hàm format ngày tháng
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Map dữ liệu từ API sang dữ liệu cho component
  const mappedPosts: BlogPost[] = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    imageUrl: post.thumbnailUrl || undefined,
    createdAt: post.createdAt,
    author: 'Admin' // Trong thực tế, có thể lấy từ API nếu có thông tin tác giả
  }));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">
          {title}
        </h2>
        
        {mappedPosts && mappedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mappedPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="card hover:shadow-lg transition-shadow duration-300 group"
              >
                {/* Hình ảnh thumbnail */}
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <div 
                    className="w-full h-48 bg-cover bg-center rounded-lg overflow-hidden"
                    style={{ 
                      backgroundImage: post.imageUrl 
                        ? `url(${post.imageUrl})` 
                        : 'linear-gradient(45deg, #2196F3, #21CBF3)'
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-black opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  </div>
                </div>
                
                {/* Tiêu đề bài viết */}
                <h3 className="text-xl font-semibold text-dark mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                {/* Trích dẫn */}
                <p className="text-gray-medium mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                {/* Thông tin bài viết */}
                <div className="flex justify-between items-center text-sm text-gray-medium">
                  <span>
                    {post.author && `Bởi ${post.author}`}
                  </span>
                  <span>
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-medium">Chưa có bài viết nào</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;