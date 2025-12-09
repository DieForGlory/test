import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
interface ProductCardProps {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  index?: number;
}
export function ProductCard({
  id,
  name,
  collection,
  price,
  image,
  index = 0
}: ProductCardProps) {
  const {
    formatPrice
  } = useSettings();
  const staggerClass = `animate-stagger-${Math.min(index % 4 + 1, 4)}`;
  return <div className={`group ${staggerClass}`}>
      <Link to={`/product/${id}`} className="block">
        {/* Image Container - NO grayscale on mobile */}
        <div className="relative aspect-[4/5] bg-white mb-4 sm:mb-6 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" />

          {/* Gradient Overlay on hover - desktop only */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

          {/* Quick Actions - Hidden on mobile, appears on hover on desktop */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button onClick={e => {
            e.preventDefault();
            // Add to cart logic
          }} className="w-full bg-white text-black py-3 px-6 text-sm tracking-[0.15em] font-medium hover:bg-[#C8102E] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
              <ShoppingBagIcon className="w-4 h-4" strokeWidth={2} />
              <span>БЫСТРЫЙ ПРОСМОТР</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2 sm:space-y-3">
          {/* Collection Badge */}
          <div className="flex items-center space-x-2">
            <div className="w-4 sm:w-6 h-px bg-[#C8102E]"></div>
            <p className="text-[10px] tracking-[0.2em] text-black/50 font-medium uppercase">
              {collection}
            </p>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold tracking-wide text-black leading-tight min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-[#C8102E] transition-colors duration-500">
            {name}
          </h3>

          {/* Price */}
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-black">
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    </div>;
}