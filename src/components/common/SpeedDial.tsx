'use client';

import React from 'react';
import { FaFacebookF } from 'react-icons/fa';

interface SpeedDialProps {
  settings?: Record<string, string>;
}

const SpeedDial: React.FC<SpeedDialProps> = ({ settings = {} }) => {
  const zaloPhoneRaw = settings.zalo_phone || settings.contact_phone || '';
  const contactPhoneRaw = settings.contact_phone || '';
  const facebookUrlRaw = (settings.facebook_url || settings.facebook || '').toString();

  // Sanitize phone strings for links
  const sanitizePhone = (v: string) => (v || '').replace(/[^+\d]/g, '');
  const zaloPhone = sanitizePhone(zaloPhoneRaw);
  const contactPhone = sanitizePhone(contactPhoneRaw);

  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ẩn hoàn toàn nếu không có hành động nào (ở top trang và thiếu số liên hệ)
  const hasZalo = Boolean(zaloPhone);
  const hasPhone = Boolean(contactPhone);
  const hasFacebook = Boolean(facebookUrlRaw && facebookUrlRaw.trim() !== '' && facebookUrlRaw !== '#');
  const hasAny = hasZalo || hasPhone || hasFacebook || showTop;

  if (!hasAny) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Facebook */}
        {hasFacebook && (
          <a
            href={facebookUrlRaw}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="rounded-full bg-[#1877F2] text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] h-12 w-12 flex items-center justify-center"
          >
            <FaFacebookF className="h-5 w-5" />
          </a>
        )}
        {/* Zalo */}
        {hasZalo && (
          <a
            href={`https://zalo.me/${zaloPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo"
            className="rounded-full bg-[#0068FF] text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0068FF] h-12 w-12 flex items-center justify-center"
          >
            <span className="font-bold text-lg">Z</span>
          </a>
        )}

        {/* Phone */}
        {hasPhone && (
          <a
            href={`tel:${contactPhone}`}
            aria-label="Gọi điện"
            className="rounded-full bg-green-500 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 h-12 w-12 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 0 1 2-2h2.6a1 1 0 0 1 .95.69l1.05 3.16a1 1 0 0 1-.48 1.2l-1.7.85a11.5 11.5 0 0 0 5.18 5.18l.85-1.7a1 1 0 0 1 1.2-.48l3.16 1.05a1 1 0 0 1 .69.95V19a2 2 0 0 1-2 2h-1C9.94 21 3 14.06 3 5z" />
            </svg>
          </a>
        )}

        {/* Back to top */}
        {showTop && (
          <button
            aria-label="Lên đầu trang"
            className="rounded-full bg-gray-800 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 h-12 w-12 flex items-center justify-center"
            onClick={scrollToTop}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SpeedDial;
