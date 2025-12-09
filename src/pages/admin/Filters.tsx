import React, { useEffect, useState } from 'react';
import { SaveIcon, PlusIcon, TrashIcon, RefreshCwIcon } from 'lucide-react';
import { api } from '../../services/api';

// Интерфейс для диапазонов (используется и для цен, и для диаметров)
interface RangeConfig {
  id: string;
  label: string;
  min: number;
  max: number;
}

export function AdminFilters() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Состояния для диапазонов
  const [priceRanges, setPriceRanges] = useState<RangeConfig[]>([]);
  const [diameterRanges, setDiameterRanges] = useState<RangeConfig[]>([]); // <--- Новое состояние

  // Состояния для особенностей
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

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

      const config = data.filterConfig || {};
      setPriceRanges(config.priceRanges || []);
      setDiameterRanges(config.diameterRanges || []); // <--- Загружаем диаметры
      setEnabledFeatures(config.enabledFeatures || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/features/unique`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableFeatures(data);
      }
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
          diameterRanges, // <--- Сохраняем диаметры
          enabledFeatures
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

  // --- Handlers для Цен ---
  const addPriceRange = () => {
    const newRange = { id: `p-${Date.now()}`, label: '', min: 0, max: 0 };
    setPriceRanges([...priceRanges, newRange]);
  };
  const removePriceRange = (id: string) => {
    setPriceRanges(priceRanges.filter(r => r.id !== id));
  };
  const updatePriceRange = (id: string, updates: Partial<RangeConfig>) => {
    setPriceRanges(priceRanges.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // --- Handlers для Диаметров (НОВЫЕ) ---
  const addDiameterRange = () => {
    const newRange = { id: `d-${Date.now()}`, label: '', min: 0, max: 0 };
    setDiameterRanges([...diameterRanges, newRange]);
  };
  const removeDiameterRange = (id: string) => {
    setDiameterRanges(diameterRanges.filter(r => r.id !== id));
  };
  const updateDiameterRange = (id: string, updates: Partial<RangeConfig>) => {
    setDiameterRanges(diameterRanges.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const toggleFeature = (feature: string) => {
    if (enabledFeatures.includes(feature)) {
      setEnabledFeatures(enabledFeatures.filter(f => f !== feature));
    } else {
      setEnabledFeatures([...enabledFeatures, feature]);
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Настройка фильтров</h1>
          <p className="text-black/60">Управление диапазонами цен, размеров и характеристиками</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-[#C8102E] hover:bg-[#A00D24] text-white px-6 py-3 font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <SaveIcon className="w-5 h-5" />
          <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
        </button>
      </div>

      {/* 1. Price Ranges */}
      <div className="bg-white p-8 border-2 border-black/10">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold uppercase">Ценовые диапазоны</h2>
            <button onClick={addPriceRange} className="flex items-center space-x-2 text-sm font-bold uppercase hover:text-[#C8102E] transition-colors">
              <PlusIcon className="w-5 h-5"/> <span>Добавить</span>
            </button>
         </div>
         <div className="space-y-3">
           {priceRanges.map((range) => (
              <div key={range.id} className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                 <input
                    value={range.label}
                    onChange={e => updatePriceRange(range.id, {label: e.target.value})}
                    className="flex-1 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none min-w-[200px]"
                    placeholder="Название (например: До 1 млн)"
                 />
                 <div className="flex items-center gap-2">
                   <input
                      type="number"
                      value={range.min}
                      onChange={e => updatePriceRange(range.id, {min: Number(e.target.value)})}
                      className="w-28 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none"
                      placeholder="Мин"
                   />
                   <span className="text-black/40">—</span>
                   <input
                      type="number"
                      value={range.max}
                      onChange={e => updatePriceRange(range.id, {max: Number(e.target.value)})}
                      className="w-28 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none"
                      placeholder="Макс"
                   />
                 </div>
                 <button onClick={() => removePriceRange(range.id)} className="p-2 text-red-500 hover:bg-red-50 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                 </button>
              </div>
           ))}
           {priceRanges.length === 0 && <p className="text-black/40 italic">Диапазоны не заданы</p>}
         </div>
      </div>

      {/* 2. Diameter Ranges (НОВАЯ СЕКЦИЯ) */}
      <div className="bg-white p-8 border-2 border-black/10">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold uppercase">Диаметры корпуса (мм)</h2>
            <button onClick={addDiameterRange} className="flex items-center space-x-2 text-sm font-bold uppercase hover:text-[#C8102E] transition-colors">
              <PlusIcon className="w-5 h-5"/> <span>Добавить</span>
            </button>
         </div>
         <p className="text-sm text-black/60 mb-4">Настройте интервалы для фильтрации по размеру корпуса (например: 38-40 мм).</p>

         <div className="space-y-3">
           {diameterRanges.map((range) => (
              <div key={range.id} className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                 <input
                    value={range.label}
                    onChange={e => updateDiameterRange(range.id, {label: e.target.value})}
                    className="flex-1 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none min-w-[200px]"
                    placeholder="Название (например: 40-42 мм)"
                 />
                 <div className="flex items-center gap-2">
                   <input
                      type="number"
                      value={range.min}
                      onChange={e => updateDiameterRange(range.id, {min: Number(e.target.value)})}
                      className="w-28 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none"
                      placeholder="Мин"
                   />
                   <span className="text-black/40">—</span>
                   <input
                      type="number"
                      value={range.max}
                      onChange={e => updateDiameterRange(range.id, {max: Number(e.target.value)})}
                      className="w-28 px-4 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none"
                      placeholder="Макс"
                   />
                 </div>
                 <button onClick={() => removeDiameterRange(range.id)} className="p-2 text-red-500 hover:bg-red-50 transition-colors">
                    <TrashIcon className="w-5 h-5"/>
                 </button>
              </div>
           ))}
           {diameterRanges.length === 0 && <p className="text-black/40 italic">Диапазоны не заданы</p>}
         </div>
      </div>

      {/* 3. Features */}
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
          <p className="text-black/40">Особенности не найдены. Импортируйте товары или добавьте характеристики вручную.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableFeatures.map(feature => (
              <label key={feature} className={`flex items-center space-x-3 p-3 border-2 cursor-pointer transition-colors ${enabledFeatures.includes(feature) ? 'border-[#C8102E] bg-red-50' : 'border-gray-100 hover:border-black/20'}`}>
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