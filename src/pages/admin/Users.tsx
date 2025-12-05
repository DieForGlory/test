import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, EyeIcon } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext'; // [1]

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

export function AdminUsers() {
  const { currency } = useSettings(); // [2]
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({
        limit: 50
      });
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Пользователи</h1>
        <p className="text-black/60">Управление пользователями сайта</p>
      </div>

      {/* Search */}
      <div className="bg-white p-6 border-2 border-black/10">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по имени, email, телефону..." className="w-full pl-12 pr-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-black/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Пользователь
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Контакты
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Заказов
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Потрачено
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Регистрация
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-black/60">
                  Последний вход
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-black/60">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filteredUsers.length > 0 ? filteredUsers.map(user => <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-black/50">ID: {user.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-xs text-black/50">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">
                        {user.ordersCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">
                        {/* [3] */}
                        {user.totalSpent.toLocaleString('ru-RU')} {currency.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-sm text-black/60">
                      {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/admin/users/${user.id}`} className="p-2 hover:bg-gray-100 transition-colors" title="Просмотр">
                          <EyeIcon className="w-4 h-4" strokeWidth={2} />
                        </Link>
                      </div>
                    </td>
                  </tr>) : <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-black/40">
                    {searchQuery ? 'Пользователи не найдены' : 'Нет пользователей'}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}