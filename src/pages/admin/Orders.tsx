import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, EyeIcon, FilterIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext'; // [1]

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

export function AdminOrders() {
  const { currency } = useSettings(); // [2]
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 20
      };
      if (filterStatus !== 'all') params.status = filterStatus;
      const data = await api.getOrders(params);
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'payme':
        return 'Payme';
      case 'click':
        return 'Click';
      case 'cash':
        return 'Наличные';
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter(order => order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Заказы</h1>
        <p className="text-black/60">Управление заказами клиентов</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 border-2 border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по номеру, клиенту..." className="w-full pl-12 pr-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
          </div>

          {/* Status Filter */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white">
            <option value="all">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="processing">В обработке</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Номер заказа
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Клиент
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Сумма
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Оплата
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Дата
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-black/60">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredOrders.length > 0 ? filteredOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-black/50">ID: {order.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-sm">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-black/50">
                          {order.customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">
                        {/* [3] Динамическая валюта */}
                        {order.total.toLocaleString('ru-RU')} {currency.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border-0 ${getStatusColor(order.status)}`}>
                        <option value="pending">Ожидает</option>
                        <option value="processing">В обработке</option>
                        <option value="completed">Завершен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/admin/orders/${order.id}`} className="p-2 hover:bg-gray-100 transition-colors" title="Просмотр">
                          <EyeIcon className="w-4 h-4" strokeWidth={2} />
                        </Link>
                      </div>
                    </td>
                  </tr>) : <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-black/40">
                    {searchQuery || filterStatus !== 'all' ? 'Заказы не найдены' : 'Нет заказов'}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}