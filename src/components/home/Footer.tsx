import React from 'react';
import { FaFacebookF, FaTelegramPlane, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

interface FooterProps {
  settings?: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ settings = {} }) => {
  const siteName = settings.site_name || 'ACCSTORE';
  const siteDescription =
    settings.site_description ||
    'Cung cấp các tài khoản game chất lượng cao với giá cả cạnh tranh nhất thị trường.';
  const contactAddress = settings.address || '123 Đường ABC, Quận XYZ, TP. HCM';
  const contactPhone = settings.contact_phone || '(+84) 123 456 789';
  const contactEmail = settings.contact_email || 'info@accstore.com';
  const facebookUrl = settings.facebook_url || '#';
  const zaloPhone = settings.zalo_phone || '';
  const telegramUrl = settings.telegram_url || '#';

  return (
    <footer className="bg-gradient-to-b from-[#0b1220] to-[#0e1a2e] text-light py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & mô tả */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {siteName.split('STORE')[0]}
              <span className="text-primary">STORE</span>
            </h2>
            <p className="text-gray-300 mb-4">{siteDescription}</p>
            <div className="flex space-x-4">
              {facebookUrl && facebookUrl !== '#' && (
                <a href={facebookUrl} className="text-light hover:text-primary transition-colors" aria-label="Facebook">
                  <FaFacebookF className="h-6 w-6" />
                </a>
              )}
              {zaloPhone && (
                <a href={`https://zalo.me/${zaloPhone}`} className="text-light hover:text-primary transition-colors" aria-label="Zalo">
                  <span className="h-6 w-6 inline-flex items-center justify-center font-bold">Z</span>
                </a>
              )}
              {telegramUrl && telegramUrl !== '#' && (
                <a href={telegramUrl} className="text-light hover:text-primary transition-colors" aria-label="Telegram">
                  <FaTelegramPlane className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-primary transition-colors">Trang chủ</a></li>
              <li><a href="/categories" className="text-gray-300 hover:text-primary transition-colors">Danh mục</a></li>
              <li><a href="/products" className="text-gray-300 hover:text-primary transition-colors">Sản phẩm</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-primary transition-colors">Blog</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-primary transition-colors">Về chúng tôi</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-primary transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 mr-2 mt-0.5" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="h-5 w-5 mr-2" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="h-5 w-5 mr-2" />
                <span>{contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bản tin</h3>
            <p className="text-gray-300 mb-4">Đăng ký để nhận thông tin khuyến mãi và tin tức mới nhất.</p>
            <form className="flex flex-col space-y-2">
              <input type="email" placeholder="Email của bạn" className="input bg-light text-dark" />
              <button type="submit" className="btn">Đăng ký</button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-dark mt-8 pt-8 text-center text-gray-medium">
          <p>&copy; {new Date().getFullYear()} {siteName}. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

