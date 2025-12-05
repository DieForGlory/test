import React, { useState, useRef, useId } from 'react';
import { UploadIcon, XIcon, ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}
export function ImageUpload({
  value,
  onChange,
  label,
  required
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId(); // Generate unique ID for each instance
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой (макс 5MB)');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      onChange(data.url);
    } catch (err) {
      setError('Ошибка загрузки изображения');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };
  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div>
      {label && <label className="block text-sm font-medium tracking-wider uppercase mb-3">
          {label} {required && <span className="text-[#C8102E]">*</span>}
        </label>}

      {value ? <div className="relative border-2 border-black/10 p-4">
          <img src={value} alt="Preview" className="w-full h-48 object-contain bg-gray-50" />
          <button type="button" onClick={handleRemove} className="absolute top-2 right-2 p-2 bg-white border-2 border-black hover:bg-red-50 hover:border-red-500 transition-colors">
            <XIcon className="w-4 h-4" strokeWidth={2} />
          </button>
        </div> : <div className="border-2 border-dashed border-black/20 hover:border-[#C8102E] transition-colors">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" id={`image-upload-${uniqueId}`} disabled={uploading} />
          <label htmlFor={`image-upload-${uniqueId}`} className="block p-12 text-center cursor-pointer">
            {uploading ? <div className="space-y-4">
                <div className="w-12 h-12 mx-auto border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-black/60">Загрузка...</p>
              </div> : <div className="space-y-4">
                <ImageIcon className="w-12 h-12 mx-auto text-black/40" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-black mb-1">
                    Нажмите для загрузки изображения
                  </p>
                  <p className="text-xs text-black/50">PNG, JPG, WEBP до 5MB</p>
                </div>
              </div>}
          </label>
        </div>}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>;
}