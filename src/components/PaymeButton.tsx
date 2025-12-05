import React, { useState } from 'react';
import { CreditCardIcon } from 'lucide-react';

interface PaymeButtonProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymeButton({
  orderId,
  amount,
  onSuccess,
  onError
}: PaymeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // Используем адрес из .env или фоллбэк на localhost только для локальной разработки
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${API_URL}/api/payme/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();

      // Redirect to Payme checkout
      window.location.href = data.checkout_url;

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Payment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-3 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-4 sm:py-5 text-sm sm:text-base font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Подключение...</span>
        </>
      ) : (
        <>
          <CreditCardIcon className="w-5 h-5" strokeWidth={2} />
          <span>Оплатить через Payme</span>
        </>
      )}
    </button>
  );
}