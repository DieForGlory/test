import React, { useState } from 'react';
import { StoreIcon } from 'lucide-react';
import { TicketIcon } from 'lucide-react';
import { FileTextIcon, TruckIcon, ShieldCheckIcon, RotateCcwIcon, LockIcon } from 'lucide-react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, PackageIcon, ShoppingBagIcon, UsersIcon, SettingsIcon, LogOutIcon, MenuIcon, XIcon, ImageIcon, TagIcon, FilterIcon, CalendarIcon } from 'lucide-react';
export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };
  const menuItems = [{
    path: '/admin/dashboard',
    icon: LayoutDashboardIcon,
    label: 'Dashboard'
  }, {
  path: '/admin/promocodes',
  icon: TicketIcon,
  label: 'Промокоды'
  },{
    path: '/admin/boutique-content', // Новый путь
    icon: StoreIcon,
    label: 'Страница Бутик'
  }, {
    path: '/admin/products',
    icon: PackageIcon,
    label: 'Товары'
  }, {
    path: '/admin/collections',
    icon: TagIcon,
    label: 'Коллекции'
  }, {
    path: '/admin/filters',
    icon: FilterIcon,
    label: 'Фильтры'
  }, {
    path: '/admin/orders',
    icon: ShoppingBagIcon,
    label: 'Заказы'
  }, {
    path: '/admin/bookings',
    icon: CalendarIcon,
    label: 'Записи в бутик'
  }, {
    path: '/admin/users',
    icon: UsersIcon,
    label: 'Пользователи'
  }, {
    path: '/admin/content',
    icon: ImageIcon,
    label: 'Контент'
  }, {
    path: '/admin/settings',
    icon: SettingsIcon,
    label: 'Настройки'
  },{ path: '/admin/delivery-edit', icon: TruckIcon, label: 'Доставка' },
    { path: '/admin/warranty-edit', icon: ShieldCheckIcon, label: 'Гарантия' },
    { path: '/admin/return-edit', icon: RotateCcwIcon, label: 'Возврат' },
    { path: '/admin/privacy', icon: LockIcon, label: 'Конфиденциальность' },];
  const isActive = (path: string) => location.pathname === path;
  return <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-black text-white sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-white/10 transition-colors">
            <MenuIcon className="w-6 h-6" strokeWidth={2} />
          </button>

          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-[0.25em]">ORIENT</h1>
            <span className="hidden sm:block text-xs tracking-[0.2em] text-[#C8102E] font-medium uppercase">
              Admin
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" target="_blank" className="hidden sm:block text-sm hover:text-[#C8102E] transition-colors">
              Перейти на сайт
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors">
              <LogOutIcon className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-black/10 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {menuItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center space-x-3 px-4 py-3 transition-all ${isActive(item.path) ? 'bg-[#C8102E] text-white' : 'hover:bg-gray-100 text-black'}`}>
                <item.icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>)}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
              <div className="p-4 border-b border-black/10 flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase tracking-wider">
                  Меню
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100">
                  <XIcon className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {menuItems.map(item => <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center space-x-3 px-4 py-3 transition-all ${isActive(item.path) ? 'bg-[#C8102E] text-white' : 'hover:bg-gray-100 text-black'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                    <span className="text-sm font-medium uppercase tracking-wider">
                      {item.label}
                    </span>
                  </Link>)}
              </nav>
            </aside>
          </div>}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>;
}