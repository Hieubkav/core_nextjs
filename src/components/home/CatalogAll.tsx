"use client";

import React from 'react';
import ProductGrid from '@/components/home/ProductGrid';

interface CategoryFromAPI {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
}

interface ProductFromAdmin {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  categoryId: number;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string; slug: string } | null;
  variants?: { name?: string; price: number; originalPrice?: number | null; isDefault?: boolean }[];
  images?: { image: { url: string } }[];
}

type SortKey = 'createdAt' | 'name' | 'sortOrder' | 'price';

interface CatalogAllProps {
  settings?: Record<string, string>;
}

const CatalogAll: React.FC<CatalogAllProps> = ({ settings = {} }) => {
  const [categories, setCategories] = React.useState<CategoryFromAPI[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [search, setSearch] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = React.useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [minPrice, setMinPrice] = React.useState<string>('');
  const [maxPrice, setMaxPrice] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(24);

  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  // Debounce search
  const debouncedSearch = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load full categories (home route returns productCount)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/home/categories?limit=9999`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    })();
  }, []);

  // Load products from admin API with pagination
  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search.trim()) params.set('search', search.trim());
      if (categoryId) params.set('categoryId', String(categoryId));
      const safeSortBy = sortBy === 'price' ? 'createdAt' : sortBy;
      params.set('sortBy', safeSortBy);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!json || json.success === false) throw new Error(json?.error || 'Load products failed');

      const items: ProductFromAdmin[] = json.data || [];
      const mapped = items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description ?? null,
        shortDesc: p.shortDesc ?? null,
        features: null,
        categoryId: p.categoryId,
        sortOrder: p.sortOrder,
        isVisible: true,
        isPublished: p?.status === 'active',
        createdAt: String(p.createdAt),
        updatedAt: String(p.updatedAt),
        category: p.category || null,
        price: p.variants && p.variants.length > 0 ? Number(p.variants[0].price) : 0,
        originalPrice: p.variants && p.variants.length > 0 ? (p.variants[0].originalPrice ?? null) : null,
        imageUrl: p.images && p.images.length > 0 ? p.images[0].image.url : null,
        rating: 0,
        reviewCount: 0,
        variantOptions: Array.isArray(p.variants)
          ? p.variants.map((v) => ({ name: v.name, price: Number(v.price), originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined }))
          : [],
      }));

      setProducts(mapped);
      setTotalPages(json.pagination?.pages || 1);
      setTotalItems(json.pagination?.total || mapped.length);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryId, sortBy, sortOrder]);

  React.useEffect(() => { loadProducts(); }, [loadProducts]);

  // Derived view with local price filter/sort
  const viewProducts = React.useMemo(() => {
    const getPrice = (p: any) => {
      if (p.variantOptions && p.variantOptions.length > 0) {
        return p.variantOptions.reduce((m: number, v: any) => Math.min(m, Number(v.price) || 0), Number.MAX_SAFE_INTEGER);
      }
      return Number(p.price) || 0;
    };

    let arr = [...products];
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    if (min !== undefined) arr = arr.filter((p) => getPrice(p) >= min);
    if (max !== undefined) arr = arr.filter((p) => getPrice(p) <= max);
    if (sortBy === 'price') {
      arr.sort((a, b) => (sortOrder === 'asc' ? getPrice(a) - getPrice(b) : getPrice(b) - getPrice(a)));
    }
    return arr;
  }, [products, minPrice, maxPrice, sortBy, sortOrder]);

  // Update search with debounce
  const onSearchChange = (v: string) => {
    setSearch(v);
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => { setPage(1); loadProducts(); }, 350);
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">Tất cả sản phẩm</h2>

        {categories.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <button onClick={() => { setCategoryId(undefined); setPage(1); }} className={`px-3 py-1 rounded-full border ${categoryId ? 'border-gray-300 text-dark' : 'border-primary text-primary'}`}>Tất cả</button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setCategoryId(c.id); setPage(1); }} className={`px-3 py-1 rounded-full border ${categoryId === c.id ? 'border-primary text-primary' : 'border-gray-300 text-dark'}`} title={c.name}>{c.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input className="input" placeholder="Tìm sản phẩm..." defaultValue={search} onChange={(e) => onSearchChange(e.target.value)} />
          <div className="flex gap-2">
            <input type="number" min={0} className="input" placeholder="Giá từ" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <input type="number" min={0} className="input" placeholder="Đến" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="flex gap-2 md:justify-end">
            <select className="input max-w-56" value={`${sortBy}:${sortOrder}`} onChange={(e) => { const [k, o] = e.target.value.split(':'); setSortBy(k as SortKey); setSortOrder(o as 'asc' | 'desc'); setPage(1); }}>
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
              <option value="name:asc">Tên A-Z</option>
              <option value="name:desc">Tên Z-A</option>
              <option value="sortOrder:asc">Thứ tự</option>
              <option value="price:asc">Giá tăng dần</option>
              <option value="price:desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {error && <div className="text-danger mb-4">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-medium py-10">Đang tải sản phẩm...</div>
        ) : (
          <ProductGrid products={viewProducts as any} title="Sản phẩm" settings={settings} />
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-gray-medium text-sm">{totalItems} sản phẩm</div>
          <div className="flex items-center gap-2">
            <button className="btn py-1 px-3" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</button>
            <span className="text-dark text-sm">Trang {page}/{totalPages}</span>
            <button className="btn py-1 px-3" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Sau</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogAll;
