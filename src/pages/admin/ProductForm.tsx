import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'; // Добавлен useLocation
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
  specs: {
    movement: '',
    case: '',
    diameter: '',
    thickness: '',
    glass: '',
    waterResistance: '',
    powerReserve: '',
    bracelet: '',
    weight: '',
    warranty: '',
    madeIn: ''
  },
  inStock: true,
  stockQuantity: 0,
  sku: ''
};

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Получаем объект location
  const isEdit = !!id;

  // Формируем URL возврата с учетом сохраненных параметров поиска
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
        setFormData(prev => ({
          ...prev,
          collection: data[0].name
        }));
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await api.getProduct(id!);
      setFormData({
        ...data,
        features: data.features.length > 0 ? data.features : ['']
      });
    } catch (err) {
      setError('Ошибка загрузки товара');
      console.error(err);
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
      // Возвращаемся на список товаров, сохраняя фильтры
      navigate(backUrl);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения товара');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const addImage = (url: string) => {
    setFormData({
      ...formData,
      images: [...formData.images, url]
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={backUrl} className="p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {isEdit ? 'Редактировать товар' : 'Новый товар'}
            </h1>
            <p className="text-black/60 mt-1">
              {isEdit ? `ID: ${id}` : 'Создание нового товара'}
            </p>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700">
          {error}
        </div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
            Основная информация
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Название <span className="text-[#C8102E]">*</span>
              </label>
              <input type="text" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Kamasu Automatic Diver" required />
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Коллекция <span className="text-[#C8102E]">*</span>
              </label>
              <select value={formData.collection} onChange={e => setFormData({
              ...formData,
              collection: e.target.value
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white" required>
                {collections.length === 0 ? <option value="">Загрузка коллекций...</option> : <>
                    <option value="">Выберите коллекцию</option>
                    {collections.map(collection => <option key={collection.id} value={collection.name}>
                        {collection.name}
                      </option>)}
                  </>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Цена (₽) <span className="text-[#C8102E]">*</span>
              </label>
              <input type="number" value={formData.price} onChange={e => setFormData({
              ...formData,
              price: Number(e.target.value)
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="45900" min="0" required />
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                SKU <span className="text-[#C8102E]">*</span>
              </label>
              <input type="text" value={formData.sku} onChange={e => setFormData({
              ...formData,
              sku: e.target.value
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="RA-AA0004E19B" required />
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Количество на складе <span className="text-[#C8102E]">*</span>
              </label>
              <input type="number" value={formData.stockQuantity} onChange={e => setFormData({
              ...formData,
              stockQuantity: Number(e.target.value)
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="15" min="0" required />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({
                ...formData,
                inStock: e.target.checked
              })} className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wider uppercase">
                  В наличии
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({
                  ...formData,
                  description: e.target.value
                })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none resize-none"
                placeholder="Профессиональные дайверские часы..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
            Изображения
          </h2>

          <div className="space-y-6">
            <ImageUpload value={formData.image} onChange={url => setFormData({
            ...formData,
            image: url
          })} label="Главное изображение" required />

            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Дополнительные изображения
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((img, index) => <div key={index} className="relative border-2 border-black/10 p-2">
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-32 object-contain bg-gray-50" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-white border border-black hover:bg-red-50 hover:border-red-500">
                      <XIcon className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>)}
              </div>

              <ImageUpload value="" onChange={addImage} label="" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-8 border-2 border-black/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight uppercase">
              Характеристики
            </h2>
            <button type="button" onClick={addFeature} className="flex items-center space-x-2 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-all">
              <PlusIcon className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium uppercase tracking-wider">
                Добавить
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.features.map((feature, index) => <div key={index} className="flex gap-3">
                <input type="text" value={feature} onChange={e => updateFeature(index, e.target.value)} className="flex-1 px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="Автоматический механизм Orient F6922" />
                {formData.features.length > 1 && <button type="button" onClick={() => removeFeature(index)} className="p-3 border-2 border-black hover:bg-red-50 hover:border-red-500 transition-all">
                    <XIcon className="w-5 h-5" strokeWidth={2} />
                  </button>}
              </div>)}
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white p-8 border-2 border-black/10">
          <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
            Технические характеристики
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData.specs).map(([key, value]) => <div key={key}>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                  {key === 'movement' && 'Механизм'}
                  {key === 'case' && 'Корпус'}
                  {key === 'diameter' && 'Диаметр'}
                  {key === 'thickness' && 'Толщина'}
                  {key === 'glass' && 'Стекло'}
                  {key === 'waterResistance' && 'Водонепроницаемость'}
                  {key === 'powerReserve' && 'Запас хода'}
                  {key === 'bracelet' && 'Браслет'}
                  {key === 'weight' && 'Вес'}
                  {key === 'warranty' && 'Гарантия'}
                  {key === 'madeIn' && 'Производство'}
                </label>
                <input type="text" value={value} onChange={e => setFormData({
              ...formData,
              specs: {
                ...formData.specs,
                [key]: e.target.value
              }
            })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder={key === 'movement' ? 'Автоматический Orient F6922' : key === 'case' ? 'Нержавеющая сталь 316L' : key === 'diameter' ? '41.8 мм' : ''} />
              </div>)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link to={backUrl} className="px-8 py-4 border-2 border-black hover:bg-gray-50 transition-all text-sm font-semibold uppercase tracking-wider">
            Отмена
          </Link>
          <button type="submit" disabled={saving} className="px-8 py-4 bg-[#C8102E] hover:bg-[#A00D24] text-white text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Создать товар'}
          </button>
        </div>
      </form>
    </div>;
}