import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '../services/publicApi';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collections, setCollections] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>(null);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]); // Активные фильтры особенностей

  const [priceMin, setPriceMin] = useState(searchParams.get('minPrice') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('maxPrice') || '');
  const [openSections, setOpenSections] = useState<string[]>(['КОЛЛЕКЦИЯ', 'ЦЕНА', 'ОСОБЕННОСТИ']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colData, filterData, settingsData] = await Promise.all([
        publicApi.getCollections(),
        publicApi.getFilters(),
        publicApi.getFilterSettings()
      ]);
      setCollections(colData);
      setFilters(filterData);
      setPriceRanges(settingsData.priceRanges || []);
      setEnabledFeatures(settingsData.enabledFeatures || []);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const toggleSection = (title: string) => {
    setOpenSections(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const handleCollectionChange = (value: string, checked: boolean) => {
    if (checked) searchParams.set('collection', value);
    else searchParams.delete('collection');
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const handleFilterChange = (key: string, value: string, checked: boolean) => {
    // Для множественного выбора параметров (например, features)
    if (key === 'features') {
      const current = searchParams.getAll('features');
      if (checked) {
        current.push(value);
      } else {
        const index = current.indexOf(value);
        if (index > -1) current.splice(index, 1);
      }
      searchParams.delete('features');
      current.forEach(v => searchParams.append('features', v));
    } else {
      // Одиночный выбор для остальных (механизм и т.д., как было)
      if (checked) searchParams.set(key, value);
      else searchParams.delete(key);
    }

    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const handlePriceRangeChange = (min: number, max: number, checked: boolean) => {
    if (checked) {
      setPriceMin(min.toString());
      setPriceMax(max > 0 ? max.toString() : '');
      searchParams.set('minPrice', min.toString());
      if (max > 0) searchParams.set('maxPrice', max.toString());
      else searchParams.delete('maxPrice');
    } else {
      setPriceMin('');
      setPriceMax('');
      searchParams.delete('minPrice');
      searchParams.delete('maxPrice');
    }
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceMin('');
    setPriceMax('');
  };

  const selectedCollection = searchParams.get('collection') || '';
  const currentMin = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
  const currentFeatures = searchParams.getAll('features');

  return (
    <aside className="w-full lg:w-80 bg-white">
      <div className="pb-6 border-b border-black/10">
        <h2 className="text-xl font-bold tracking-tight uppercase">Фильтры</h2>
      </div>

      <div className="divide-y divide-black/10">
        {/* Collections */}
        <div className="py-6">
          <button onClick={() => toggleSection('КОЛЛЕКЦИЯ')} className="flex items-center justify-between w-full mb-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Коллекция</h3>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openSections.includes('КОЛЛЕКЦИЯ') ? 'rotate-180' : ''}`} strokeWidth={2} />
          </button>
          {openSections.includes('КОЛЛЕКЦИЯ') && (
            <div className="space-y-3">
              {collections.map(collection => (
                <label key={collection.id} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCollection === collection.name}
                    onChange={e => handleCollectionChange(collection.name, e.target.checked)}
                    className="w-4 h-4 border-2 border-black/20 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                  />
                  <span className="text-sm text-black/70 group-hover:text-black flex-1 font-medium">{collection.name}</span>
                  {collection.watchCount > 0 && <span className="text-xs text-black/40">({collection.watchCount})</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range - Styled as Checkboxes */}
        <div className="py-6">
          <button onClick={() => toggleSection('ЦЕНА')} className="flex items-center justify-between w-full mb-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Цена</h3>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openSections.includes('ЦЕНА') ? 'rotate-180' : ''}`} strokeWidth={2} />
          </button>

          {openSections.includes('ЦЕНА') && (
            <div className="space-y-4">
              {priceRanges.length > 0 && (
                <div className="space-y-3 mb-4">
                  {priceRanges.map(range => (
                    <label key={range.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={currentMin === range.min}
                        onChange={e => handlePriceRangeChange(range.min, range.max, e.target.checked)}
                        className="w-4 h-4 border-2 border-black/20 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                      />
                      <span className="text-sm text-black/70 group-hover:text-black flex-1 font-medium">{range.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Manual Input */}
              <div className="flex items-center space-x-3 pt-2 border-t border-black/5">
                <input type="number" placeholder="От" value={priceMin} onChange={e => {
                  setPriceMin(e.target.value);
                  const timer = setTimeout(() => {
                    if (e.target.value) searchParams.set('minPrice', e.target.value);
                    else searchParams.delete('minPrice');
                    setSearchParams(searchParams);
                  }, 500);
                  return () => clearTimeout(timer);
                }} className="w-full px-3 py-2 border-2 border-black/20 text-sm focus:outline-none focus:border-[#C8102E]" />
                <span className="text-black/40">—</span>
                <input type="number" placeholder="До" value={priceMax} onChange={e => {
                  setPriceMax(e.target.value);
                  const timer = setTimeout(() => {
                    if (e.target.value) searchParams.set('maxPrice', e.target.value);
                    else searchParams.delete('maxPrice');
                    setSearchParams(searchParams);
                  }, 500);
                  return () => clearTimeout(timer);
                }} className="w-full px-3 py-2 border-2 border-black/20 text-sm focus:outline-none focus:border-[#C8102E]" />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Features from Settings */}
        {enabledFeatures.length > 0 && (
          <div className="py-6">
            <button onClick={() => toggleSection('ОСОБЕННОСТИ')} className="flex items-center justify-between w-full mb-4">
              <h3 className="text-sm font-semibold tracking-wider uppercase">Особенности</h3>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openSections.includes('ОСОБЕННОСТИ') ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>
            {openSections.includes('ОСОБЕННОСТИ') && (
              <div className="space-y-3">
                {enabledFeatures.map(feature => (
                  <label key={feature} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentFeatures.includes(feature)}
                      onChange={e => handleFilterChange('features', feature, e.target.checked)}
                      className="w-4 h-4 border-2 border-black/20 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                    />
                    <span className="text-sm text-black/70 group-hover:text-black flex-1 font-medium">{feature}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Static Filters (Movement, etc.) */}
        {filters?.movements?.length > 0 && (
          <div className="py-6">
            <button onClick={() => toggleSection('МЕХАНИЗМ')} className="flex items-center justify-between w-full mb-4">
              <h3 className="text-sm font-semibold tracking-wider uppercase">Механизм</h3>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${openSections.includes('МЕХАНИЗМ') ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>
            {openSections.includes('МЕХАНИЗМ') && (
              <div className="space-y-3">
                {filters.movements.map((option: any) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                    <input type="checkbox" checked={searchParams.get('movement') === option.value} onChange={e => handleFilterChange('movement', option.value, e.target.checked)} className="w-4 h-4 border-2 border-black/20 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer" />
                    <span className="text-sm text-black/70 group-hover:text-black flex-1 font-medium">{option.label}</span>
                    <span className="text-xs text-black/40">({option.count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-6">
        <button onClick={clearFilters} className="text-sm text-[#C8102E] hover:underline font-medium tracking-wide uppercase">
          Сбросить все фильтры
        </button>
      </div>
    </aside>
  );
}