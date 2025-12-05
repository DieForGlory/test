import React, { useEffect, useState } from 'react';
import { publicApi } from '../services/publicApi';

interface HistoryEvent {
  id: number;
  year: string;
  title: string;
  description: string;
  image: string;
}

export function BrandHistory() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await publicApi.getHistoryEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return <div className="w-full bg-white">
      {/* Hero */}
      <section className="relative bg-black text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest">
            ИСТОРИЯ ORIENT
          </h1>
          <p className="text-xl text-gray-300">
            75 лет японского мастерства и инноваций
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-20">
          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id || index} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Чередование порядка для четных/нечетных элементов */}
                <div className={index % 2 === 0 ? 'order-2 md:order-1' : ''}>
                  {index % 2 === 0 ? (
                    <img src={event.image} alt={`Orient ${event.year}`} className="w-full rounded-lg shadow-xl hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="space-y-4">
                      <span className="text-6xl font-bold text-gray-200">{event.year}</span>
                      <h2 className="text-3xl font-bold tracking-wide uppercase">{event.title}</h2>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  )}
                </div>

                <div className={index % 2 === 0 ? 'order-1 md:order-2' : ''}>
                  {index % 2 === 0 ? (
                    <div className="space-y-4">
                      <span className="text-6xl font-bold text-gray-200">{event.year}</span>
                      <h2 className="text-3xl font-bold tracking-wide uppercase">{event.title}</h2>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  ) : (
                    <img src={event.image} alt={`Orient ${event.year}`} className="w-full rounded-lg shadow-xl hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Philosophy (static content remains) */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-widest">НАША ФИЛОСОФИЯ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#C8102E]">100%</div>
              <h3 className="text-xl font-bold tracking-wide">Мануфактура</h3>
              <p className="text-gray-600">
                Все наши часы оснащены механизмами собственного производства
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#C8102E]">75+</div>
              <h3 className="text-xl font-bold tracking-wide">ЛЕТ ОПЫТА</h3>
              <p className="text-gray-600">
                Более семи десятилетий совершенствования часового мастерства
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-5xl font-bold text-[#C8102E]">∞</div>
              <h3 className="text-xl font-bold tracking-wide">КАЧЕСТВО</h3>
              <p className="text-gray-600">
                Каждые часы проходят строгий контроль качества перед отправкой
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>;
}