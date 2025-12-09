import React, { useEffect, useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from 'lucide-react';
import { api } from '../../services/api';
import { ImageUpload } from '../../components/admin/ImageUpload';

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  watchCount: number;
  number: string;
  active: boolean;
  brand?: string;
}

interface CollectionFormData {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
  active: boolean;
  brand: string;
}

export function AdminCollections() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [formData, setFormData] = useState<CollectionFormData>({
    id: '',
    name: '',
    description: '',
    image: '',
    number: '',
    active: true,
    brand: 'Orient'
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      image: '',
      number: '',
      active: true,
      brand: 'Orient'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      image: collection.image,
      number: collection.number,
      active: collection.active,
      brand: collection.brand || 'Orient'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCollection) {
        await api.updateCollection(editingCollection.id, formData);
        alert('Коллекция обновлена!');
      } else {
        await api.createCollection(formData);
        alert('Коллекция создана!');
      }
      closeModal();
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены что хотите удалить эту коллекцию?')) return;
    try {
      await api.deleteCollection(id);
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Коллекции</h1>
          <p className="text-black/60">Управление коллекциями часов</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-[#C8102E] hover:bg-[#A00D24] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all">
          <PlusIcon className="w-5 h-5" strokeWidth={2} />
          <span>Создать коллекцию</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white border-2 border-black/10 overflow-hidden group hover:border-black/20 transition-all">
            <div className="aspect-video bg-gray-50 overflow-hidden relative">
              <img src={collection.image} alt={collection.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {!collection.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm tracking-wider">НЕАКТИВНА</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-[#C8102E] text-white px-3 py-1 text-xs font-bold">
                {collection.number}
              </div>
              <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                {collection.brand || 'Orient'}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">{collection.name}</h3>
                <p className="text-sm text-black/60 line-clamp-2">{collection.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-black/10">
                <div className="flex space-x-2">
                    <button onClick={() => openEditModal(collection)} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                    <EditIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(collection.id)} className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
                <span className="text-black/60 font-medium">{collection.watchCount} шт.</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-black/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight uppercase">
                {editingCollection ? 'Редактировать' : 'Создать'}
              </h2>
              <button onClick={closeModal}><XIcon className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium tracking-wider uppercase mb-3">ID коллекции *</label>
                  <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingCollection} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none disabled:bg-gray-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium tracking-wider uppercase mb-3">Номер *</label>
                  <input type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Название *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Бренд *</label>
                <select
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none bg-white"
                >
                  <option value="Orient">Orient</option>
                  <option value="Orient Star">Orient Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-3">Описание</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none resize-none" required />
              </div>

              <ImageUpload value={formData.image} onChange={url => setFormData({...formData, image: url})} label="Изображение" required />

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-wider uppercase">Активная коллекция</span>
                </label>
              </div>

              <div className="pt-6 border-t-2 border-black/10">
                <button type="submit" className="w-full bg-[#C8102E] hover:bg-[#A00D24] text-white py-4 text-sm font-semibold uppercase tracking-wider transition-all">
                  <SaveIcon className="w-5 h-5 inline mr-2" /> Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}