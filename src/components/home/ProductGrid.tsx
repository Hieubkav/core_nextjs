"use client";

import React from 'react';

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
  variantOptions?: { name?: string; price: number; originalPrice?: number }[];
}

interface ProductGridProps {
  products: ProductFromAPI[];
  title?: string;
  settings?: Record<string, string>;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title = 'Sản phẩm', settings = {} }) => {
  const [open, setOpen] = React.useState<ProductFromAPI | null>(null);
  const [variantIndex, setVariantIndex] = React.useState(0);

  const openModal = (p: ProductFromAPI) => { setOpen(p); setVariantIndex(0); };
  const closeModal = () => setOpen(null);

  const fbUrl = (settings.facebook_url || settings.facebook || '').toString();
  const zaloPhone = (settings.zalo_phone || settings.contact_phone || '').toString().replace(/[^+\d]/g, '');

  return (
    <section className="py-12 section-blue">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">{title}</h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {products.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="cursor-pointer select-none" onClick={() => openModal(product)}>
                  <div className="aspect-w-1 aspect-h-1 mb-4">
                    <div
                      className="w-full h-48 bg-cover bg-center rounded-lg overflow-hidden"
                      style={{ backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : 'linear-gradient(45deg,#2196F3,#21CBF3)' }}
                    >
                      <div className="w-full h-full bg-gradient-to-b from-transparent to-black opacity-10 hover:opacity-20 transition-opacity" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-1 line-clamp-1">{product.name}</h3>
                  {(product.shortDesc || product.description) && (
                    <p className="text-gray-medium text-sm line-clamp-2 mb-2">{product.shortDesc || product.description}</p>
                  )}
                  <div className="mb-3">
                    {product.variantOptions && product.variantOptions.length > 1 ? (
                      <span className="text-primary font-bold text-lg">
                        Giá từ {(product.variantOptions.map(v => Number(v.price)).reduce((m, p) => Math.min(m, isNaN(p) ? m : p), Number.MAX_SAFE_INTEGER) || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    ) : product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex items-center">
                        <span className="text-primary font-bold text-lg">{product.price.toLocaleString('vi-VN')} ₫</span>
                        <span className="text-gray-medium text-sm line-through ml-2">{product.originalPrice.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-lg">{product.price.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </div>
                </div>
                <button className="btn w-full py-2 text-sm" onClick={() => openModal(product)}>Xem chi tiết</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><p className="text-gray-medium">Không có sản phẩm nào</p></div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
            <div className="bg-white max-w-xl w-full rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dark line-clamp-1">{open.name}</h3>
                <button aria-label="Đóng" className="text-dark" onClick={closeModal}>×</button>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="w-full h-52 bg-cover bg-center rounded" style={{ backgroundImage: open.imageUrl ? `url(${open.imageUrl})` : 'linear-gradient(45deg,#2196F3,#21CBF3)' }} />
                </div>
                <div>
                  {open.shortDesc && (
                    <p className="text-sm text-gray-medium mb-3">{open.shortDesc}</p>
                  )}
                  {open.description && (
                    <div className="text-sm text-dark whitespace-pre-line mb-3">{open.description}</div>
                  )}
                  {open.variantOptions && open.variantOptions.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-sm text-dark mb-1">Phiên bản/biến thể</label>
                      <select className="input" value={variantIndex} onChange={(e) => setVariantIndex(parseInt(e.target.value))}>
                        {open.variantOptions.map((v, idx) => (
                          <option key={idx} value={idx}>{v.name || `Gói ${idx + 1}`} - {v.price.toLocaleString('vi-VN')} ₫</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    {(() => {
                      const v = open.variantOptions && open.variantOptions[variantIndex];
                      const price = v ? v.price : open.price;
                      const original = v && v.originalPrice ? v.originalPrice : open.originalPrice || undefined;
                      return original && original > price ? (
                        <div className="flex items-center">
                          <span className="text-primary font-bold text-lg">{price.toLocaleString('vi-VN')} ₫</span>
                          <span className="text-gray-medium text-sm line-through ml-2">{original.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      ) : (
                        <span className="text-primary font-bold text-lg">{price.toLocaleString('vi-VN')} ₫</span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    {zaloPhone && (
                      <a href={`https://zalo.me/${zaloPhone}`} target="_blank" rel="noopener noreferrer" className="btn brand-zalo text-base py-3 px-4 w-full sm:w-auto">Mua qua Zalo</a>
                    )}
                    {fbUrl && fbUrl !== '#' && (
                      <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="btn brand-facebook text-base py-3 px-4 w-full sm:w-auto">Mua qua Facebook</a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t text-right"><button className="btn" onClick={closeModal}>Đóng</button></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
