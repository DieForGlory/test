import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { GoogleTagManager } from './components/GoogleTagManager';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { BrandHistory } from './pages/BrandHistory';
import { Boutique } from './pages/Boutique';
import { Cart } from './pages/Cart';
import { DeliveryPolicy } from './pages/DeliveryPolicy';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { Warranty } from './pages/Warranty';

// Admin imports
import { AdminLogin } from './pages/admin/Login';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { ProductForm } from './pages/admin/ProductForm';
import { AdminCollections } from './pages/admin/Collections';
import { AdminFilters } from './pages/admin/Filters';
import { AdminOrders } from './pages/admin/Orders';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminUsers } from './pages/admin/Users';
import { AdminContent } from './pages/admin/Content';
import { AdminSettings } from './pages/admin/Settings';
import { BoutiqueContent } from './pages/admin/BoutiqueContent';
import { PolicyEditor } from './pages/admin/PolicyEditor';
import { AdminPromoCodes } from './pages/admin/PromoCodes';
import { PromoCodeForm } from './pages/admin/PromoCodeForm';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';

export function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <GoogleTagManager />
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Home /></main>
                  <Footer />
                </div>} />

            <Route path="/catalog" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Catalog /></main>
                  <Footer />
                </div>} />

            <Route path="/collections" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Collections /></main>
                  <Footer />
                </div>} />

            <Route path="/product/:id" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><ProductDetail /></main>
                  <Footer />
                </div>} />

            <Route path="/collection/:id" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><CollectionDetail /></main>
                  <Footer />
                </div>} />

            <Route path="/history" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><BrandHistory /></main>
                  <Footer />
                </div>} />

            <Route path="/boutique" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Boutique /></main>
                  <Footer />
                </div>} />

            <Route path="/cart" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Cart /></main>
                  <Footer />
                </div>} />

            <Route path="/delivery_policy" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><DeliveryPolicy /></main>
                  <Footer />
                </div>} />

            <Route path="/return_policy" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><ReturnPolicy /></main>
                  <Footer />
                </div>} />

            <Route path="/warranty" element={<div className="min-h-screen flex flex-col bg-white">
                  <Header />
                  <main className="flex-1"><Warranty /></main>
                  <Footer />
                </div>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* Products */}
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />

              {/* Collections */}
              <Route path="collections" element={<AdminCollections />} />

              {/* Filters */}
              <Route path="filters" element={<AdminFilters />} />

              {/* Orders & Bookings & Users */}
              <Route path="orders" element={<AdminOrders />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />

              {/* Promo Codes (Исправлено: перенесено ВНУТРЬ /admin) */}
              <Route path="promocodes" element={<AdminPromoCodes />} />
              <Route path="promocodes/new" element={<PromoCodeForm />} />
              <Route path="promocodes/:id/edit" element={<PromoCodeForm />} />

              {/* Content & Settings */}
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="boutique-content" element={<BoutiqueContent />} />

              {/* Policy Editors */}
              <Route path="privacy" element={<PolicyEditor slug="privacy" pageTitle="Политика конфиденциальности" />} />
              <Route path="warranty-edit" element={<PolicyEditor slug="warranty" pageTitle="Гарантия" />} />
              <Route path="return-edit" element={<PolicyEditor slug="return" pageTitle="Возврат и обмен" />} />
              <Route path="delivery-edit" element={<PolicyEditor slug="delivery" pageTitle="Доставка и оплата" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SettingsProvider>
  );
}