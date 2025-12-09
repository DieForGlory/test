import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageIcon, ShoppingBagIcon, UsersIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext'; // [1]

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

export function AdminDashboard() {
  const { currency } = useSettings(); // [2]
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([api.getStats(), api.getRecentOrders()]);
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'processing':
        return 'В обработке';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-black/60">
          Обзор статистики и последних заказов
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-white p-4 sm:p-6 border-2 border-black/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 flex items-center justify-center">
              <PackageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" strokeWidth={2} />
            </div>
            <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" strokeWidth={2} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-xs sm:text-sm text-black/60 uppercase tracking-wider">
            Товаров
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-6 border-2 border-black/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" strokeWidth={2} />
            </div>
            <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" strokeWidth={2} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs sm:text-sm text-black/60 uppercase tracking-wider">
            Заказов
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-6 border-2 border-black/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 flex items-center justify-center">
              <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" strokeWidth={2} />
            </div>
            <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" strokeWidth={2} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {/* [3] Замена валюты */}
            {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} {currency.symbol}
          </p>
          <p className="text-xs sm:text-sm text-black/60 uppercase tracking-wider">
            Выручка
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-white p-4 sm:p-6 border-2 border-black/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" strokeWidth={2} />
            </div>
            <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" strokeWidth={2} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-xs sm:text-sm text-black/60 uppercase tracking-wider">
            Пользователей
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Orders */}
        <div className="bg-yellow-50 p-4 sm:p-6 border-2 border-yellow-200">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900">
                {stats?.pendingOrders || 0}
              </p>
              <p className="text-xs sm:text-sm text-yellow-700 uppercase tracking-wider">
                Ожидают обработки
              </p>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-green-50 p-4 sm:p-6 border-2 border-green-200">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-green-900">
                {stats?.completedOrders || 0}
              </p>
              <p className="text-xs sm:text-sm text-green-700 uppercase tracking-wider">
                Завершено
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border-2 border-black/10">
        <div className="p-4 sm:p-6 border-b border-black/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">
              Последние заказы
            </h2>
            <Link to="/admin/orders" className="text-xs sm:text-sm text-[#C8102E] hover:underline font-medium uppercase tracking-wider">
              Все заказы
            </Link>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  ID Заказа
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Клиент
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Сумма
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {recentOrders.length > 0 ? recentOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {/* [3] */}
                      {order.total.toLocaleString('ru-RU')} {currency.symbol}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {order.date}
                    </td>
                  </tr>) : <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-black/40">
                    Нет заказов
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-black/10">
          {recentOrders.length > 0 ? recentOrders.map(order => <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">#{order.id}</span>
                  <span className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Клиент:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Сумма:</span>
                    <span className="font-bold">
                      {/* [3] */}
                      {order.total.toLocaleString('ru-RU')} {currency.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Дата:</span>
                    <span>{order.date}</span>
                  </div>
                </div>
              </div>) : <div className="p-8 text-center text-black/40">Нет заказов</div>}
        </div>
      </div>
    </div>;
}