import React, { useEffect, useState, createContext, useContext } from 'react';
interface CartItem {
  id: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  quantity: number;
}
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'orient_cart';
export function CartProvider({
  children
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e);
          return [];
        }
      }
    }
    return [];
  });
  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent('cart-updated', {
        detail: items
      }));
    }
  }, [items]);
  // Listen for cart updates from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to sync cart from storage:', error);
        }
      }
    };
    const handleCartUpdate = (e: CustomEvent) => {
      setItems(e.detail);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdate as EventListener);
    };
  }, []);
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(i => i.id === item.id ? {
          ...i,
          quantity: i.quantity + quantity
        } : i);
      } else {
        // Add new item
        return [...prevItems, {
          ...item,
          quantity
        }];
      }
    });
  };
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems => prevItems.map(item => item.id === id ? {
      ...item,
      quantity
    } : item));
  };
  const clearCart = () => {
    setItems([]);
  };
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <CartContext.Provider value={{
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }}>
      {children}
    </CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}