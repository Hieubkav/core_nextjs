'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// API Review interface
interface ReviewFromAPI {
  id: number;
  customerId: number;
  productId: number;
  rating: number;
  title: string | null;
  content: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  productName: string;
  productSlug: string;
}

// Simplified UI model
interface Testimonial {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  avatarUrl?: string;
}

interface TestimonialCarouselProps {
  testimonials: ReviewFromAPI[];
  title?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  title = 'Đánh giá từ khách hàng',
}) => {
  // Carousel UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Render rating stars (iOS-like tint)
  const renderRating = (rating: number) => {
    const stars = [] as React.ReactNode[];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-warning"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (half) {
      stars.push(
        <svg
          key="half"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-warning"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-light"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return (
      <div className="flex items-center" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5`}>
        {stars}
      </div>
    );
  };

  // New icon-based rating renderer (react-icons)
  const renderRatingIcon = (rating: number) => {
    const items = [] as React.ReactNode[];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    for (let i = 0; i < full; i++) items.push(<FaStar key={`full-${i}`} className="h-5 w-5 text-warning" />);
    if (half) items.push(<FaStarHalfAlt key="half" className="h-5 w-5 text-warning" />);
    for (let i = 0; i < empty; i++) items.push(<FaRegStar key={`empty-${i}`} className="h-5 w-5 text-gray-light" />);

    return (
      <div className="flex items-center" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5`}>
        {items}
      </div>
    );
  };

  // Map API -> UI
  const mapped: Testimonial[] = testimonials.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    title: r.title || 'Đánh giá sản phẩm',
    content: r.content || '',
    avatarUrl: undefined,
  }));

  // Smooth auto-advance like iOS carousels
  useEffect(() => {
    if (mapped.length <= 1) return;
    const id = setInterval(() => {
      const next = (currentIndex + 1) % mapped.length;
      cardRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setCurrentIndex(next);
    }, 5000);
    return () => clearInterval(id);
  }, [currentIndex, mapped.length]);

  // Sync currentIndex with scroll position
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

  const goToPrev = () => {
    const prev = currentIndex === 0 ? mapped.length - 1 : currentIndex - 1;
    goToSlide(prev);
  };

  const goToNext = () => {
    const next = currentIndex === mapped.length - 1 ? 0 : currentIndex + 1;
    goToSlide(next);
  };

  if (!mapped || mapped.length === 0) {
    return (
      <section className="py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-6 text-dark">{title}</h2>
          <p className="text-center text-gray-medium">Chưa có đánh giá nào</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 section-blue">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-dark">{title}</h2>
          <p className="mt-2 text-gray-medium max-w-2xl mx-auto">Những chia sẻ chân thực từ người dùng</p>
        </div>

        {/* Scroll-snap carousel with iOS-style glass cards */}
        <div className="relative">

          <div
            ref={scrollerRef}
            className="snap-x snap-mandatory flex gap-5 md:gap-6 overflow-x-auto scroll-px-6 md:scroll-px-8 px-1 md:px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* hide scrollbar chrome/safari */}
            <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>
            {mapped.map((t, idx) => (
              <div
                key={t.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                className="snap-center shrink-0 basis-[88%] sm:basis-[72%] md:basis-[56%] lg:basis-[34%] xl:basis-[30%]"
              >
                <div className="relative h-full rounded-3xl border border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,24,39,0.08)] px-6 py-6 md:px-7 md:py-7">
                  {/* subtle ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />

                  {/* Quote badge inside card to avoid clipping */}
                  <div className="absolute top-3 left-4">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path fill="currentColor" d="M7.17 5C4.85 5 3 6.85 3 9.17V21h8V9.17C11 6.85 9.15 5 6.83 5h.34zm10 0C14.85 5 13 6.85 13 9.17V21h8V9.17C21 6.85 19.15 5 16.83 5h.34z" />
                      </svg>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4 mt-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/60">
                      {t.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatarUrl} alt={t.customerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/90 text-light flex items-center justify-center font-semibold">
                          {t.customerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-dark font-semibold truncate">{t.customerName}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {renderRatingIcon(t.rating)}
                        <span className="text-xs text-gray-medium">{t.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base md:text-lg font-semibold text-dark mb-2 line-clamp-1">{t.title}</h3>
                  <p className="text-gray-medium line-clamp-3 md:line-clamp-2 leading-relaxed">{t.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          {mapped.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                aria-label="Trước"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-4 rounded-full bg-white/90 backdrop-blur border border-black/5 shadow-md hover:shadow-lg p-2 md:p-2.5 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-dark"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                aria-label="Sau"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-4 rounded-full bg-white/90 backdrop-blur border border-black/5 shadow-md hover:shadow-lg p-2 md:p-2.5 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-dark"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {mapped.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {mapped.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Chuyển đến đánh giá ${i + 1}`}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-light'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
