import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function Footer() {
  const { site, social } = useSettings();

  return (
    <footer className="bg-black text-white">
      {/* Desktop Footer */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold tracking-widest mb-6">
                {site.name.toUpperCase()}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Японское качество и мастерство с 1950 года. Создаем часы,
                которые служат поколениями.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm tracking-widest mb-6">МАГАЗИН</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Каталог часов
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Коллекции
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-sm tracking-widest mb-6">О БРЕНДЕ</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/history" className="text-gray-400 hover:text-white transition-colors text-sm">
                    История Orient
                  </Link>
                </li>
                <li>
                  <Link to="/boutique" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Наш бутик
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm tracking-widest mb-6">ПОДДЕРЖКА</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/delivery_policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Доставка и оплата
                  </Link>
                </li>
                <li>
                  <Link to="/return_policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Возврат и обмен
                  </Link>
                </li>
                <li>
                  <Link to="/warranty" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Гарантия
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social & Copyright */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex space-x-6">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                © 2025 {site.name}. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Compact */}
      <div className="md:hidden">
        <div className="px-4 py-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold tracking-[0.3em] mb-3">
              {site.name.toUpperCase()}
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
              Японское качество с 1950 года
            </p>
          </div>

          {/* Quick Links - Compact Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 text-center">
            <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors text-xs">
              Каталог
            </Link>
            <Link to="/history" className="text-gray-400 hover:text-white transition-colors text-xs">
              История
            </Link>
            <Link to="/boutique" className="text-gray-400 hover:text-white transition-colors text-xs">
              Бутик
            </Link>
            <Link to="/delivery_policy" className="text-gray-400 hover:text-white transition-colors text-xs">
              Доставка
            </Link>
            <Link to="/return_policy" className="text-gray-400 hover:text-white transition-colors text-xs">
              Возврат
            </Link>
            <Link to="/warranty" className="text-gray-400 hover:text-white transition-colors text-xs">
              Гарантия
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6 mb-6">
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Copyright */}
          <p className="text-gray-400 text-[10px] text-center">
            © 2025 {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}