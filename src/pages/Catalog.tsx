import React, { useEffect, useState } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductCard } from '../components/ProductCard';
import { SlidersHorizontalIcon, XIcon, GridIcon, ListIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicApi } from '../services/publicApi';
import { useSettings } from '../contexts/SettingsContext';
import { SEO } from '../components/SEO'; // Добавлен импорт

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  isNew?: boolean;
}

export function Catalog() {
  const { currency } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const filters = {
    collection: searchParams.get('collection') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    brand: searchParams.get('brand') || '',
    gender: searchParams.get('gender') || '',
    minDiameter: searchParams.get('minDiameter') ? parseFloat(searchParams.get('minDiameter')!) : undefined,
    maxDiameter: searchParams.get('maxDiameter') ? parseFloat(searchParams.get('maxDiameter')!) : undefined,
    strapMaterial: searchParams.get('strapMaterial') || '',
    movement: searchParams.get('movement') || '',
    caseMaterial: searchParams.get('caseMaterial') || '',
    dialColor: searchParams.get('dialColor') || '',
    waterResistance: searchParams.get('waterResistance') || '',
    features: searchParams.getAll('features'),
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await publicApi.getProducts({ ...filters, sort: sortBy, limit: pagination.limit });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => setSearchParams({});

  const removeFilter = (key: string, value?: string) => {
    if (key === 'features' && value) {
      const current = searchParams.getAll('features');
      const newFeatures = current.filter(f => f !== value);
      searchParams.delete('features');
      newFeatures.forEach(f => searchParams.append('features', f));
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const activeFilters = Array.from(searchParams.entries()).filter(([key]) => !['page', 'limit', 'sort'].includes(key));

  return (
    <div className="w-full bg-white">
      <SEO
        title="Каталог часов Orient Watch – Все модели и официальные цены в Узбекистане | Orient Watch Uzbekistan"
        description="Каталог оригинальных часов Orient Watch Uzbekistan: механические, кварцевые, дайверы и классика. Купить с доставкой по Узбекистану. Гарантия 2 года. Официальный дилер Orient Watch в Узбекистане."
      />

      <section className="relative bg-black text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs tracking-[0.1em] text-white/50 font-medium mb-8 sm:mb-12">
            <Link to="/" className="hover:text-white transition-colors">ГЛАВНАЯ</Link>
            <span>/</span>
            <span className="text-white">КАТАЛОГ</span>
          </div>
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
              <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[#C8102E] font-medium uppercase">ВСЕ МОДЕЛИ</p>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
              КАТАЛОГ<br />ЧАСОВ
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12 pb-4 sm:pb-6 border-b border-black/10">
              <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center space-x-2 border-2 border-black px-4 sm:px-6 py-2 sm:py-3 hover:bg-black hover:text-white transition-all w-full justify-center">
                  <SlidersHorizontalIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-xs sm:text-sm tracking-[0.15em] font-medium uppercase">Фильтры</span>
                </button>
                <div className="hidden sm:flex items-center space-x-3">
                  <p className="text-sm font-medium text-black">{pagination.total} моделей</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <div className="hidden md:flex items-center border border-black/20">
                  <button onClick={() => setViewMode('grid')} className={`p-3 ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}><GridIcon className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}><ListIcon className="w-5 h-5" /></button>
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs sm:text-sm tracking-[0.1em] font-medium border-2 border-black px-3 sm:px-6 py-2 sm:py-3 focus:outline-none bg-white uppercase flex-1">
                  <option value="popular">Популярные</option>
                  <option value="price-asc">Цена ↑</option>
                  <option value="price-desc">Цена ↓</option>
                  <option value="newest">Новинки</option>
                  <option value="name">А-Я</option>
                </select>
              </div>
            </div>

            {activeFilters.length > 0 && <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {activeFilters.map(([key, value]) => {
                  let label = value;
                  if (key === 'minPrice') label = `От ${value} ${currency.symbol}`;
                  else if (key === 'maxPrice') label = `До ${value} ${currency.symbol}`;
                  else if (key === 'minDiameter') label = `D от ${value} мм`;
                  else if (key === 'maxDiameter') label = `D до ${value} мм`;
                  else if (key === 'features') label = `Особенность: ${value}`;
                  return (
                    <button key={`${key}-${value}`} onClick={() => removeFilter(key, value)} className="flex items-center space-x-2 bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-[0.15em] font-medium hover:bg-[#C8102E] transition-colors">
                      <span className="uppercase">{label}</span>
                      <XIcon className="w-3 h-3" strokeWidth={2} />
                    </button>
                  );
                })}
                <button onClick={clearFilters} className="text-[10px] sm:text-xs tracking-[0.15em] font-medium text-[#C8102E] hover:underline uppercase">Очистить все</button>
              </div>}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-black/60 mb-4">Товары не найдены</p>
                <button onClick={clearFilters} className="text-[#C8102E] hover:underline font-medium">Сбросить фильтры</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 sm:gap-8 lg:gap-12 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product, index) => <ProductCard key={product.id} {...product} index={index} />)}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="mt-12 sm:mt-20 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => handlePageChange(page)} className={`px-4 py-2 border-2 transition-all ${pagination.page === page ? 'bg-[#C8102E] text-white border-[#C8102E]' : 'border-black/20 hover:border-black'}`}>
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showFilters && <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto">
            <div className="p-6 sm:p-8"><FilterSidebar /></div>
            <div className="sticky bottom-0 bg-white border-t border-black/10 p-6 sm:p-8">
              <button onClick={() => setShowFilters(false)} className="w-full bg-[#C8102E] text-white py-3 sm:py-4 text-xs sm:text-sm tracking-[0.2em] font-semibold uppercase">Закрыть</button>
            </div>
          </div>
        </div>}
    </div>
  );
}