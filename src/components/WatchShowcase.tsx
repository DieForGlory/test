import React, { useEffect, useState } from 'react';
import { HeroCarousel } from './HeroCarousel';
import { publicApi } from '../services/publicApi';
interface FeaturedWatch {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  isNew?: boolean;
}
export function WatchShowcase() {
  const [loading, setLoading] = useState(true);
  const [watches, setWatches] = useState<FeaturedWatch[]>([]);
  useEffect(() => {
    fetchFeaturedWatches();
  }, []);
  const fetchFeaturedWatches = async () => {
    try {
      const data = await publicApi.getFeaturedWatches();
      setWatches(data);
    } catch (error) {
      console.error('Error fetching featured watches:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>;
  }
  if (watches.length === 0) return null;
  return <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="mb-12 sm:mb-16 lg:mb-24 animate-fade-in">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 lg:w-16 h-0.5 bg-[#C8102E]"></div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
              ИЗБРАННОЕ
            </p>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-black">
            Коллекция
          </h2>
        </div>

        <HeroCarousel products={watches} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
    </section>;
}