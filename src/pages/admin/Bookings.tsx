import React, { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon, MailIcon, PhoneIcon, UserIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, ClockIcon as PendingIcon } from 'lucide-react';
import { api } from '../../services/api';
interface Booking {
  id: number;
  booking_number: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  boutique: string;
  created_at: string;
  updated_at: string;
}
interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [filterStatus]);
  const fetchBookings = async () => {
    try {
      const data = await api.getBookings(filterStatus || undefined);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      const data = await api.getBookingsStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Ошибка при обновлении статуса');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтверждено';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Записи в бутик
          </h1>
          <p className="text-black/60 mt-2">Управление записями на визит</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 border-2 border-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-black/50 font-medium mb-2">
                  Всего
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-black/20" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-yellow-50 p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-yellow-800 font-medium mb-2">
                  Ожидают
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {stats.pending}
                </p>
              </div>
              <PendingIcon className="w-8 h-8 text-yellow-300" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-blue-50 p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-blue-800 font-medium mb-2">
                  Подтверждено
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-300" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-green-50 p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-green-800 font-medium mb-2">
                  Завершено
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.completed}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-300" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-red-50 p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-red-800 font-medium mb-2">
                  Отменено
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats.cancelled}
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-300" strokeWidth={1.5} />
            </div>
          </div>
        </div>}

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-black/10">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium uppercase tracking-wider">
            Фильтр:
          </label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none">
            <option value="">Все записи</option>
            <option value="pending">Ожидают</option>
            <option value="confirmed">Подтверждено</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? <div className="bg-white p-12 border-2 border-black/10 text-center">
            <CalendarIcon className="w-16 h-16 text-black/20 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-black/60">Записей не найдено</p>
          </div> : bookings.map(booking => <div key={booking.id} className="bg-white p-6 border-2 border-black/10 hover:border-black/20 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Booking Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold">
                          #{booking.booking_number}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border-2 ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-black/50">
                        Создано:{' '}
                        {new Date(booking.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Имя
                        </p>
                        <p className="font-medium">{booking.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Телефон
                        </p>
                        <p className="font-medium">{booking.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MailIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Email
                        </p>
                        <p className="font-medium">{booking.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Бутик
                        </p>
                        <p className="font-medium">{booking.boutique}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Дата
                        </p>
                        <p className="font-medium">
                          {new Date(booking.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-black/40" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-black/50 uppercase tracking-wider">
                          Время
                        </p>
                        <p className="font-medium">{booking.time}</p>
                      </div>
                    </div>
                  </div>

                  {booking.message && <div className="pt-4 border-t border-black/10">
                      <p className="text-xs text-black/50 uppercase tracking-wider mb-2">
                        Сообщение
                      </p>
                      <p className="text-sm text-black/70">{booking.message}</p>
                    </div>}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {booking.status === 'pending' && <>
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium uppercase tracking-wider transition-colors">
                        Подтвердить
                      </button>
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium uppercase tracking-wider transition-colors">
                        Отменить
                      </button>
                    </>}
                  {booking.status === 'confirmed' && <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium uppercase tracking-wider transition-colors">
                      Завершить
                    </button>}
                </div>
              </div>
            </div>)}
      </div>
    </div>;
}