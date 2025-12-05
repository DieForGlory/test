import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  isNew?: boolean;
}

interface HeroCarouselProps {
  products: Product[];
}

export function HeroCarousel({
  products
}: HeroCarouselProps) {
  const {
    formatPrice
  } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality - desktop only
  useEffect(() => {
    if (isHovered || window.innerWidth < 1024) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % products.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, products.length]);

  // Smooth scroll to current index - desktop only
  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const gap = 32;
    const visibleCards = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    const cardWidth = (containerWidth - gap * (visibleCards - 1)) / visibleCards;
    const targetScroll = (cardWidth + gap) * currentIndex;
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const navigate = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setCurrentIndex(prev => (prev + 1) % products.length);
    } else {
      setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
    }
  };

  return <div className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Navigation Arrows - Desktop only */}
      <div className="hidden lg:block">
        <button onClick={() => navigate('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm border border-black/10 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-700 -translate-x-4 group-hover:translate-x-0" aria-label="Предыдущий">
          <ChevronLeftIcon className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <button onClick={() => navigate('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm border border-black/10 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all duration-700 translate-x-4 group-hover:translate-x-0" aria-label="Следующий">
          <ChevronRightIcon className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Carousel Container */}
      <div ref={scrollContainerRef} className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-4 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 lg:overflow-hidden" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch'
    }}>
        {products.map((product, index) => <div key={`${product.id}-${index}`} className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
            <Link to={`/product/${product.id}`} className="group/card block hover-lift">
              {/* Large Card */}
              <div className="relative aspect-square bg-white mb-6 sm:mb-8 overflow-hidden border border-black/5 group-hover/card:border-black/10 transition-all duration-700">
                {product.isNew && <span className="absolute top-4 sm:top-6 lg:top-8 left-4 sm:left-6 lg:left-8 text-xs tracking-[0.15em] font-semibold z-10 text-[#C8102E] animate-fade-in">
                    NEW
                  </span>}

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 sm:p-8 lg:p-12 transition-all duration-1000 group-hover/card:scale-105"
                  draggable="false"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover/card:from-black/5 group-hover/card:to-transparent transition-all duration-700"></div>
              </div>

              {/* Product Info */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs tracking-[0.15em] text-black/50 font-medium transition-colors duration-500 group-hover/card:text-[#C8102E] uppercase">
                  {product.collection}
                </p>
                <h3 className="text-base sm:text-lg font-medium tracking-wide group-hover/card:tracking-wider transition-all duration-500 text-black leading-snug">
                  {product.name}
                </h3>
                <p className="text-lg sm:text-xl font-semibold tracking-wide transition-all duration-500 group-hover/card:text-[#C8102E] text-black">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          </div>)}
      </div>

      {/* Progress Indicators - Desktop only */}
      <div className="hidden lg:flex justify-center items-center space-x-3 mt-12 sm:mt-16">
        {products.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className="group/indicator relative" aria-label={`Слайд ${index + 1}`}>
            <div className="w-12 h-px bg-black/20 group-hover/indicator:bg-black/40 transition-colors duration-500"></div>
            <div className={`absolute top-0 left-0 h-px bg-[#C8102E] transition-all duration-1000 ease-out ${currentIndex === index ? 'w-full' : 'w-0'}`}></div>
          </button>)}
      </div>

      {/* Auto-play indicator - Desktop only */}
      <div className="hidden lg:block text-center mt-6">
        <p className="text-xs tracking-[0.2em] text-black/30 font-light transition-opacity duration-500">
          {isHovered ? 'ПАУЗА' : 'АВТОПРОКРУТКА'}
        </p>
      </div>
    </div>;
}