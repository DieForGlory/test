import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../services/publicApi';
import { useSettings } from '../contexts/SettingsContext';
import { SEO } from '../components/SEO';
export function DeliveryPolicy() {
  const { site } = useSettings();
  const [data, setData] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const result = await publicApi.getPolicy('delivery');
        setData(result);
      } catch (error) {
        console.error('Error loading delivery policy:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full bg-white">
      <SEO
        title="Условия доставки и оплаты часов Orient в Узбекистане | Orient Watch Uzbekistan"
        description="Бесплатная доставка часов Orient по Ташкенту. Быстрая доставка по всему Узбекистану. Способы оплаты: Payme, Click, наличные."
      />
      <section className="relative bg-black text-white py-16 sm:py-24">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs tracking-[0.15em] text-white/50 font-medium mb-8 sm:mb-12">
            <Link to="/" className="hover:text-white transition-colors">
              ГЛАВНАЯ
            </Link>
            <span>/</span>
            <span className="text-white">ДОСТАВКА</span>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
              <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                УСЛОВИЯ ДОСТАВКИ
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none uppercase">
              {data.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-24">
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:uppercase prose-a:text-[#C8102E] hover:prose-a:text-[#A00D24]"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />

        {/* Contact CTA */}
        <section className="mt-16 sm:mt-24 text-center border-t border-black/10 pt-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 uppercase">
            Остались вопросы?
          </h2>
          <p className="text-black/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Свяжитесь с нами любым удобным способом, и мы с радостью ответим на
            все ваши вопросы о доставке и оплате.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${site.phone.replace(/\s+/g, '')}`}
              className="px-8 py-4 bg-[#C8102E] hover:bg-[#A00D24] text-white text-sm font-semibold uppercase tracking-wider transition-all"
            >
              Позвонить нам
            </a>
            <Link
              to="/boutique"
              className="px-8 py-4 border-2 border-black hover:bg-black hover:text-white text-sm font-semibold uppercase tracking-wider transition-all"
            >
              Посетить бутик
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}