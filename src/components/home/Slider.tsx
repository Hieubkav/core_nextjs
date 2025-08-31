'use client';

import React, { useState, useEffect } from 'react';

// Interface cho dữ liệu từ API
interface SliderFromAPI {
  id: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
}

// Interface cho component (chỉ lấy các thuộc tính cần thiết)
interface Slide {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

interface SliderProps {
  slides: SliderFromAPI[];
}

const Slider: React.FC<SliderProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide chuyển động
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  // Map dữ liệu từ API sang dữ liệu cho component
  const mappedSlides: Slide[] = slides.map(slide => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle || '',
    imageUrl: slide.imageUrl || '',
    buttonText: slide.buttonText || 'Xem thêm',
    buttonLink: slide.buttonLink || '#'
  }));

  if (!mappedSlides || mappedSlides.length === 0) {
    return <div className="h-96 bg-secondary flex items-center justify-center">Không có slider</div>;
  }

  return (
    <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
      {/* Slides */}
      {mappedSlides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Hình ảnh nền */}
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            {/* Overlay gradient */}
            <div className="w-full h-full bg-gradient-to-b from-transparent to-black opacity-80"></div>
          </div>
          
          {/* Nội dung */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-light mb-4 text-shadow">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl text-light mb-8 max-w-2xl text-shadow">
              {slide.subtitle}
            </p>
            <a 
              href={slide.buttonLink} 
              className="btn hover:shadow-lg transition-shadow"
            >
              {slide.buttonText}
            </a>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-light bg-opacity-20 text-light p-2 rounded-full hover:bg-opacity-30 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7 7-7" />
        </svg>
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-light bg-opacity-20 text-light p-2 rounded-full hover:bg-opacity-30 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {mappedSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-light w-6' 
                : 'bg-light bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;