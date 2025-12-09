import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, EyeIcon, DownloadIcon, UploadIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  inStock: boolean;
  createdAt: string;
  sku: string;
  brand?: string;
}

interface Collection {
  id: string;
  name: string;
  brand?: string;
}

export function AdminProducts() {
  const { currency } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const filterCollection = searchParams.get('collection') || 'all';
  const filterBrand = searchParams.get('brand') || 'all';
  const urlSearchQuery = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(urlSearchQuery);
  const [pagination, setPagination] = useState({ limit: 20, total: 0, totalPages: 1 });

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== urlSearchQuery) {
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          if (localSearch) newParams.set('search', localSearch);
          else newParams.delete('search');
          newParams.set('page', '1');
          return newParams;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchParams, urlSearchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filterCollection, filterBrand, urlSearchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
      };

      if (urlSearchQuery) params.search = urlSearchQuery;
      if (filterCollection !== 'all') params.collection = filterCollection;
      if (filterBrand !== 'all') params.brand = filterBrand;

      const response = await api.getProducts(params);

      setProducts(response.data || []);
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      });
      window.scrollTo(0, 0);
    }
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = e.target.value;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (newBrand === 'all') {
        newParams.delete('brand');
      } else {
        newParams.set('brand', newBrand);
        newParams.delete('collection');
      }
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollection = e.target.value;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (newCollection === 'all') newParams.delete('collection');
      else newParams.set('collection', newCollection);
      newParams.set('page', '1');
      return newParams;
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены?')) return;
    await api.deleteProduct(id);
    fetchProducts();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportProducts();
    } catch (e) {
      console.error(e);
      alert('Ошибка экспорта');
    }
    setExporting(false);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        await api.importProducts(file);
        alert('Импорт завершен!');
        fetchProducts();
      } catch (e) {
        console.error(e);
        alert('Ошибка импорта');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const filteredCollections = filterBrand === 'all'
    ? collections
    : collections.filter(c => c.brand === filterBrand || !c.brand);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Товары</h1>
          <p className="text-sm sm:text-base text-black/60">Всего товаров: {pagination.total}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           <button onClick={handleExport} disabled={exporting} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 uppercase font-bold text-sm flex items-center justify-center min-w-[40px]">
             {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <DownloadIcon className="w-4 h-4" />}
           </button>
           <button onClick={handleImportClick} disabled={importing} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 uppercase font-bold text-sm flex items-center justify-center min-w-[40px]">
             {importing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <UploadIcon className="w-4 h-4" />}
           </button>
           <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
           <Link to="/admin/products/new" className="bg-[#C8102E] hover:bg-[#A00D24] text-white px-4 py-2 uppercase font-bold text-sm flex items-center gap-2">
             <PlusIcon className="w-4 h-4" /> Добавить
           </Link>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 border-2 border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-10 pr-3 py-2.5 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none"
            />
          </div>

          <select
            value={filterBrand}
            onChange={handleBrandChange}
            className="px-3 py-2.5 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white"
          >
            <option value="all">Все бренды</option>
            <option value="Orient">Orient</option>
            <option value="Orient Star">Orient Star</option>
          </select>

          <select
            value={filterCollection}
            onChange={handleCollectionChange}
            className="px-3 py-2.5 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white"
          >
            <option value="all">Все коллекции</option>
            {filteredCollections.map(collection => (
              <option key={collection.id} value={collection.name}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden md:block bg-white border-2 border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">Товар</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">Бренд</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">Коллекция</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">Цена</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">Статус</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-black/60">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {products.length > 0 ? products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} className="w-12 h-12 object-cover bg-gray-100" />
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-black/50">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.brand || 'Orient'}</td>
                  <td className="px-6 py-4 text-sm font-medium">{product.collection}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{product.price.toLocaleString()} {currency.symbol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold uppercase ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.inStock ? 'В наличии' : 'Нет'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/product/${product.id}`} target="_blank" className="p-2 hover:bg-gray-100"><EyeIcon className="w-4 h-4" /></Link>
                      {/* ИСПРАВЛЕНО: Добавлен state для сохранения позиции */}
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        state={{ search: searchParams.toString() }}
                        className="p-2 hover:bg-gray-100"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-black/40">Товары не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация (Восстановлен дизайн с номерами) */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border-2 border-black/10">
          <p className="text-xs sm:text-sm text-black/60">
            Страница {currentPage} из {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all text-xs sm:text-sm font-medium uppercase tracking-wider disabled:opacity-50"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum = i + 1;

                    // Если страниц больше 5, используем "умный" сдвиг
                    if (pagination.totalPages > 5) {
                        // Рассчитываем стартовую страницу так, чтобы активная была по центру,
                        // но не выходила за границы начала (1) и конца списка
                        const startPage = Math.max(1, Math.min(currentPage - 2, pagination.totalPages - 4));
                        pageNum = startPage + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                currentPage === pageNum
                                    ? 'bg-black text-white border-black'
                                    : 'border-transparent hover:border-black'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 sm:px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all text-xs sm:text-sm font-medium uppercase tracking-wider disabled:opacity-50"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}