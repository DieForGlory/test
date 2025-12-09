import React, { useEffect, useState } from 'react';
import { SearchIcon, ShoppingBagIcon, MenuIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { publicApi } from '../services/publicApi';

// Интерфейс для результатов поиска
interface SearchResult {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
}

// Интерфейс для баннера
interface PromoBanner {
  text: string;
  code: string;
  active: boolean;
  backgroundColor: string;
  textColor: string;
  highlightColor: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния для поиска
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Состояния данных
  const [logo, setLogo] = useState<{ logoUrl: string; logoDarkUrl: string | null } | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null); // <--- Добавлено состояние баннера

  const { totalItems } = useCart();
  const { formatPrice } = useSettings();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Загружаем логотип и баннер параллельно
    try {
      const [logoData, bannerData] = await Promise.all([
        publicApi.getSiteLogo().catch(() => null),
        publicApi.getPromoBanner().catch(() => null)
      ]);

      setLogo(logoData);
      setPromoBanner(bannerData);
    } catch (error) {
      console.error('Error loading header data:', error);
    } finally {
      setLogoLoading(false);
    }
  };

  // Эффект для живого поиска
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const response = await publicApi.getProducts({
            search: searchQuery,
            limit: 6
          });
          setSearchResults(response.data);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      {/* Promo Banner (ДИНАМИЧЕСКИЙ) */}
      {promoBanner && promoBanner.active && (
        <div
          className="text-center py-2 sm:py-3 px-4 overflow-hidden relative transition-colors duration-300"
          style={{ backgroundColor: promoBanner.backgroundColor, color: promoBanner.textColor }}
        >
          <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] font-medium animate-fade-in">
            {promoBanner.text}{' '}
            <span style={{ color: promoBanner.highlightColor }}>{promoBanner.code}</span>
          </p>
          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-30"
            style={{ background: `linear-gradient(to right, transparent, ${promoBanner.highlightColor}, transparent)` }}
          ></div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:text-[#C8102E] transition-colors duration-500" aria-label="Меню">
              {mobileMenuOpen ? <XIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              {logoLoading ? (
                <div className="h-8 sm:h-10 lg:h-12 w-24 sm:w-32 bg-gray-100 animate-pulse rounded"></div>
              ) : logo?.logoUrl ? (
                <img
                  src={logo.logoUrl}
                  alt="ORIENT"
                  className="h-8 sm:h-10 lg:h-12 object-contain transition-all duration-500 group-hover:opacity-80"
                />
              ) : (
                <div className="text-lg sm:text-xl lg:text-2xl tracking-[0.15em] sm:tracking-[0.2em] lg:tracking-[0.25em] font-bold transition-all duration-500 group-hover:tracking-[0.2em] sm:group-hover:tracking-[0.25em] lg:group-hover:tracking-[0.3em] group-hover:text-[#C8102E]">
                  ORIENT
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
              <Link to="/catalog" className="nav-link text-sm tracking-[0.15em] font-medium uppercase">
                Каталог
              </Link>
              <Link to="/collections" className="nav-link text-sm tracking-[0.15em] font-medium uppercase">
                Коллекции
              </Link>
              <Link to="/history" className="nav-link text-sm tracking-[0.15em] font-medium uppercase">
                История
              </Link>
              <Link to="/boutique" className="nav-link text-sm tracking-[0.15em] font-medium uppercase">
                Бутик
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-[#C8102E] transition-all duration-500 hover:scale-110" aria-label="Поиск">
                <SearchIcon className="w-5 h-5" strokeWidth={2} />
              </button>
              <Link to="/cart" className="p-2 hover:text-[#C8102E] transition-all duration-500 hover:scale-110 relative group" aria-label="Корзина">
                <ShoppingBagIcon className="w-5 h-5" strokeWidth={2} />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#C8102E] text-white text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setMobileMenuOpen(false)}></div>

            <div className="lg:hidden fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white z-50 shadow-2xl animate-slide-in-left overflow-y-auto">
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-black/10">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    {logo?.logoUrl ? <img src={logo.logoUrl} alt="ORIENT" className="h-8 object-contain" /> : <div className="text-xl tracking-[0.2em] font-bold">
                        ORIENT
                      </div>}
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:text-[#C8102E] transition-colors" aria-label="Закрыть меню">
                    <XIcon className="w-6 h-6" strokeWidth={2} />
                  </button>
                </div>

                <nav className="flex flex-col space-y-6">
                  <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold tracking-wider uppercase hover:text-[#C8102E] transition-colors">
                    Каталог
                  </Link>
                  <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold tracking-wider uppercase hover:text-[#C8102E] transition-colors">
                    Коллекции
                  </Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold tracking-wider uppercase hover:text-[#C8102E] transition-colors">
                    История
                  </Link>
                  <Link to="/boutique" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold tracking-wider uppercase hover:text-[#C8102E] transition-colors">
                    Бутик
                  </Link>
                </nav>

                <div className="pt-6 border-t border-black/10">
                  <button onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }} className="flex items-center space-x-3 text-base font-medium hover:text-[#C8102E] transition-colors w-full">
                    <SearchIcon className="w-5 h-5" strokeWidth={2} />
                    <span>Поиск</span>
                  </button>
                </div>
              </div>
            </div>
          </>}
      </header>

      {/* Search Modal (Оставлен без изменений) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-x-0 top-0 bg-white shadow-2xl animate-slide-down">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
              <div className="flex items-center gap-4">
                <SearchIcon className="w-6 h-6 text-black/40 flex-shrink-0" strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск часов Orient..."
                  className="flex-1 text-xl sm:text-2xl font-medium tracking-wide focus:outline-none placeholder:text-black/30"
                  autoFocus
                />
                <button onClick={closeSearch} className="p-2 hover:bg-gray-100 transition-colors rounded-full" aria-label="Закрыть поиск">
                  <XIcon className="w-6 h-6" strokeWidth={2} />
                </button>
              </div>

              {searchQuery && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-black/60">
                      {isSearching ? 'Поиск...' : searchResults.length > 0 ? `Найдено: ${searchResults.length}` : 'Ничего не найдено'}
                    </p>
                    {searchResults.length > 0 && (
                      <Link to={`/catalog?search=${searchQuery}`} onClick={closeSearch} className="text-sm text-[#C8102E] hover:underline font-medium">
                        Показать все результаты
                      </Link>
                    )}
                  </div>

                  {isSearching ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map(watch => (
                        <Link
                          key={watch.id}
                          to={`/product/${watch.id}`}
                          onClick={closeSearch}
                          className="flex gap-4 p-4 hover:bg-gray-50 transition-colors border border-black/10 group"
                        >
                          <img src={watch.image} alt={watch.name} className="w-20 h-20 object-cover bg-gray-50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs tracking-wider text-black/50 uppercase mb-1">
                              {watch.collection}
                            </p>
                            <h3 className="text-sm font-semibold text-black mb-2 truncate group-hover:text-[#C8102E] transition-colors">
                              {watch.name}
                            </h3>
                            <p className="text-lg font-bold text-black">
                              {formatPrice(watch.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-black/40">
                      По запросу "{searchQuery}" ничего не найдено
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="absolute inset-0 -z-10" onClick={closeSearch}></div>
        </div>
      )}
    </>
  );
}