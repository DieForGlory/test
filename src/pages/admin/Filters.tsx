import React, { useEffect, useState } from 'react';
import { SaveIcon, PlusIcon, TrashIcon, GripVerticalIcon, RefreshCwIcon } from 'lucide-react';
import { api } from '../../services/api';

// Добавьте этот метод в src/services/api.ts перед использованием:
// getUniqueFeatures() { return this.request('/api/products/features/unique'); }

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export function AdminFilters() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]); // Все доступные из товаров
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]); // Те, что выбрал админ
  const [fullSettings, setFullSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
    fetchFeatures();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setFullSettings(data);
      setPriceRanges(data.filterConfig?.priceRanges || []);
      setEnabledFeatures(data.filterConfig?.enabledFeatures || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      // Здесь нужно добавить метод в api.ts (см. ниже) или вызвать fetch напрямую
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/features/unique`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableFeatures(data);
    } catch (error) {
      console.error('Error fetching unique features:', error);
    }
  };

  const handleSave = async () => {
    if (!fullSettings) return;
    setSaving(true);
    try {
      const updatedSettings = {
        ...fullSettings,
        filterConfig: {
          priceRanges,
          enabledFeatures // Сохраняем выбранные фичи
        }
      };
      await api.updateSettings(updatedSettings);
      alert('✅ Настройки фильтров сохранены!');
    } catch (error) {
      console.error('Error saving filters:', error);
      alert('❌ Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (feature: string) => {
    if (enabledFeatures.includes(feature)) {
      setEnabledFeatures(enabledFeatures.filter(f => f !== feature));
    } else {
      setEnabledFeatures([...enabledFeatures, feature]);
    }
  };

  // ... (методы addPriceRange, removePriceRange, updatePriceRange остаются те же)
  const addPriceRange = () => {
    const newRange = { id: Date.now().toString(), label: '', min: 0, max: 0 };
    setPriceRanges([...priceRanges, newRange]);
  };
  const removePriceRange = (id: string) => {
    setPriceRanges(priceRanges.filter(r => r.id !== id));
  };
  const updatePriceRange = (id: string, updates: Partial<PriceRange>) => {
    setPriceRanges(priceRanges.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-8">
      {/* Header and Save Button ... (как было) */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Настройка фильтров</h1>
        <button onClick={handleSave} disabled={saving} className="bg-[#C8102E] text-white px-6 py-3 font-bold uppercase disabled:opacity-50">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Price Ranges Block ... (как было) */}
      <div className="bg-white p-8 border-2 border-black/10">
         <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold uppercase">Ценовые диапазоны</h2>
            <button onClick={addPriceRange}><PlusIcon className="w-5 h-5"/></button>
         </div>
         {/* ... (код рендера диапазонов) ... */}
         {priceRanges.map((range) => (
            <div key={range.id} className="flex gap-4 p-4 border mb-2">
               <input value={range.label} onChange={e => updatePriceRange(range.id, {label: e.target.value})} className="border p-2" placeholder="Название"/>
               <input type="number" value={range.min} onChange={e => updatePriceRange(range.id, {min: +e.target.value})} className="border p-2" placeholder="Мин"/>
               <input type="number" value={range.max} onChange={e => updatePriceRange(range.id, {max: +e.target.value})} className="border p-2" placeholder="Макс"/>
               <button onClick={() => removePriceRange(range.id)}><TrashIcon/></button>
            </div>
         ))}
      </div>

      {/* NEW: Features Selection Block */}
      <div className="bg-white p-8 border-2 border-black/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase">
              Фильтры по особенностям
            </h2>
            <p className="text-sm text-black/60 mt-1">
              Выберите характеристики из импортированных товаров, которые будут доступны в фильтре
            </p>
          </div>
          <button onClick={fetchFeatures} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
            <RefreshCwIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Обновить список</span>
          </button>
        </div>

        {availableFeatures.length === 0 ? (
          <p className="text-black/40">Особенности не найдены в товарах. Импортируйте товары с заполненной колонкой "features".</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFeatures.map(feature => (
              <label key={feature} className="flex items-center space-x-3 p-3 border border-gray-200 hover:border-[#C8102E] cursor-pointer transition-colors bg-gray-50">
                <input
                  type="checkbox"
                  checked={enabledFeatures.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="w-5 h-5 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                />
                <span className="text-sm font-medium">{feature}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}