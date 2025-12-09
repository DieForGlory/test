import React, { useEffect, useState } from 'react';
import { SaveIcon } from 'lucide-react';
import { api } from '../../services/api';

interface PolicyEditorProps {
  slug: string;
  pageTitle: string;
}

export function PolicyEditor({ slug, pageTitle }: PolicyEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getPolicy(slug);
      setData(response);
    } catch (error) {
      console.error('Error fetching policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePolicy(slug, data);
      alert('Страница обновлена!');
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{pageTitle}</h1>
          <p className="text-black/60">Редактирование текстового контента страницы</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-[#C8102E] hover:bg-[#A00D24] text-white px-8 py-3 font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <SaveIcon className="w-4 h-4" />
          <span>Сохранить</span>
        </button>
      </div>

      <div className="bg-white p-8 border-2 border-black/10 space-y-6">
        <div>
          <label className="block text-sm font-medium tracking-wider uppercase mb-2">
            Заголовок страницы (H1)
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none font-bold text-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium tracking-wider uppercase mb-2">
            Контент (HTML)
          </label>
          <p className="text-xs text-gray-500 mb-2">Поддерживаются теги &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;b&gt; и т.д.</p>
          <textarea
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            rows={20}
            className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}