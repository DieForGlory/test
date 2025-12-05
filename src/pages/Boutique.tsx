import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, MapPinIcon, PhoneIcon, MailIcon, ArrowRightIcon } from 'lucide-react';
import { publicApi } from '../services/publicApi';
import { useSettings } from '../contexts/SettingsContext';

export function Boutique() {
  const { site } = useSettings();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await publicApi.getBoutiqueContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading boutique content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';
    if (!formData.date) newErrors.date = 'Выберите дату';
    if (!formData.time) newErrors.time = 'Выберите время';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await publicApi.createBooking({
        ...formData,
        boutique: site.name
      });
      alert(`✅ Спасибо! Ваша запись #${response.booking_number} принята.\n\nМы свяжемся с вами для подтверждения.`);
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        message: ''
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('❌ Ошибка при отправке заявки. Пожалуйста, попробуйте снова или позвоните нам.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback, если контент не загрузился, но загрузка завершена
  if (!content) return null;

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Фоновое изображение (опционально, если загружено в админке) */}
        {content.hero?.coverImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={content.hero.coverImage}
              alt={content.hero.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}

        {/* Оригинальные декоративные линии */}
        <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
              Посетите нас
            </p>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6 sm:mb-8 whitespace-pre-line">
            {content.hero?.title || 'БУТИК\nORIENT'}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl font-normal text-white/70 max-w-2xl leading-relaxed">
            {content.hero?.description || 'Откройте для себя мир японского часового мастерства в нашем эксклюзивном бутике.'}
          </p>
        </div>
      </section>

      {/* Boutique Info Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className={`relative aspect-[4/3] overflow-hidden ${content.infoBlock?.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
              <img
                src={content.infoBlock?.image || 'https://via.placeholder.com/800x600'}
                alt={site.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className={`space-y-6 sm:space-y-8 ${content.infoBlock?.imagePosition === 'right' ? 'lg:order-1' : ''}`}>
              <div>
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
                  <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                    {content.infoBlock?.heading || 'Наша локация'}
                  </p>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4 sm:mb-6">
                  {site.name}
                </h2>

                {/* Дополнительный текст из админки (если есть) */}
                {content.infoBlock?.text && (
                  <p className="text-black/70 mb-6 leading-relaxed">
                    {content.infoBlock.text}
                  </p>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-4 p-4 sm:p-6 border-2 border-black/10">
                  <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8102E] flex-shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <p className="text-xs tracking-wider uppercase font-semibold text-black/50 mb-2">
                      Адрес
                    </p>
                    <p className="text-sm sm:text-base text-black">
                      {site.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 sm:p-6 border-2 border-black/10">
                  <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8102E] flex-shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <p className="text-xs tracking-wider uppercase font-semibold text-black/50 mb-2">
                      Телефон
                    </p>
                    <p className="text-sm sm:text-base text-black">
                      {site.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 sm:p-6 border-2 border-black/10">
                  <MailIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8102E] flex-shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <p className="text-xs tracking-wider uppercase font-semibold text-black/50 mb-2">
                      Email
                    </p>
                    <p className="text-sm sm:text-base text-black">
                      {site.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 sm:p-6 border-2 border-black/10">
                  <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8102E] flex-shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <p className="text-xs tracking-wider uppercase font-semibold text-black/50 mb-2">
                      Часы работы
                    </p>
                    <p className="text-sm sm:text-base text-black">
                      {content.infoBlock?.hours || 'Пн-Вс: 10:00 - 22:00'}
                    </p>
                  </div>
                </div>
              </div>

              {content.services && content.services.length > 0 && (
                <div className="pt-6 border-t border-black/10">
                  <p className="text-xs tracking-wider uppercase font-semibold text-black/50 mb-4">
                    Наши услуги
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {content.services.map((service: any, index: number) => (
                      <span key={index} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 text-xs sm:text-sm tracking-wide text-black border border-black/10">
                        {service.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="mb-12 sm:mb-16 text-center">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
              <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                Запись на визит
              </p>
              <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4 sm:mb-6">
              Забронируйте визит
            </h2>
            <p className="text-base sm:text-lg text-black/60 max-w-2xl mx-auto">
              Запишитесь на персональную консультацию и примерьте часы в
              комфортной обстановке
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 lg:p-12 border-2 border-black/10 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Имя <span className="text-[#C8102E]">*</span>
                </label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 border-2 ${errors.name ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="Ваше имя" disabled={submitting} />
                {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Телефон <span className="text-[#C8102E]">*</span>
                </label>
                <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 border-2 ${errors.phone ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="+998 90 123 45 67" disabled={submitting} />
                {errors.phone && <p className="text-red-500 text-xs mt-2">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Email <span className="text-[#C8102E]">*</span>
                </label>
                <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 border-2 ${errors.email ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="your@email.com" disabled={submitting} />
                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
              </div>

              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Дата <span className="text-[#C8102E]">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-black/40 pointer-events-none z-10" strokeWidth={2} />
                  <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} min={new Date().toISOString().split('T')[0]} className={`w-full max-w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-2 ${errors.date ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors appearance-none`} style={{
                  minWidth: 0,
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }} disabled={submitting} />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-2">{errors.date}</p>}
              </div>

              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Время <span className="text-[#C8102E]">*</span>
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-black/40 pointer-events-none z-10" strokeWidth={2} />
                  <input type="time" value={formData.time} onChange={e => handleInputChange('time', e.target.value)} className={`w-full max-w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-2 ${errors.time ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors appearance-none`} style={{
                  minWidth: 0,
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }} disabled={submitting} />
                </div>
                {errors.time && <p className="text-red-500 text-xs mt-2">{errors.time}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium tracking-wider uppercase mb-2 sm:mb-3">
                  Сообщение
                </label>
                <textarea value={formData.message} onChange={e => handleInputChange('message', e.target.value)} rows={4} className="w-full max-w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none transition-colors resize-none" placeholder="Расскажите, какие часы вас интересуют..." disabled={submitting} />
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4 pt-4">
              <button type="submit" disabled={submitting} className="bg-[#C8102E] hover:bg-[#A00D24] text-white px-12 sm:px-16 py-4 sm:py-5 text-xs sm:text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase inline-flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Отправка...</span>
                  </> : <>
                    <span>Отправить заявку</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </>}
              </button>

              <p className="text-xs text-black/50 text-center">
                Мы свяжемся с вами в течение 24 часов для подтверждения записи
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Gallery Section */}
      {content.gallery && content.gallery.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
            <div className="mb-12 sm:mb-16 text-center">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
                <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                  Наш бутик
                </p>
                <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Атмосфера премиум-класса
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {content.gallery.map((item: any, index: number) => (
                <div key={item.id || index} className="relative aspect-[4/3] overflow-hidden group">
                  <img src={item.url} alt={`Бутик Orient ${index + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}