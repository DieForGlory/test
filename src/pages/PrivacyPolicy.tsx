import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '../services/publicApi';

export function PrivacyPolicy() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getPolicy('privacy')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20">Загрузка...</div>;
  if (!data) return null;

  return (
    <div className="w-full bg-white">
      <div className="bg-black text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
           <h1 className="text-4xl sm:text-5xl font-bold mb-4">{data.title}</h1>
           <div className="w-12 h-0.5 bg-[#C8102E]"></div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 text-black/80 leading-relaxed space-y-4">
        {/* Опасная вставка HTML (но это админский контент, так что допустимо) */}
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </div>
    </div>
  );
}