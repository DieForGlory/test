import React from 'react';
import { ProductCard } from './ProductCard';
interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  isNew?: boolean;
}
interface ProductCarouselProps {
  products: Product[];
}
export function ProductCarousel({
  products
}: ProductCarouselProps) {
  return <div className="relative">
      {/* Simple horizontal scroll - mobile only, no controls */}
      <div className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch'
    }}>
        {products.map((product, index) => <div key={product.id} className="flex-shrink-0 w-[75vw] sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
            <ProductCard {...product} index={index} />
          </div>)}
      </div>
    </div>;
}