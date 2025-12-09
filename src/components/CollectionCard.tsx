import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';

interface CollectionCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  watchCount: number;
  number?: string;
}

export function CollectionCard({
  id,
  name,
  description,
  image,
  watchCount,
  number = '01'
}: CollectionCardProps) {
  return (
    <Link to={`/collection/${id}`} className="group block bg-white overflow-hidden reveal-up">
      <div className="relative">
        {/* Image Section - Compact on mobile, similar to product cards */}
        <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10] overflow-hidden bg-black">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

          {/* Collection Name on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 xl:p-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold tracking-tight text-white leading-none mb-2 sm:mb-3 lg:mb-4 break-words">
              {name}
            </h3>
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="w-8 sm:w-10 lg:w-16 h-0.5 bg-[#C8102E] group-hover:w-12 sm:group-hover:w-16 lg:group-hover:w-32 transition-all duration-700"></div>
              <span className="text-xs sm:text-sm lg:text-base tracking-[0.12em] sm:tracking-[0.15em] lg:tracking-[0.2em] text-white/80 font-medium uppercase">
                {watchCount} МОДЕЛЕЙ
              </span>
            </div>
          </div>
        </div>

        {/* Content Section - Compact */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-12 border-l-2 sm:border-l-4 border-transparent group-hover:border-[#C8102E] transition-all duration-500">
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-black/70 mb-4 sm:mb-6 lg:mb-8 font-normal line-clamp-2 sm:line-clamp-3">
            {description}
          </p>

          <div className="flex items-center space-x-2 sm:space-x-3 text-black group-hover:text-[#C8102E] transition-all duration-500">
            <span className="text-xs sm:text-sm lg:text-base tracking-[0.1em] sm:tracking-[0.12em] lg:tracking-[0.15em] font-medium uppercase">
              СМОТРЕТЬ КОЛЛЕКЦИЮ
            </span>
            <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transform group-hover:translate-x-2 lg:group-hover:translate-x-3 transition-transform duration-500" strokeWidth={2} />
          </div>
        </div>
      </div>
    </Link>
  );
}