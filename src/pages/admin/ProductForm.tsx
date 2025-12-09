import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react';
import { api } from '../../services/api';
import { ImageUpload } from '../../components/admin/ImageUpload';

interface ProductFormData {
  name: string;
  collection: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  stockQuantity: number;
  sku: string;

  // Все фильтры как основные поля
  brand: string;
  gender: string;
  caseDiameter: number;
  strapMaterial: string;
  movement: string;
  caseMaterial: string;
  dialColor: string;
  waterResistance: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

const INITIAL_FORM_DATA: ProductFormData = {
  name: '',
  collection: '',
  price: 0,
  image: '',
  images: [],
  description: '',
  features: [''],
  // В specs оставляем только то, чего нет в фильтрах
  specs: {
    glass: '',
    powerReserve: '',
    clasp: '', // Застежка
    madeIn: '',
    weight: '',
    thickness: ''
  },
  inStock: true,
  stockQuantity: 0,
  sku: '',
  // Дефолтные значения фильтров
  brand: 'Orient',
  gender: '',
  caseDiameter: 0,
  strapMaterial: '',
  movement: '',
  caseMaterial: '',
  dialColor: '',
  waterResistance: ''
};

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;

  const backUrl = `/admin/products${location.state?.search ? `?${location.state.search}` : ''}`;

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCollections();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data.filter((c: Collection) => c.active));
      if (!isEdit && data.length > 0) {
        setFormData(prev => ({ ...prev, collection: data[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await api.getProduct(id!);
      setFormData({
        ...INITIAL_FORM_DATA, // Merge with defaults to ensure all fields exist
        ...data,
        features: data.features.length > 0 ? data.features : [''],
        // Fallback for null values
        brand: data.brand || 'Orient',
        gender: data.gender || '',
        caseDiameter: data.caseDiameter || 0,
        strapMaterial: data.strapMaterial || '',
        movement: data.movement || '',
        caseMaterial: data.caseMaterial || '',
        dialColor: data.dialColor || '',
        waterResistance: data.waterResistance || '',
        // Specs merge (keep existing keys + new from DB)
        specs: { ...INITIAL_FORM_DATA.specs, ...(data.specs || {}) }
      });
    } catch (err) {
      setError('Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (isEdit) {
        await api.updateProduct(id!, cleanedData);
      } else {
        await api.createProduct(cleanedData);
      }
      navigate(backUrl);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (index: number) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addImage = (url: string) => setFormData({ ...formData, images: [...formData.images, url] });
  const removeImage = (index: number) => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={backUrl} className="p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{isEdit ? 'Редактировать' : 'Новый'} товар</h1>
            <p className="text-black/60 mt-1">{isEdit ? `ID: ${id}` : 'Создание товара'}</p>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">Основная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Название <span className="text-[#C8102E]">*</span></label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Коллекция <span className="text-[#C8102E]">*</span></label>
              <select value={formData.collection} onChange={e => setFormData({ ...formData, collection: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white" required>
                <option value="">Выберите...</option>
                {collections.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Цена (₽) <span className="text-[#C8102E]">*</span></label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">SKU <span className="text-[#C8102E]">*</span></label>
              <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Склад</label>
              <input type="number" value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({ ...formData, inStock: e.target.checked })} className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wider uppercase">В наличии</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Описание</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none resize-none" />
            </div>
          </div>

          {/* NEW FILTERS SECTION (CONSOLIDATED) */}
          <div className="mt-8 pt-8 border-t-2 border-black/10">
            <h3 className="text-lg font-bold tracking-tight mb-6 uppercase text-[#C8102E]">Параметры для фильтров (Основные)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Бренд</label>
                <select value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white">
                  <option value="Orient">Orient</option>
                  <option value="Orient Star">Orient Star</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Гендер</label>
                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white">
                  <option value="">Не указано</option>
                  <option value="Мужские">Мужские</option>
                  <option value="Женские">Женские</option>
                  <option value="Унисекс">Унисекс</option>
                </select>
              </div>

              {/* Diameter */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Диаметр корпуса (мм)</label>
                <input type="number" step="0.1" value={formData.caseDiameter || ''} onChange={e => setFormData({ ...formData, caseDiameter: parseFloat(e.target.value) })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="41.5" />
              </div>

              {/* Strap Material */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Материал ремешка</label>
                <input type="text" value={formData.strapMaterial} onChange={e => setFormData({ ...formData, strapMaterial: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Кожа, Сталь" />
              </div>

              {/* Movement */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Механизм</label>
                <input type="text" value={formData.movement} onChange={e => setFormData({ ...formData, movement: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Автоматический, Кварц" />
              </div>

              {/* Case Material */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Материал корпуса</label>
                <input type="text" value={formData.caseMaterial} onChange={e => setFormData({ ...formData, caseMaterial: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Нержавеющая сталь" />
              </div>

              {/* Dial Color */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Цвет циферблата</label>
                <input type="text" value={formData.dialColor} onChange={e => setFormData({ ...formData, dialColor: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Синий, Черный" />
              </div>

              {/* Water Resistance */}
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Водозащита</label>
                <input type="text" value={formData.waterResistance} onChange={e => setFormData({ ...formData, waterResistance: e.target.value })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="200m, 50m" />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">Изображения</h2>
          <div className="space-y-6">
            <ImageUpload value={formData.image} onChange={url => setFormData({ ...formData, image: url })} label="Главное изображение" required />
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">Дополнительные</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((img, index) => <div key={index} className="relative border-2 border-black/10 p-2">
                    <img src={img} className="w-full h-32 object-contain" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-white border border-black hover:bg-red-50"><XIcon className="w-3 h-3" /></button>
                  </div>)}
              </div>
              <ImageUpload value="" onChange={addImage} label="" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-8 border-2 border-black/10">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight uppercase">Характеристики (список)</h2>
            <button type="button" onClick={addFeature} className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all"><PlusIcon className="w-4 h-4" /><span>Добавить</span></button>
          </div>
          <div className="space-y-3">
            {formData.features.map((feature, index) => <div key={index} className="flex gap-3">
                <input type="text" value={feature} onChange={e => updateFeature(index, e.target.value)} className="flex-1 px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
                <button type="button" onClick={() => removeFeature(index)} className="p-3 border-2 border-black hover:bg-red-50"><XIcon className="w-5 h-5" /></button>
              </div>)}
          </div>
        </div>

        {/* Specs (Дополнительные) */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">Прочие спецификации</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData.specs).map(([key, value]) => <div key={key}>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">{key}</label>
                <input type="text" value={value} onChange={e => setFormData({ ...formData, specs: { ...formData.specs, [key]: e.target.value } })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
              </div>)}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to={backUrl} className="px-8 py-4 border-2 border-black hover:bg-gray-50 uppercase font-semibold">Отмена</Link>
          <button type="submit" disabled={saving} className="px-8 py-4 bg-[#C8102E] hover:bg-[#A00D24] text-white uppercase font-semibold disabled:opacity-50">{saving ? 'Сохранение...' : 'Сохранить'}</button>
        </div>
      </form>
    </div>;
}