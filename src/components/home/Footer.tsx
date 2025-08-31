import React from 'react';

interface FooterProps {
  settings?: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ settings = {} }) => {
  // Default values
  const siteName = settings.site_name || 'ACCSTORE';
  const siteDescription = settings.site_description || 'Cung cấp các tài khoản game chất lượng cao với giá cả cạnh tranh nhất thị trường.';
  const contactAddress = settings.address || '123 Đường ABC, Quận XYZ, TP. HCM';
  const contactPhone = settings.contact_phone || '(+84) 123 456 789';
  const contactEmail = settings.contact_email || 'info@accstore.com';
  const facebookUrl = settings.facebook_url || '#';
  const zaloPhone = settings.zalo_phone || '#';
  const telegramUrl = settings.telegram_url || '#';

  return (
    <footer className="bg-dark text-light py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo và mô tả */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {siteName.split('STORE')[0]}<span className="text-primary">STORE</span>
            </h2>
            <p className="text-gray-medium mb-4">
              {siteDescription}
            </p>
            <div className="flex space-x-4">
              <a href={facebookUrl} className="text-light hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.77-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 2 16.991 22 12z"/>
                </svg>
              </a>
              <a href={`https://zalo.me/${zaloPhone}`} className="text-light hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.891 18.184c-.285.398-.922.682-1.301.701-.266.028-.664.019-1.005-.019-1.768-.171-2.99-.847-4.579-2.06-.78-.608-1.368-1.35-2.06-2.052-.693-.701-1.433-1.298-2.052-2.06-1.213-1.58-1.89-2.801-2.06-4.579-.038-.341-.047-.739-.019-1.005.019-.38.294-1.016.701-1.301.371-.257.814-.352 1.248-.352.085 0 .17.009.257.019.219.028.438.085.639.171.181.076.362.171.524.285.162.114.314.247.448.398.134.152.257.314.362.485.105.171.19.352.257.533.06.181.114.371.142.562.028.19.047.39.047.58 0 .19-.019.39-.047.58-.028.19-.076.38-.142.562-.067.181-.152.362-.257.533-.105.171-.228.333-.362.485-.134.152-.286.285-.448.398-.162.114-.343.209-.524.285-.201.085-.42.142-.639.171-.087.01-.172.019-.257.019-.434 0-.87-.095-1.248-.352-.407-.398-.682-1.034-.701-1.301-.028-.266-.019-.64.019-1.005.171-1.768.847-2.9 2.06-4.579.682-.893 1.507-1.653 2.445-2.264.938-.61 1.971-.99 3.06-.99 1.089 0 2.122.38 3.06.99.938.611 1.763 1.371 2.445 2.264 1.213 1.58 1.89 2.801 2.06 4.579.038.341.047.739.019 1.005-.019.266-.294.903-.701 1.301-.371.257-.814.352-1.248.352-.085 0-.17-.009-.257-.019-.219-.028-.438-.085-.639-.171-.181-.076-.362-.171-.524-.285-.162-.114-.314-.247-.448-.398-.134-.152-.257-.314-.362-.485-.105-.171-.19-.352-.257-.53-.066-.181-.114-.371-.142-.562-.028-.19-.047-.39-.047-.58 0-.19.019-.39.047-.58.028-.19.076-.38.142-.562.067-.181.152-.362.257-.533.105-.171.228-.333.362-.485.134-.152.286-.285.448-.398.162-.114.343-.209.524-.285.201-.085.42-.142.639-.171.087-.01.172-.019.257-.019.434 0 .877.095 1.248.352z"/>
                </svg>
              </a>
              <a href={telegramUrl} className="text-light hover:text-primary transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.817 17.143c-.195.893-.996 1.045-1.648.518l-2.115-1.61c-.527-.405-.82-.634-1.225-.634-.395 0-.614.219-.614.614l.038 2.05c.019.205-.286.31-.448.152-1.768-1.72-2.801-3.44-4.568-5.169-.171-.171-.114-.371.134-.495l6.19-2.45c.395-.152.762.085.667.518l-1.016 4.485c-.038.171.171.314.314.19-.085-.085 1.777-1.668 1.777-1.668.19-.171.371-.152.219.076l-2.614 2.529c-.095.095-.019.171.057.152l.847-.105c.105-.019.286-.057.286.076v.847c0 .105.085.143.162.076l2.88-2.765c.205-.205.371-.114.228.076l-1.73 1.648c-.095.095.019.171.114.114l.495-.305c.105-.057.286-.171.267.038l-.171 1.906z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-medium hover:text-primary transition-colors">Trang chủ</a></li>
              <li><a href="/categories" className="text-gray-medium hover:text-primary transition-colors">Danh mục</a></li>
              <li><a href="/products" className="text-gray-medium hover:text-primary transition-colors">Sản phẩm</a></li>
              <li><a href="/blog" className="text-gray-medium hover:text-primary transition-colors">Blog</a></li>
              <li><a href="/about" className="text-gray-medium hover:text-primary transition-colors">Về chúng tôi</a></li>
              <li><a href="/contact" className="text-gray-medium hover:text-primary transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          
          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-medium">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.24-4.243a8 8 0 1.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 05.516 5.516l1.13-2.257a1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 0 00-2 2v10a2 2 002 2z" />
                </svg>
                <span>{contactEmail}</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bản tin</h3>
            <p className="text-gray-medium mb-4">
              Đăng ký để nhận thông tin khuyến mãi và tin tức mới nhất.
            </p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="input bg-light text-dark"
              />
              <button type="submit" className="btn">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-dark mt-8 pt-8 text-center text-gray-medium">
          <p>&copy; {new Date().getFullYear()} {siteName}. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;