import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { publicApi } from '../services/publicApi';

interface HeroContent {
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string; // <--- Добавлено
  ctaText: string;
  ctaLink: string;
  // ... цвета ...
  buttonTextColor?: string;
  buttonBgColor?: string;
  buttonHoverTextColor?: string;
  buttonHoverBgColor?: string;
}

export function Hero() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<HeroContent | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const data = await publicApi.getHeroContent();
      setContent(data);
    } catch (error) {
      console.error('Error fetching hero content:', error);
      // Fallback
      setContent({
        title: 'НАЙДИТЕ\nИДЕАЛЬНЫЕ\nЧАСЫ.',
        subtitle: 'Японское мастерство и точность в каждой детали',
        image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1600&q=80',
        mobileImage: '',
        ctaText: 'Смотреть коллекцию',
        ctaLink: '/catalog',
        // ... цвета ...
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null; // Или спиннер
  if (!content) return null;

  // Динамические стили кнопки (как в предыдущем шаге)
  const buttonStyle = {
    color: isHovered
      ? (content.buttonHoverTextColor || '#000000')
      : (content.buttonTextColor || '#FFFFFF'),
    backgroundColor: isHovered
      ? (content.buttonHoverBgColor || '#FFFFFF')
      : (content.buttonBgColor || 'transparent'),
    borderColor: isHovered
      ? (content.buttonHoverBgColor || '#FFFFFF')
      : (content.buttonTextColor || '#FFFFFF'),
  };

  return (
    <section className="relative w-full min-h-screen flex items-center bg-black overflow-hidden">
      {/* Background Image Layer with Picture tag for Art Direction */}
      <div className="absolute inset-0 z-0">
        <picture>
          {/* Если есть мобильное изображение, показываем его на экранах < 768px */}
          {content.mobileImage && (
            <source media="(max-width: 768px)" srcSet={content.mobileImage} />
          )}
          <img
            src={content.image}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-70"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-20 lg:py-0">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 sm:w-16 h-0.5 bg-[#C8102E]"></div>
              <p className="text-xs sm:text-sm tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                ORIENT WATCH
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] text-white whitespace-pre-line shadow-sm">
              {content.title}
            </h1>
          </div>

          <p className="text-base sm:text-lg lg:text-xl font-normal text-white/90 leading-relaxed max-w-xl shadow-sm">
            {content.subtitle}
          </p>

          <div className="pt-4">
            <Link
              to={content.ctaLink}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={buttonStyle}
              className="group inline-flex items-center space-x-4 border-2 px-8 sm:px-10 py-4 text-xs sm:text-sm tracking-[0.2em] font-medium transition-all duration-500 uppercase"
            >
              <span>{content.ctaText}</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}