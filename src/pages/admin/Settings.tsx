import React, { useEffect, useState } from 'react';
import { SaveIcon } from 'lucide-react';
import { api } from '../../services/api';
interface Settings {
  site: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardCost: number;
    expressCost: number;
  };
  currency: {
    code: string;
    symbol: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}
const DEFAULT_SETTINGS: Settings = {
  site: {
    name: 'Orient Watch',
    email: 'info@orient.uz',
    phone: '+998 71 123 45 67',
    address: 'Ташкент, Узбекистан'
  },
  shipping: {
    freeShippingThreshold: 100000,
    standardCost: 50000,
    expressCost: 100000
  },
  currency: {
    code: 'UZS',
    symbol: '₽'
  },
  social: {
    facebook: 'https://facebook.com/orient',
    instagram: 'https://instagram.com/orient',
    twitter: 'https://twitter.com/orient'
  }
};
export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('✅ Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  return <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Настройки</h1>
          <p className="text-black/60">Настройки сайта и магазина</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 bg-[#C8102E] hover:bg-[#A00D24] text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all disabled:opacity-50">
          <SaveIcon className="w-5 h-5" strokeWidth={2} />
          <span>{saving ? 'Сохранение...' : 'Сохранить все'}</span>
        </button>
      </div>

      {/* Site Info */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
          Информация о сайте
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Название сайта
            </label>
            <input type="text" value={settings.site.name} onChange={e => setSettings({
            ...settings,
            site: {
              ...settings.site,
              name: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Email
            </label>
            <input type="email" value={settings.site.email} onChange={e => setSettings({
            ...settings,
            site: {
              ...settings.site,
              email: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Телефон
            </label>
            <input type="tel" value={settings.site.phone} onChange={e => setSettings({
            ...settings,
            site: {
              ...settings.site,
              phone: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Адрес
            </label>
            <input type="text" value={settings.site.address} onChange={e => setSettings({
            ...settings,
            site: {
              ...settings.site,
              address: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
          Доставка
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Бесплатная доставка от ({settings.currency.symbol})
            </label>
            <input type="number" value={settings.shipping.freeShippingThreshold} onChange={e => setSettings({
            ...settings,
            shipping: {
              ...settings.shipping,
              freeShippingThreshold: Number(e.target.value)
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Стандартная доставка ({settings.currency.symbol})
            </label>
            <input type="number" value={settings.shipping.standardCost} onChange={e => setSettings({
            ...settings,
            shipping: {
              ...settings.shipping,
              standardCost: Number(e.target.value)
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Экспресс доставка ({settings.currency.symbol})
            </label>
            <input type="number" value={settings.shipping.expressCost} onChange={e => setSettings({
            ...settings,
            shipping: {
              ...settings.shipping,
              expressCost: Number(e.target.value)
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" min="0" />
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
          Валюта
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Код валюты
            </label>
            <input type="text" value={settings.currency.code} onChange={e => setSettings({
            ...settings,
            currency: {
              ...settings.currency,
              code: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="UZS" />
            <p className="text-xs text-black/50 mt-2">
              Например: USD, EUR, RUB, UZS
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Символ валюты
            </label>
            <input type="text" value={settings.currency.symbol} onChange={e => setSettings({
            ...settings,
            currency: {
              ...settings.currency,
              symbol: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="₽" />
            <p className="text-xs text-black/50 mt-2">Например: $, €, ₽, сўм</p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>Предпросмотр:</strong> Цены будут отображаться как{' '}
            <span className="font-bold">45,900 {settings.currency.symbol}</span>
          </p>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white p-8 border-2 border-black/10">
        <h2 className="text-2xl font-bold tracking-tight mb-6 uppercase">
          Социальные сети
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Facebook
            </label>
            <input type="url" value={settings.social.facebook} onChange={e => setSettings({
            ...settings,
            social: {
              ...settings.social,
              facebook: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="https://facebook.com/orient" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Instagram
            </label>
            <input type="url" value={settings.social.instagram} onChange={e => setSettings({
            ...settings,
            social: {
              ...settings.social,
              instagram: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="https://instagram.com/orient" />
          </div>

          <div>
            <label className="block text-sm font-medium tracking-wider uppercase mb-3">
              Twitter
            </label>
            <input type="url" value={settings.social.twitter} onChange={e => setSettings({
            ...settings,
            social: {
              ...settings.social,
              twitter: e.target.value
            }
          })} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" placeholder="https://twitter.com/orient" />
          </div>
        </div>
      </div>
    </div>;
}