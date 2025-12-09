import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import { api } from '../../services/api';

export function AdminPromoCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const data = await api.getPromoCodes();
      setCodes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Удалить промокод?')) return;
    await api.deletePromoCode(id);
    loadCodes();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await api.importPromoCodes(e.target.files[0]);
      alert('Импорт завершен');
      loadCodes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Промокоды</h1>
        <div className="flex gap-2">
          <button onClick={() => api.exportPromoCodes()} className="btn-secondary flex items-center gap-2 px-4 py-2 border hover:bg-gray-50">
            <DownloadIcon className="w-4 h-4" /> Экспорт
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2 px-4 py-2 border hover:bg-gray-50">
            <UploadIcon className="w-4 h-4" /> Импорт
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={handleImport} accept=".xlsx" />
          <Link to="/admin/promocodes/new" className="bg-[#C8102E] text-white px-4 py-2 flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Создать
          </Link>
        </div>
      </div>

      <div className="bg-white border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Название</th>
              <th className="p-4">Процент</th>
              <th className="p-4">Даты</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <tr key={code.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{code.code}</td>
                <td className="p-4">{code.discount_percent}%</td>
                <td className="p-4 text-sm">
                  {new Date(code.valid_from).toLocaleDateString()} —
                  {code.valid_until ? new Date(code.valid_until).toLocaleDateString() : ' Бессрочно'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs ${code.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {code.active ? 'Активен' : 'Скрыт'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link to={`/admin/promocodes/${code.id}/edit`} className="p-2 hover:bg-gray-100"><EditIcon className="w-4 h-4"/></Link>
                  <button onClick={() => handleDelete(code.id)} className="p-2 hover:bg-red-50 text-red-600"><TrashIcon className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}