import React from 'react';
import Header from '@/components/home/Header';
import Slider from '@/components/home/Slider';
import CatalogAll from '@/components/home/CatalogAll';
import TestimonialCarousel from '@/components/home/TestimonialCarousel';
import BlogGrid from '@/components/home/BlogGrid';
import FAQAccordion from '@/components/home/FAQAccordion';
import Footer from '@/components/home/Footer';
import SpeedDial from '@/components/common/SpeedDial';

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
  category: { id: number; name: string; slug: string } | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
}

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

interface FaqFromAPI {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsFromAPI {
  [key: string]: string;
}

async function fetchHomeData() {
  try {
    const slidersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/sliders?limit=5`);
    const sliders: SliderFromAPI[] = await slidersRes.json();

    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/categories?limit=8`);
    const categories: CategoryFromAPI[] = await categoriesRes.json();

    const featuredProductsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/home/products?limit=8&sortBy=sortOrder&sortOrder=asc`
    );
    const featuredProducts: ProductFromAPI[] = await featuredProductsRes.json();

    const latestProductsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/latest-products?limit=8`);
    const latestProducts: ProductFromAPI[] = await latestProductsRes.json();

    const reviewsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/reviews?limit=6`);
    const reviews: ReviewFromAPI[] = await reviewsRes.json();

    const postsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/home/posts?limit=3&sortBy=createdAt&sortOrder=desc`
    );
    const posts: PostFromAPI[] = await postsRes.json();

    const faqsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/faqs?limit=10`);
    const faqs: FaqFromAPI[] = await faqsRes.json();

    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/home/settings`);
    const settings: SettingsFromAPI = await settingsRes.json();

    return { sliders, categories, featuredProducts, latestProducts, reviews, posts, faqs, settings };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { sliders: [], categories: [], featuredProducts: [], latestProducts: [], reviews: [], posts: [], faqs: [], settings: {} };
  }
}

export default async function Home() {
  const { sliders, categories, featuredProducts, latestProducts, reviews, posts, faqs, settings } =
    await fetchHomeData();

  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settings} />

      <main className="flex-grow pt-16">
        <Slider slides={sliders} />

        <div id="products">
          <CatalogAll settings={settings} />
        </div>

        <TestimonialCarousel testimonials={reviews} />

        <div id="blog">
          <BlogGrid posts={posts} />
        </div>

        <FAQAccordion faqs={faqs} />
      </main>

      <div id="contact">
        <Footer settings={settings} />
      </div>
      <SpeedDial settings={settings} />
    </div>
  );
}
