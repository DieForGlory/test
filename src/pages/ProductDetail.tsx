import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ShoppingBagIcon, ShareIcon, CheckCircleIcon, TruckIcon, ShieldCheckIcon, RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../services/publicApi';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { SEO } from '../components/SEO'; // Добавлен импорт компонента SEO

interface Product {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  sku: string;
  // Новые поля из БД
  brand?: string;
  gender?: string;
  caseDiameter?: number;
  strapMaterial?: string;
  movement?: string;
  caseMaterial?: string;
  dialColor?: string;
  waterResistance?: string;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  fbTitle?: string;
  fbDescription?: string;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { formatPrice } = useSettings();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFlyingImage, setShowFlyingImage] = useState(false);
  const [flyingImagePosition, setFlyingImagePosition] = useState({ x: 0, y: 0 });
  const [showToast, setShowToast] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  // Старый useEffect для document.title и meta удален, так как теперь используется <SEO />

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [product.image];
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img !== product.image) {
          imgs.push(img);
        }
      });
    }
    return imgs;
  }, [product]);

  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const data = await publicApi.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (allImages.length > 1) {
      setSelectedImage((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 1) {
      setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = imageRef.current;
    if (!elem) return;

    const { top, left, width, height } = elem.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setMagnifierPosition({ x: e.clientX, y: e.clientY });
    setImagePosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setShowMagnifier(true);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('Ссылка на товар скопирована в буфер обмена!');
      })
      .catch(err => {
        console.error('Ошибка копирования:', err);
      });
  };

  const handleAddToCart = () => {
    if (isAddingToCart || !product) return;

    setIsAddingToCart(true);
    addItem({
      id: product.id,
      name: product.name,
      collection: product.collection,
      price: product.price,
      image: product.image
    }, quantity);

    const button = addToCartButtonRef.current;
    const image = imageRef.current;

    if (button && image) {
      const imageRect = image.getBoundingClientRect();
      setFlyingImagePosition({
        x: imageRect.left + imageRect.width / 2,
        y: imageRect.top + imageRect.height / 2
      });
      setShowFlyingImage(true);

      setTimeout(() => {
        setFlyingImagePosition({
          x: window.innerWidth - 100,
          y: 50
        });
      }, 50);

      setTimeout(() => {
        setShowFlyingImage(false);
        setShowSuccess(true);
        setShowToast(true);
      }, 800);

      setTimeout(() => {
        setIsAddingToCart(false);
        setShowSuccess(false);
      }, 2500);

      setTimeout(() => {
        setShowToast(false);
      }, 3500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Товар не найден</h1>
          <Link to="/catalog" className="text-[#C8102E] hover:underline">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = allImages[selectedImage] || product.image;

  // ОБЪЕДИНЯЕМ ВСЕ ХАРАКТЕРИСТИКИ
  const mainSpecs = [
    { label: 'Бренд', value: product.brand },
    { label: 'Пол', value: product.gender },
    { label: 'Механизм', value: product.movement },
    { label: 'Диаметр корпуса', value: product.caseDiameter ? `${product.caseDiameter} мм` : null },
    { label: 'Материал корпуса', value: product.caseMaterial },
    { label: 'Материал браслета', value: product.strapMaterial },
    { label: 'Цвет циферблата', value: product.dialColor },
    { label: 'Водонепроницаемость корпуса', value: product.waterResistance },
  ];

  // Добавляем дополнительные specs из JSON (исключая дубликаты, если они там есть)
  const additionalSpecs = Object.entries(product.specs || {}).map(([label, value]) => ({ label, value }));

  // Фильтруем пустые значения
  const allSpecs = [...mainSpecs, ...additionalSpecs].filter(item => item.value && item.value.toString().trim() !== '');

  // Подготовка данных для SEO
  const pageTitle = product.seoTitle || `${product.name} – Купить в Ташкенте | Orient Watch Uzbekistan`;
  const pageDescription = product.seoDescription || `Купить часы ${product.name} из коллекции ${product.collection}. Официальная гарантия, бесплатная доставка по Ташкенту. Характеристики: ${product.movement || 'японский механизм'}, ${product.caseMaterial || 'стальной корпус'}.`;

  return (
    <div className="w-full bg-white">
      {/* SEO Компонент */}
      <SEO
        title={pageTitle}
        description={pageDescription}
      />

      {/* Breadcrumb */}
      <div className="border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-4 sm:py-6">
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] text-black/50 font-medium overflow-x-auto">
            <Link to="/" className="hover:text-[#C8102E] transition-colors whitespace-nowrap">
              ГЛАВНАЯ
            </Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-[#C8102E] transition-colors whitespace-nowrap">
              КАТАЛОГ
            </Link>
            <span>/</span>
            <Link
              to={`/catalog?collection=${product.collection}`}
              className="text-black truncate hover:text-[#C8102E] transition-colors whitespace-nowrap uppercase"
            >
              {product.collection}
            </Link>
            <span className="hidden sm:inline">/</span>
            <span className="text-black truncate hidden sm:inline">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 sm:gap-12 lg:gap-16 xl:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative aspect-square bg-gray-50 group">
              <div
                ref={imageRef}
                className="relative w-full h-full overflow-hidden cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={currentImage}
                  alt={`${product.name} - изображение ${selectedImage + 1}`}
                  className="w-full h-full object-contain p-6 sm:p-12"
                />

                {showMagnifier && (
                  <div
                    className="fixed pointer-events-none z-50 border-4 border-white shadow-2xl rounded-full overflow-hidden hidden lg:block"
                    style={{
                      width: '200px',
                      height: '200px',
                      left: `${magnifierPosition.x - 100}px`,
                      top: `${magnifierPosition.y - 100}px`,
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                      backgroundSize: '600%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 border-2 border-black/10 rounded-full"></div>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm border border-black/10 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all duration-500 z-10"
                    aria-label="Предыдущее изображение"
                  >
                    <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/90 backdrop-blur-sm border border-black/10 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all duration-500 z-10"
                    aria-label="Следующее изображение"
                  >
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 bg-black/80 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-wider">
                {selectedImage + 1} / {allImages.length}
              </div>

              <div className="hidden lg:block absolute top-6 right-6 bg-black/80 backdrop-blur-sm text-white px-4 py-2 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Наведите для увеличения
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-50 transition-all duration-300 border-2 ${selectedImage === index ? 'border-[#C8102E]' : 'border-transparent hover:border-black/20'}`}
                  >
                    <img src={image} alt={`${product.name} миниатюра ${index + 1}`} className="w-full h-full object-contain p-2 sm:p-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 sm:w-8 h-px bg-[#C8102E]"></div>
                <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-[#C8102E] font-medium uppercase">
                  {product.collection}
                </p>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-xs sm:text-sm text-black/50 font-medium">
                  SKU: {product.sku}
                </p>
                {product.inStock && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                    <span className="text-xs sm:text-sm font-medium">В наличии</span>
                  </div>
                )}
              </div>
            </div>

            <div className="py-4 sm:py-6 border-y border-black/10">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-sm sm:text-base font-normal text-black/70 leading-relaxed">
              {product.description}
            </p>

            {product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm tracking-[0.15em] font-semibold uppercase text-black">
                  Основные характеристики
                </h3>
                <ul className="space-y-2">
                  {product.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 sm:space-x-3 text-xs sm:text-sm text-black/70">
                      <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#C8102E] flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <label className="text-xs sm:text-sm tracking-[0.15em] font-medium uppercase text-black whitespace-nowrap">
                  Количество
                </label>
                <div className="flex items-center border-2 border-black">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium hover:bg-black hover:text-white transition-colors"
                    disabled={isAddingToCart}
                  >
                    −
                  </button>
                  <span className="px-4 sm:px-8 py-2 sm:py-3 border-x-2 border-black text-sm sm:text-base font-semibold min-w-[50px] sm:min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium hover:bg-black hover:text-white transition-colors"
                    disabled={isAddingToCart}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  ref={addToCartButtonRef}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || showSuccess || !product.inStock}
                  className={`flex-1 py-4 sm:py-5 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-semibold transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-3 uppercase ${
                    showSuccess
                      ? 'bg-green-600 text-white'
                      : product.inStock
                        ? 'bg-[#C8102E] hover:bg-[#A00D24] text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } ${isAddingToCart ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {showSuccess ? (
                    <>
                      <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                      <span className="hidden sm:inline">Добавлено в корзину</span>
                      <span className="sm:hidden">Добавлено</span>
                    </>
                  ) : isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Добавление...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                      <span className="hidden sm:inline">
                        {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
                      </span>
                      <span className="sm:hidden">
                        {product.inStock ? 'В корзину' : 'Нет в наличии'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="hidden sm:block p-5 border-2 border-black hover:bg-black hover:text-white transition-all duration-500"
                  aria-label="Поделиться"
                  disabled={isAddingToCart}
                >
                  <ShareIcon className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-black/10">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gray-50 flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] font-semibold uppercase text-black">
                    Доставка
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/60 mt-1 hidden sm:block">
                    По Узбекистану
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gray-50 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] font-semibold uppercase text-black">
                    Гарантия
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/60 mt-1 hidden sm:block">
                    1 год
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto bg-gray-50 flex items-center justify-center">
                  <RotateCcwIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] font-semibold uppercase text-black">
                    Возврат
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/60 mt-1 hidden sm:block">
                    10 дней
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {allSpecs.length > 0 && (
          <div className="mt-16 sm:mt-24 lg:mt-32 pt-12 sm:pt-16 border-t border-black/10">
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
                <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
                  Технические характеристики
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black">
                Спецификации
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-16 gap-y-4 sm:gap-y-6">
              {allSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-4 sm:py-5 border-b border-black/10 gap-4">
                  <span className="text-xs sm:text-sm font-medium text-black/60">
                    {spec.label}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-black text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showFlyingImage && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-700 ease-out"
          style={{
            left: `${flyingImagePosition.x}px`,
            top: `${flyingImagePosition.y}px`,
            transform: 'translate(-50%, -50%) scale(0.3)',
            opacity: showFlyingImage ? 1 : 0
          }}
        >
          <img src={currentImage} alt="Flying product" className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg shadow-2xl" />
        </div>
      )}

      {showToast && (
        <div className="fixed top-20 sm:top-24 right-4 sm:right-8 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center space-x-3 sm:space-x-4 min-w-[280px] sm:min-w-[320px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs sm:text-sm tracking-wide">
                Добавлено в корзину
              </p>
              <p className="text-[10px] sm:text-xs text-white/80 mt-1 truncate">
                {product.name} × {quantity}
              </p>
            </div>
            <Link to="/cart" className="text-[10px] sm:text-xs tracking-wider font-semibold hover:underline uppercase whitespace-nowrap">
              В корзину
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}