import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Неверный email или пароль');
      }
      const data = await response.json();
      // Save token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-[0.25em] text-white mb-4">
            ORIENT
          </h1>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-0.5 bg-[#C8102E]"></div>
            <p className="text-xs tracking-[0.25em] text-[#C8102E] font-medium uppercase">
              Панель управления
            </p>
            <div className="w-12 h-0.5 bg-[#C8102E]"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight mb-8 uppercase">
            Вход в систему
          </h2>

          {error && <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 text-sm">
              {error}
            </div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none transition-colors" placeholder="admin@orient.uz" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium tracking-wider uppercase mb-3">
                Пароль
              </label>
              <div className="relative">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 border-2 border-black/20 focus:border-[#C8102E] focus:outline-none transition-colors" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors">
                  {showPassword ? <EyeOffIcon className="w-5 h-5" strokeWidth={2} /> : <EyeIcon className="w-5 h-5" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-[#C8102E] hover:bg-[#A00D24] text-white py-4 text-sm tracking-[0.2em] font-semibold transition-all duration-500 uppercase disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-8 border-t border-black/10">
            <p className="text-xs text-black/50 text-center">
              Демо: admin@orient.uz / admin123
            </p>
          </div>
        </div>
      </div>
    </div>;
}