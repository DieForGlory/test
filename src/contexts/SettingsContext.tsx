import React, { useEffect, useState, createContext, useContext } from 'react';
import { publicApi } from '../services/publicApi';

interface Currency {
  code: string;
  symbol: string;
}

interface SiteInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
}

// Добавляем интерфейс доставки
interface ShippingInfo {
  freeShippingThreshold: number;
  standardCost: number;
  expressCost: number;
}

interface SettingsContextType {
  currency: Currency;
  site: SiteInfo;
  social: SocialLinks;
  shipping: ShippingInfo; // Добавляем в тип контекста
  formatPrice: (price: number) => string;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>({
    code: 'UZS',
    symbol: '₽'
  });
  const [site, setSite] = useState<SiteInfo>({
    name: 'Orient Watch',
    email: 'info@orient.uz',
    phone: '+998 71 123 45 67',
    address: 'Ташкент, Узбекистан'
  });
  const [social, setSocial] = useState<SocialLinks>({
    facebook: 'https://facebook.com/orient',
    instagram: 'https://instagram.com/orient',
    twitter: 'https://twitter.com/orient'
  });
  // Добавляем состояние доставки
  const [shipping, setShipping] = useState<ShippingInfo>({
    freeShippingThreshold: 100000,
    standardCost: 50000,
    expressCost: 100000
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Загружаем все настройки параллельно
      const [currencyData, siteData, socialData, shippingData] = await Promise.all([
        publicApi.getCurrency().catch(() => ({ code: 'UZS', symbol: '₽' })),
        publicApi.getSiteInfo().catch(() => site),
        publicApi.getSocialLinks().catch(() => social),
        publicApi.getShippingInfo().catch(() => shipping)
      ]);

      setCurrency(currencyData);
      setSite(siteData);
      setSocial(socialData);
      setShipping(shippingData);

    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('ru-RU')} ${currency.symbol}`;
  };

  return (
    <SettingsContext.Provider value={{
      currency,
      site,
      social,
      shipping, // Передаем в провайдер
      formatPrice,
      loading
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}