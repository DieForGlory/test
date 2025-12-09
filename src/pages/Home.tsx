import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { WatchShowcase } from '../components/WatchShowcase';
import { CollectionShowcase } from '../components/CollectionShowcase';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { publicApi } from '../services/publicApi';
import { SEO } from '../components/SEO'; // Добавлен импорт

interface HeritageContent {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  yearsText: string;
}

export function Home() {
  const [loading, setLoading] = useState(true);
  const [heritageContent, setHeritageContent] = useState<HeritageContent | null>(null);

  useEffect(() => {
    fetchHeritageContent();
  }, []);

  const fetchHeritageContent = async () => {
    try {
      const data = await publicApi.getHeritageSection();
      setHeritageContent(data);
    } catch (error) {
      console.error('Error fetching heritage content:', error);
      setHeritageContent({
        title: '75 лет\nмастерства',
        subtitle: 'С 1950 года',
        description: 'Orient создает механические часы высочайшего качества, объединяя традиционное японское мастерство с современными технологиями.',
        ctaText: 'Узнать историю',
        ctaLink: '/history',
        yearsText: '75'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <SEO
        title="Orient Watch Uzbekistan. Купить часы Orient в Ташкенте. Официальный дилер Orient Watch в Узбекистане."
        description="Оригинальные японские часы Orient в Узбекистане: коллекции, новинки, гарантия и бесплатная доставка по Ташкенту. Гарантия 2 года. Официальный дилер Orient Watch в Узбекистане."
      />
      <Hero />
      <WatchShowcase />
      <CollectionShowcase />

      {/* Heritage Banner */}
      <section className="bg-black text-white py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="line-draw absolute top-1/3 left-0 right-0"></div>
          <div className="line-draw absolute top-2/3 left-0 right-0" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : heritageContent ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-16 text-center space-y-8 sm:space-y-12 relative z-10">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
                <p className="text-xs tracking-[0.25em] text-[#C8102E] font-medium animate-fade-in uppercase">
                  {heritageContent.subtitle}
                </p>
                <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight animate-fade-in-up whitespace-pre-line">
                {heritageContent.title}
              </h2>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-normal text-white/80 leading-relaxed max-w-xl mx-auto animate-slide-in-right">
              {heritageContent.description}
            </p>
            <Link to={heritageContent.ctaLink} className="group inline-flex items-center space-x-3 sm:space-x-4 border-2 border-white px-8 sm:px-12 py-4 sm:py-5 text-xs sm:text-sm tracking-[0.2em] font-medium hover:bg-white hover:text-black hover:border-[#C8102E] transition-all duration-700 animate-fade-in uppercase">
              <span>{heritageContent.ctaText}</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={2} />
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}