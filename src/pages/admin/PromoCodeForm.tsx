import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

export function PromoCodeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 0,
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: '',
    applicable_products: '', // Строка через запятую для удобства ввода
    applicable_collections: '',
    active: true
  });

  useEffect(() => {
    if (isEdit) loadData();
  }, [id]);

  const loadData = async () => {
    const data = await api.getPromoCode(Number(id));
    setFormData({
      ...data,
      valid_from: data.valid_from ? data.valid_from.slice(0, 16) : '',
      valid_until: data.valid_until ? data.valid_until.slice(0, 16) : '',
      applicable_products: data.applicable_products.join(', '),
      applicable_collections: data.applicable_collections.join(', ')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      valid_until: formData.valid_until || null,
      applicable_products: formData.applicable_products.split(',').map(s => s.trim()).filter(Boolean),
      applicable_collections: formData.applicable_collections.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (isEdit) await api.updatePromoCode(Number(id), payload);
      else await api.createPromoCode(payload);
      navigate('/admin/promocodes');
    } catch (err) {
      alert('Ошибка сохранения');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Редактировать' : 'Создать'} промокод</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 border space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Название (Код) *</label>
          <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border p-2 uppercase" />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Скидка (%) *</label>
          <input required type="number" min="1" max="100" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: Number(e.target.value)})} className="w-full border p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Действует от</label>
            <input type="datetime-local" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} className="w-full border p-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Действует до (необязательно)</label>
            <input type="datetime-local" value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} className="w-full border p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">ID Товаров (через запятую)</label>
          <textarea rows={2} value={formData.applicable_products} onChange={e => setFormData({...formData, applicable_products: e.target.value})} className="w-full border p-2" placeholder="id-1, id-2..." />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">ID Коллекций (через запятую)</label>
          <textarea rows={2} value={formData.applicable_collections} onChange={e => setFormData({...formData, applicable_collections: e.target.value})} className="w-full border p-2" placeholder="sports, classic..." />
        </div>

        <div>
          <label className="flex items-center gap-2 font-bold cursor-pointer">
            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
            Активен
          </label>
        </div>

        <button type="submit" className="bg-[#C8102E] text-white px-6 py-3 w-full font-bold uppercase">Сохранить</button>
      </form>
    </div>
  );
}