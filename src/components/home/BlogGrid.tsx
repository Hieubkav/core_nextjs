'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

// API model
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

// UI model
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  author?: string;
}

interface BlogGridProps {
  posts: PostFromAPI[];
  title?: string;
}

const BlogGrid: React.FC<BlogGridProps> = ({ posts, title = 'Tin tức & Bài viết' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch {
      return dateString;
    }
  };

  // Map API -> UI
  const mappedPosts: BlogPost[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content || undefined,
    imageUrl: post.thumbnailUrl || undefined,
    createdAt: post.createdAt,
    author: 'Admin',
  }));

  // Close on ESC when modal open
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  // Track current index via scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let closest = 0;
        let minDelta = Number.POSITIVE_INFINITY;
        cardRefs.current.forEach((node, idx) => {
          if (!node) return;
          const rect = node.getBoundingClientRect();
          const parentRect = el.getBoundingClientRect();
          const cardCenter = rect.left - parentRect.left + rect.width / 2 + el.scrollLeft;
          const delta = Math.abs(cardCenter - center);
          if (delta < minDelta) {
            minDelta = delta;
            closest = idx;
          }
        });
        setCurrentIndex(closest);
        ticking = false;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goToSlide = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    setCurrentIndex(index);
  };
  const goToPrev = () => goToSlide(currentIndex === 0 ? Math.max(mappedPosts.length - 1, 0) : currentIndex - 1);
  const goToNext = () => goToSlide(currentIndex === mappedPosts.length - 1 ? 0 : currentIndex + 1);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">{title}</h2>

        {mappedPosts && mappedPosts.length > 0 ? (
          <div className="relative">
            {/* Carousel */}
            <div
              ref={scrollerRef}
              className="snap-x snap-mandatory flex gap-4 md:gap-5 overflow-x-auto scroll-px-6 md:scroll-px-8 px-1 md:px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ scrollBehavior: 'smooth' }}
            >
              <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>
              {mappedPosts.map((post, idx) => (
                <div
                  key={post.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className="snap-center shrink-0 min-w-[calc(50%-0.5rem)] md:min-w-[calc(25%-0.75rem)]"
                >
                  <button
                    onClick={() => setSelected(post)}
                    className="w-full text-left card hover:shadow-lg transition-shadow duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="mb-4">
                      <div
                        className="w-full h-40 md:h-44 bg-cover bg-center rounded-lg overflow-hidden"
                        style={{
                          backgroundImage: post.imageUrl
                            ? `url(${post.imageUrl})`
                            : 'linear-gradient(45deg, #2196F3, #21CBF3)'
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-b from-transparent to-black/30 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-semibold text-dark mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-medium mb-3 line-clamp-2">{post.excerpt}</p>

                    {/* Meta */}
                    <div className="flex justify-between items-center text-xs md:text-sm text-gray-medium">
                      <span>{post.author && `Bởi ${post.author}`}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Controls */}
            {mappedPosts.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  aria-label="Trước"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 rounded-full bg-white/90 backdrop-blur border border-black/5 shadow-md hover:shadow-lg p-2 md:p-2.5 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-dark" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  aria-label="Sau"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-4 rounded-full bg-white/90 backdrop-blur border border-black/5 shadow-md hover:shadow-lg p-2 md:p-2.5 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-dark" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Dots */}
            {mappedPosts.length > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {mappedPosts.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Chuyển đến bài ${i + 1}`}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-light'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-medium">Chưa có bài viết nào</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl md:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/70">
              <h3 className="text-xl md:text-2xl font-semibold text-dark line-clamp-2 pr-6">{selected.title}</h3>
              <button aria-label="Đóng" onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
              {selected.imageUrl && (
                <div className="mb-5 relative rounded-xl overflow-hidden">
                  <div className="pt-[56.25%]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.imageUrl} alt={selected.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <article className="blog-modal-content text-gray-700">
                {selected.content ? (
                  <div dangerouslySetInnerHTML={{ __html: selected.content }} />
                ) : (
                  <p className="leading-relaxed">{selected.excerpt || 'Không có nội dung hiển thị.'}</p>
                )}
              </article>
            </div>
            <div className="px-6 pb-6 text-sm text-gray-medium flex justify-between items-center">
              <span>{selected.author && `Bởi ${selected.author}`}</span>
              <span>{formatDate(selected.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogGrid;
