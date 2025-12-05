import React, { useEffect, useState } from 'react';
import { SaveIcon, PlusIcon, TrashIcon, GripVerticalIcon } from 'lucide-react';
import { api } from '../../services/api';
import { ImageUpload } from '../../components/admin/ImageUpload';

// --- Интерфейсы данных ---

interface BoutiqueHero {
  title: string;
  description: string;
  coverImage: string;
}

interface BoutiqueInfoBlock {
  heading: string;
  text: string;
  hours: string;
  image: string;
  imagePosition: 'left' | 'right';
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export function BoutiqueContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Состояния
  const [hero, setHero] = useState<BoutiqueHero>({
    title: 'ФЛАГМАНСКИЙ БУТИК',
    description: 'Погрузитесь в мир японского часового искусства в центре города.',
    coverImage: ''
  });

  const [infoBlock, setInfoBlock] = useState<BoutiqueInfoBlock>({
    heading: 'Атмосфера',
    text: 'Наш бутик — это не просто магазин, это пространство, где время замедляет свой ход...',
    hours: 'Пн-Вс: 10:00 - 22:00',
    image: '',
    imagePosition: 'right'
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await api.getBoutiquePageData();
      if (data) {
        setHero(data.hero);
        setInfoBlock(data.infoBlock);
        setServices(data.services || []);
        setGallery(data.gallery || []);
      }
    } catch (error) {
      console.error('Error fetching boutique content:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await api.updateBoutiquePageData({
        hero,
        infoBlock,
        services,
        gallery
      });
      alert('Контент страницы Бутик сохранен!');
    } catch (error) {
      console.error('Error saving boutique content:', error);
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // Services Helpers
  const addService = () => {
    setServices([
      ...services,
      { id: `temp-${Date.now()}`, title: '', description: '' }
    ]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceItem, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Gallery Helpers
  const addGalleryImage = () => {
    setGallery([...gallery, { id: `img-${Date.now()}`, url: '' }]);
  };

  const removeGalleryImage = (id: string) => {
    setGallery(gallery.filter(g => g.id !== id));
  };

  const updateGalleryImage = (id: string, url: string) => {
    setGallery(gallery.map(g => g.id === id ? { ...g, url } : g));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Страница «Бутик»
          </h1>
          <p className="text-black/60">
            Управление фото, текстами и сервисами бутика
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center space-x-2 bg-[#C8102E] hover:bg-[#A00D24] text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg"
        >
          <SaveIcon className="w-4 h-4" strokeWidth={2} />
          <span>Сохранить изменения</span>
        </button>
      </div>

      {/* 1. Hero Section */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">
          1. Главный экран (Hero)
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-2">Заголовок</label>
            <input
              type="text"
              value={hero.title}
              onChange={e => setHero({...hero, title: e.target.value})}
              className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none font-bold text-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-2">Описание</label>
            <textarea
              value={hero.description}
              onChange={e => setHero({...hero, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none resize-none"
            />
          </div>

          <ImageUpload
            value={hero.coverImage}
            onChange={url => setHero({...hero, coverImage: url})}
            label="Фоновое изображение"
            required
          />
        </div>
      </div>

      {/* 2. Info Block */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">
          2. Блок «О бутике»
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-2">Заголовок блока</label>
              <input
                type="text"
                value={infoBlock.heading}
                onChange={e => setInfoBlock({...infoBlock, heading: e.target.value})}
                className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none"
              />
            </div>
            <div>
               <label className="block text-sm font-medium tracking-wider uppercase mb-2">Часы работы</label>
               <input
                 type="text"
                 value={infoBlock.hours}
                 onChange={e => setInfoBlock({...infoBlock, hours: e.target.value})}
                 className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none"
                 placeholder="Пн-Вс: 10:00 - 22:00"
               />
            </div>
            <div>
               <label className="block text-sm font-medium tracking-wider uppercase mb-2">Расположение фото</label>
               <select
                 value={infoBlock.imagePosition}
                 onChange={e => setInfoBlock({...infoBlock, imagePosition: e.target.value as 'left' | 'right'})}
                 className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none"
               >
                 <option value="right">Справа</option>
                 <option value="left">Слева</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-2">Текст описания</label>
            <textarea
              value={infoBlock.text}
              onChange={e => setInfoBlock({...infoBlock, text: e.target.value})}
              rows={5}
              className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none resize-none"
            />
          </div>

          <ImageUpload
            value={infoBlock.image}
            onChange={url => setInfoBlock({...infoBlock, image: url})}
            label="Фотография интерьера"
          />
        </div>
      </div>

      {/* 3. Services List */}
      <div className="bg-white p-8 border-2 border-black/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight uppercase">
            3. Сервисы и услуги
          </h2>
          <button onClick={addService} className="flex items-center space-x-2 border-2 border-black hover:bg-black hover:text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all">
            <PlusIcon className="w-4 h-4" strokeWidth={2} />
            <span>Добавить услугу</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {services.map((service, index) => (
            <div key={service.id} className="p-4 border-2 border-black/10 bg-gray-50 flex gap-4 items-start">
              <span className="text-2xl font-bold text-black/20 select-none">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 space-y-4">
                <input
                  type="text"
                  placeholder="Название услуги (например: Подбор ремешка)"
                  value={service.title}
                  onChange={e => updateService(service.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none font-bold"
                />
                <textarea
                  placeholder="Краткое описание услуги..."
                  value={service.description}
                  onChange={e => updateService(service.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none resize-none text-sm"
                />
              </div>

              <button
                onClick={() => removeService(service.id)}
                className="p-2 text-black/40 hover:text-[#C8102E] hover:bg-red-50 transition-all self-center"
              >
                <TrashIcon className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          ))}
          {services.length === 0 && <p className="text-black/40 text-center italic">Список услуг пуст</p>}
        </div>
      </div>

      {/* 4. Gallery */}
      <div className="bg-white p-8 border-2 border-black/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight uppercase">
            4. Галерея бутика
          </h2>
          <button onClick={addGalleryImage} className="flex items-center space-x-2 border-2 border-black hover:bg-black hover:text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all">
            <PlusIcon className="w-4 h-4" strokeWidth={2} />
            <span>Добавить фото</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div key={item.id} className="relative group">
              <div className="border-2 border-black/10 bg-gray-50 p-2">
                <ImageUpload
                  value={item.url}
                  onChange={url => updateGalleryImage(item.id, url)}
                  label=""
                  height="h-48"
                />
              </div>
              <button
                onClick={() => removeGalleryImage(item.id)}
                className="absolute top-4 right-4 bg-white text-[#C8102E] p-2 shadow-md hover:bg-[#C8102E] hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}