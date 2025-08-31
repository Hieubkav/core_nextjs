'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  cartCount?: number;
  isLoggedIn?: boolean;
  username?: string;
  settings?: Record<string, string>;
}

const Header: React.FC<HeaderProps> = ({ settings = {} }) => {
  const siteName = settings.site_name || 'ACCSTORE';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 h-16 backdrop-blur-md border-b border-gray-200 z-50 flex items-center px-4 transition-colors ${
        scrolled ? 'bg-white/90 shadow-sm' : 'bg-white/70'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-dark">
            {siteName.split('STORE')[0]}
            <span className="text-primary">STORE</span>
          </Link>
        </div>

        {/* Menu điều hướng */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-dark hover:text-primary transition-colors">Trang chủ</Link>
          <button onClick={() => scrollTo('products')} className="text-dark hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Danh mục</button>
          <button onClick={() => scrollTo('products')} className="text-dark hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Sản phẩm</button>
          <button onClick={() => scrollTo('blog')} className="text-dark hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Blog</button>
          <button onClick={() => scrollTo('contact')} className="text-dark hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Liên hệ</button>
        </nav>

        {/* Actions (only hamburger for mobile) */}
        <div className="flex items-center">
          <button
            className="md:hidden text-dark"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3 flex flex-col space-y-3">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-dark hover:text-primary transition-colors">Trang chủ</Link>
              <button onClick={() => { scrollTo('products'); setMobileOpen(false); }} className="text-left text-dark hover:text-primary">Danh mục</button>
              <button onClick={() => { scrollTo('products'); setMobileOpen(false); }} className="text-left text-dark hover:text-primary">Sản phẩm</button>
              <button onClick={() => { scrollTo('blog'); setMobileOpen(false); }} className="text-left text-dark hover:text-primary">Blog</button>
              <button onClick={() => { scrollTo('contact'); setMobileOpen(false); }} className="text-left text-dark hover:text-primary">Liên hệ</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

