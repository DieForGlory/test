import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { publicApi } from '../services/publicApi';
import { SEO } from '../components/SEO'; // Добавлен импорт

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  watchCount: number;
  number: string;
}

export function Collections() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <SEO
        title="Коллекции Orient Watch – Sports, Classic, Bambino, Revival, Contemporary | Orient Watch Uzbekistan"
        description="Обзор коллекций часов Orient. Купить с доставкой по Узбекистану. Гарантия 2 года. Официальный дилер Orient Watch в Узбекистане."
      />

      <div className="bg-black text-white py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
              Наши коллекции
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-4 sm:mb-6">
            КОЛЛЕКЦИИ<br />ORIENT
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed">
            Откройте для себя разнообразие коллекций Orient — от профессиональных дайверских часов до элегантных классических моделей.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20">
        {collections.length === 0 ? <div className="text-center py-16">
            <p className="text-xl text-black/60">Коллекции скоро появятся</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {collections.map((collection, index) => <Link key={collection.id} to={`/collection/${collection.id}`} className="group block animate-fade-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
                <div className="relative aspect-[4/3] overflow-hidden bg-black mb-4 sm:mb-6">
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white/20 group-hover:text-white/40 transition-all duration-700">
                        {collection.number}
                      </span>
                    </div>
                  </div>
                  <img src={collection.image} alt={collection.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2 sm:mb-3 group-hover:tracking-wider transition-all duration-500 break-words">
                      {collection.name}
                    </h2>
                    <div className="flex items-center space-x-2 text-white/80">
                      <span className="text-xs sm:text-sm tracking-wider">
                        {collection.watchCount} моделей
                      </span>
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-black/70 leading-relaxed line-clamp-2 group-hover:text-black transition-colors duration-500">
                    {collection.description}
                  </p>
                  <div className="flex items-center space-x-2 text-[#C8102E] font-semibold text-xs sm:text-sm tracking-wider uppercase">
                    <span>Смотреть коллекцию</span>
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={2.5} />
                  </div>
                </div>
              </Link>)}
          </div>}
      </div>

      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Не можете выбрать?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-black/70 mb-6 sm:mb-8 leading-relaxed">
            Посмотрите все наши часы в каталоге или свяжитесь с нами для консультации
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/catalog" className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 sm:space-x-3 bg-[#C8102E] hover:bg-[#A00D24] text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-all duration-500 uppercase">
              <span>Весь каталог</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </Link>
            <Link to="/boutique" className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-black hover:bg-black hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-all duration-500 uppercase">
              <span>Посетить бутик</span>
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}