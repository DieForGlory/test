import React, { useState } from 'react';
import { MinusIcon, PlusIcon, TrashIcon, ArrowRightIcon, CheckCircleIcon, TruckIcon, CreditCardIcon, MapPinIcon, UserIcon, PackageIcon, TagIcon, XIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../services/publicApi';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { PaymeButton } from '../components/PaymeButton';
import { SEO } from '../components/SEO';

interface FormData {
  // Contact
  fullName: string;
  email: string;
  phone: string;
  // Delivery
  address: string;
  city: string;
  postalCode: string;
  country: string;
  // Options
  deliveryMethod: 'standard' | 'express' | 'pickup';
  paymentMethod: 'payme' | 'click' | 'cash';
}

// Интерфейс для промокода
interface AppliedPromo {
  code: string;
  discount_percent: number;
  applicable_products: string[];
  applicable_collections: string[];
}

export function Cart() {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();
  const { items: cartItems, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const [currentStep, setCurrentStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [finalTotal, setFinalTotal] = useState<number>(0);

  // --- Promo Code States ---
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Узбекистан',
    deliveryMethod: 'standard',
    paymentMethod: 'payme'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // --- Logic Calculation ---

  // Функция расчета скидки для конкретного товара
  const getItemDiscount = (item: typeof cartItems[0]) => {
    if (!appliedPromo) return 0;

    const { discount_percent, applicable_products, applicable_collections } = appliedPromo;

    // Если есть ограничения по товарам и этот товар не в списке
    if (applicable_products.length > 0 && !applicable_products.includes(item.id)) {
      return 0;
    }

    // Если есть ограничения по коллекциям и коллекция товара не в списке
    if (applicable_collections.length > 0) {
        if (!applicable_collections.includes(item.collection)) return 0;
    }

    // Если списки пусты - скидка на всё, иначе - мы прошли проверки выше
    return (item.price * discount_percent) / 100;
  };

  // Подсчет итогов
  const subtotal = totalPrice;

  // Сумма скидки
  const discountAmount = cartItems.reduce((acc, item) => {
    return acc + (getItemDiscount(item) * item.quantity);
  }, 0);

  const subtotalAfterDiscount = subtotal - discountAmount;

  // Стоимость доставки (расчет от суммы ПОСЛЕ скидки)
  const deliveryCost = formData.deliveryMethod === 'express' ? 1500 : formData.deliveryMethod === 'pickup' ? 0 : subtotalAfterDiscount > 50000 ? 0 : 500;

  const total = subtotalAfterDiscount + deliveryCost;

  // --- Handlers ---

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');

    try {
      const promoData = await publicApi.validatePromoCode(promoInput);
      setAppliedPromo(promoData);
      setPromoInput(''); // Очистить поле или оставить для наглядности
    } catch (error: any) {
      setPromoError(error.message || 'Неверный промокод');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const availablePaymentMethods = [
    { value: 'payme', label: 'Payme', desc: 'Оплата через Payme (UzCard, Humo, Visa, Mastercard)' },
    { value: 'click', label: 'Click', desc: 'Оплата через Click' },
    ...(formData.deliveryMethod === 'pickup' ? [{ value: 'cash', label: 'Наличными', desc: 'Оплата наличными при получении' }] : [])
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Введите ФИО';
    if (!formData.email.trim()) newErrors.email = 'Введите email';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email';
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';

    if (formData.deliveryMethod !== 'pickup') {
      if (!formData.address.trim()) newErrors.address = 'Введите адрес';
      if (!formData.city.trim()) newErrors.city = 'Введите город';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Введите индекс';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'deliveryMethod' && value !== 'pickup' && prev.paymentMethod === 'cash') {
        newData.paymentMethod = 'payme';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const currentOrderTotal = total;

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price - getItemDiscount(item) // Сохраняем цену уже со скидкой
        })),
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        deliveryAddress: formData.deliveryMethod !== 'pickup' ? {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        } : null,
        subtotal: subtotalAfterDiscount,
        shipping: deliveryCost,
        total: currentOrderTotal,
        notes: appliedPromo ? `Промокод: ${appliedPromo.code} (-${appliedPromo.discount_percent}%)` : ''
      };

      const response = await publicApi.createOrder(orderData);

      setOrderNumber(response.orderNumber);
      setFinalTotal(currentOrderTotal);
      clearCart();

      if (formData.paymentMethod === 'payme') {
        setCurrentStep('payment');
      } else {
        alert(`✅ Заказ #${response.orderNumber} успешно создан!`);
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Ошибка при создании заказа.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0 && currentStep !== 'payment') {
     return (
      <div className="w-full bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-32">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
              <PackageIcon className="w-12 h-12 text-black/30" strokeWidth={1.5} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-black">Корзина пуста</h1>
              <p className="text-lg text-black/60">Добавьте часы в корзину, чтобы продолжить покупки</p>
            </div>
            <Link to="/catalog" className="inline-flex items-center space-x-3 bg-[#C8102E] hover:bg-[#A00D24] text-white px-12 py-5 text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase">
              <span>Перейти в каталог</span>
              <ArrowRightIcon className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <SEO
        title="Корзина покупок – Оформление заказа | Orient Watch Uzbekistan"
        description="Ваша корзина Orient Watch. Оформите заказ на официальные японские часы с бесплатной доставкой по Ташкенту."
      />
      <div className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 h-0.5 bg-[#C8102E]"></div>
            <p className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-[#C8102E] font-medium uppercase">
              {currentStep === 'payment' ? 'Оплата заказа' : 'Оформление заказа'}
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            {currentStep === 'cart' ? 'КОРЗИНА' : currentStep === 'checkout' ? 'ОФОРМЛЕНИЕ' : 'ОПЛАТА'}
          </h1>
        </div>
      </div>

      {currentStep !== 'payment' && (
        <div className="border-b border-black/10">
           <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-8">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === 'cart' ? 'bg-[#C8102E] text-white' : 'bg-green-600 text-white'}`}>
                  {currentStep === 'checkout' ? <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} /> : '1'}
                </div>
                <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Корзина</span>
              </div>
              <div className="w-12 sm:w-16 h-px bg-black/20"></div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep === 'checkout' ? 'bg-[#C8102E] text-white' : 'bg-black/10 text-black/40'}`}>
                  2
                </div>
                <span className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${currentStep === 'checkout' ? 'text-black' : 'text-black/40'}`}>Оформление</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        {currentStep === 'payment' ? (
           <div className="max-w-2xl mx-auto">
             <div className="bg-white border-2 border-black/10 p-8 sm:p-12 space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Заказ #{orderNumber} создан!</h2>
                <p className="text-black/60">Теперь вы можете оплатить заказ через Payme</p>
              </div>

              <div className="border-t border-black/10 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium">Сумма к оплате:</span>
                  <span className="text-3xl font-bold">{formatPrice(finalTotal)}</span>
                </div>

                <PaymeButton orderId={orderNumber} amount={finalTotal} />

                <div className="mt-6 text-center">
                  <p className="text-sm text-black/60 mb-4">Вы будете перенаправлены на защищенную страницу оплаты Payme</p>
                  <button onClick={() => navigate('/')} className="text-sm text-black/60 hover:text-[#C8102E] transition-colors underline">Оплатить позже</button>
                </div>
              </div>
            </div>
           </div>
        ) : currentStep === 'cart' ? (
          // Cart Step
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cartItems.map(item => {
                const discount = getItemDiscount(item);
                const hasDiscount = discount > 0;

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 border-2 border-black/10 hover:border-black/20 transition-colors">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0 mx-auto sm:mx-0">
                      <img src={item.image} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50" />
                    </Link>
                    <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 sm:w-6 h-px bg-[#C8102E]"></div>
                          <p className="text-[10px] sm:text-xs tracking-[0.2em] text-black/50 font-medium uppercase">{item.collection}</p>
                        </div>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-base sm:text-lg font-semibold hover:text-[#C8102E] transition-colors">{item.name}</h3>
                        </Link>
                        {/* Бейдж промокода */}
                        {hasDiscount && (
                          <div className="mt-2 inline-flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                            <TagIcon className="w-3 h-3" />
                            <span className="text-xs font-bold uppercase">Скидка -{appliedPromo?.discount_percent}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center border-2 border-black w-fit">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-black hover:text-white transition-colors"><MinusIcon className="w-4 h-4" strokeWidth={2} /></button>
                          <span className="px-4 sm:px-6 py-2 border-x-2 border-black font-semibold min-w-[50px] sm:min-w-[60px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-black hover:text-white transition-colors"><PlusIcon className="w-4 h-4" strokeWidth={2} /></button>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:text-right gap-4">
                          <div>
                            {hasDiscount ? (
                              <>
                                <p className="text-xl sm:text-2xl font-bold text-red-600">
                                  {formatPrice((item.price - discount) * item.quantity)}
                                </p>
                                <p className="text-sm text-black/40 line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </>
                            ) : (
                              <p className="text-xl sm:text-2xl font-bold">{formatPrice(item.price * item.quantity)}</p>
                            )}

                            {item.quantity > 1 && (
                              <p className="text-xs sm:text-sm text-black/50">
                                {hasDiscount ? (
                                  <span>{formatPrice(item.price - discount)} за шт.</span>
                                ) : (
                                  <span>{formatPrice(item.price)} за шт.</span>
                                )}
                              </p>
                            )}
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 sm:p-3 text-black/40 hover:text-[#C8102E] hover:bg-red-50 transition-all flex-shrink-0" aria-label="Удалить"><TrashIcon className="w-5 h-5" strokeWidth={2} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border-2 border-black/10 p-6 sm:p-8 lg:sticky lg:top-24 space-y-6 bg-gray-50">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">Итого</h2>

                {/* Promo Code Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/60">Промокод</label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-100 border border-green-200 p-3 rounded">
                      <div>
                        <p className="font-bold text-green-800">{appliedPromo.code}</p>
                        <p className="text-xs text-green-700">Скидка {appliedPromo.discount_percent}% применена</p>
                      </div>
                      <button onClick={handleRemovePromo} className="text-green-800 hover:text-green-950 p-1">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Введите код"
                        className="flex-1 px-3 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput}
                        className="px-4 bg-black text-white text-sm font-bold uppercase hover:bg-[#C8102E] transition-colors disabled:opacity-50"
                      >
                        {promoLoading ? '...' : 'OK'}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-red-600 font-medium">{promoError}</p>}
                </div>

                <div className="space-y-4 py-6 border-y border-black/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Товары ({cartItems.reduce((a,c)=>a+c.quantity,0)})</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span className="font-medium">Скидка</span>
                      <span className="font-bold">− {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Доставка</span>
                    <span className="font-semibold">{deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}</span>
                  </div>
                  {deliveryCost > 0 && subtotalAfterDiscount < 50000 && <p className="text-xs text-black/50">Бесплатная доставка при заказе от {formatPrice(50000)}</p>}
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-lg sm:text-xl font-bold">Всего</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#C8102E]">{formatPrice(total)}</span>
                </div>

                <button onClick={() => setCurrentStep('checkout')} className="w-full bg-[#C8102E] hover:bg-[#A00D24] text-white py-4 sm:py-5 text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase">Оформить заказ</button>
                <Link to="/catalog" className="block text-center text-sm text-black/60 hover:text-[#C8102E] transition-colors tracking-wider">Продолжить покупки</Link>
              </div>
            </div>
          </div>
        ) : (
          // Checkout Step
          <form onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                 {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                      <UserIcon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase">Контактная информация</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium tracking-wider uppercase mb-3">ФИО <span className="text-[#C8102E]">*</span></label>
                      <input type="text" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.fullName ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="Иванов Иван Иванович" />
                      {errors.fullName && <p className="text-red-500 text-xs mt-2">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wider uppercase mb-3">Email <span className="text-[#C8102E]">*</span></label>
                      <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.email ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="example@mail.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium tracking-wider uppercase mb-3">Телефон <span className="text-[#C8102E]">*</span></label>
                      <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.phone ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="+998 90 123 45 67" />
                      {errors.phone && <p className="text-red-500 text-xs mt-2">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                      <TruckIcon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase">Способ доставки</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ value: 'standard', label: 'Стандартная', time: '5-7 дней', cost: subtotalAfterDiscount > 50000 ? 0 : 500 }, { value: 'express', label: 'Экспресс', time: '1-2 дня', cost: 1500 }, { value: 'pickup', label: 'Самовывоз', time: 'Сегодня', cost: 0 }].map(method => (
                      <button key={method.value} type="button" onClick={() => handleInputChange('deliveryMethod', method.value as any)} className={`p-6 border-2 text-left transition-all ${formData.deliveryMethod === method.value ? 'border-[#C8102E] bg-red-50' : 'border-black/20 hover:border-black/40'}`}>
                        <p className="font-semibold text-sm uppercase tracking-wider mb-2">{method.label}</p>
                        <p className="text-xs text-black/60 mb-3">{method.time}</p>
                        <p className="text-lg font-bold">{method.cost === 0 ? 'Бесплатно' : formatPrice(method.cost)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {formData.deliveryMethod !== 'pickup' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                        <MapPinIcon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight uppercase">Адрес доставки</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium tracking-wider uppercase mb-3">Адрес <span className="text-[#C8102E]">*</span></label>
                        <input type="text" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.address ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="Улица, дом, квартира" />
                        {errors.address && <p className="text-red-500 text-xs mt-2">{errors.address}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium tracking-wider uppercase mb-3">Город <span className="text-[#C8102E]">*</span></label>
                        <input type="text" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.city ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="Ташкент" />
                        {errors.city && <p className="text-red-500 text-xs mt-2">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium tracking-wider uppercase mb-3">Индекс <span className="text-[#C8102E]">*</span></label>
                        <input type="text" value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} className={`w-full px-6 py-4 border-2 ${errors.postalCode ? 'border-red-500' : 'border-black/20'} focus:border-[#C8102E] focus:outline-none transition-colors`} placeholder="100000" />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-2">{errors.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                      <CreditCardIcon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight uppercase">Способ оплаты</h2>
                  </div>
                  <div className="space-y-3">
                    {availablePaymentMethods.map(method => (
                      <button key={method.value} type="button" onClick={() => handleInputChange('paymentMethod', method.value as any)} className={`w-full p-6 border-2 text-left transition-all flex items-center justify-between ${formData.paymentMethod === method.value ? 'border-[#C8102E] bg-red-50' : 'border-black/20 hover:border-black/40'}`}>
                        <div>
                          <p className="font-semibold text-sm uppercase tracking-wider mb-1">{method.label}</p>
                          <p className="text-xs text-black/60">{method.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.value ? 'border-[#C8102E]' : 'border-black/20'}`}>
                          {formData.paymentMethod === method.value && <div className="w-3 h-3 rounded-full bg-[#C8102E]"></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkout Summary */}
              <div className="lg:col-span-1">
                <div className="border-2 border-black/10 p-8 sticky top-24 space-y-6">
                  <h2 className="text-xl font-bold tracking-tight uppercase">Ваш заказ</h2>
                  {/* ... Список товаров ... */}
                  <div className="space-y-4 py-6 border-y border-black/10">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-black/50">× {item.quantity}</p>
                          {/* Цена с учетом скидки */}
                          <p className="text-sm font-bold mt-1">
                            {formatPrice((item.price - getItemDiscount(item)) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DUPLICATED PROMO CODE INPUT FOR CHECKOUT STEP */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/60">Промокод</label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-green-100 border border-green-200 p-3 rounded">
                        <div>
                          <p className="font-bold text-green-800">{appliedPromo.code}</p>
                          <p className="text-xs text-green-700">Скидка {appliedPromo.discount_percent}% применена</p>
                        </div>
                        <button onClick={handleRemovePromo} type="button" className="text-green-800 hover:text-green-950 p-1">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder="Введите код"
                          className="flex-1 px-3 py-2 border-2 border-black/10 focus:border-[#C8102E] focus:outline-none uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoInput}
                          className="px-4 bg-black text-white text-sm font-bold uppercase hover:bg-[#C8102E] transition-colors disabled:opacity-50"
                        >
                          {promoLoading ? '...' : 'OK'}
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-red-600 font-medium">{promoError}</p>}
                  </div>

                  {/* Итоговые цифры */}
                  <div className="space-y-3 pt-4 border-t border-black/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/60">Товары</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span className="text-green-700">Скидка</span>
                        <span className="font-bold">− {formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-black/60">Доставка</span>
                      <span className="font-semibold">{deliveryCost === 0 ? 'Бесплатно' : formatPrice(deliveryCost)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/10">
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-lg font-bold">Итого</span>
                      <span className="text-3xl font-bold text-[#C8102E]">{formatPrice(total)}</span>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full bg-[#C8102E] hover:bg-[#A00D24] text-white py-5 text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? 'Оформление...' : 'Оформить заказ'}
                    </button>
                    <button type="button" onClick={() => setCurrentStep('cart')} disabled={submitting} className="w-full border-2 border-black hover:bg-black hover:text-white py-4 text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase disabled:opacity-50">
                      Назад в корзину
                    </button>
                  </div>

                  <div className="pt-6 border-t border-black/10 space-y-3">
                    <div className="flex items-center space-x-3 text-xs text-black/60">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" strokeWidth={2} />
                      <span>Безопасная оплата</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-black/60">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" strokeWidth={2} />
                      <span>Гарантия 2 года</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-black/60">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" strokeWidth={2} />
                      <span>Возврат 14 дней</span>
                    </div>
                  </div>
                </div>
              </div>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}