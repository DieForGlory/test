// API Base URL - замените на ваш реальный API URL
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private async request(endpoint: string, options: RequestOptions = {}) {
    const {
      requiresAuth = true,
      ...fetchOptions
    } = options;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    };

    if (requiresAuth) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers
      });

      if (response.status === 401 && requiresAuth) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(error.message || 'API Error');
      }
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth
  login(email: string, password: string) {
    return this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false
    });
  }

  // Dashboard
  getStats() { return this.request('/api/admin/stats'); }
  getRecentOrders(limit = 10) { return this.request(`/api/admin/orders/recent?limit=${limit}`); }

  // Products
  getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    collection?: string;
    brand?: string; // <--- ДОБАВЛЕНО
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.collection) queryParams.append('collection', params.collection);

    // <--- ДОБАВЛЕНО: передача бренда
    if (params?.brand) queryParams.append('brand', params.brand);

    const query = queryParams.toString();
    return this.request(`/api/admin/products${query ? `?${query}` : ''}`);
  }

  getProduct(id: string) { return this.request(`/api/admin/products/${id}`); }

  createProduct(data: any) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateProduct(id: string, data: any) {
    return this.request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteProduct(id: string) {
    return this.request(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Products Export/Import
  async exportProducts() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/admin/products/export`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Export failed');

    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'products.xlsx';

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async importProducts(file: File) {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/admin/products/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Import failed' }));
      throw new Error(error.detail || 'Import failed');
    }
    return response.json();
  }

  // Collections
  getCollections() { return this.request('/api/admin/collections'); }
  getCollection(id: string) { return this.request(`/api/admin/collections/${id}`); }

  createCollection(data: any) {
    return this.request('/api/admin/collections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateCollection(id: string, data: any) {
    return this.request(`/api/admin/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteCollection(id: string) {
    return this.request(`/api/admin/collections/${id}`, {
      method: 'DELETE'
    });
  }

  // Orders
  getOrders(params?: { page?: number; limit?: number; status?: string; }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request(`/api/admin/orders${query ? `?${query}` : ''}`);
  }

  getOrder(id: string) { return this.request(`/api/admin/orders/${id}`); }

  updateOrderStatus(id: string, status: string, note?: string) {
    return this.request(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    });
  }

  // Bookings
  getBookings(status?: string) {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    const query = queryParams.toString();
    return this.request(`/api/admin/bookings${query ? `?${query}` : ''}`);
  }
  getBooking(id: number) { return this.request(`/api/admin/bookings/${id}`); }

  updateBookingStatus(id: number, status: string) {
    return this.request(`/api/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  deleteBooking(id: number) {
    return this.request(`/api/admin/bookings/${id}`, {
      method: 'DELETE'
    });
  }
  getBookingsStats() { return this.request('/api/admin/bookings/stats/summary'); }

  // Users
  getUsers(params?: { page?: number; limit?: number; search?: string; }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return this.request(`/api/admin/users${query ? `?${query}` : ''}`);
  }
  getUser(id: string) { return this.request(`/api/admin/users/${id}`); }

  // Content Management
  getSiteLogo() { return this.request('/api/admin/content/logo'); }
  updateSiteLogo(data: any) {
    return this.request('/api/admin/content/logo', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  getHeroContent() { return this.request('/api/admin/content/hero'); }
  updateHeroContent(data: any) {
    return this.request('/api/admin/content/hero', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  getPromoBanner() { return this.request('/api/admin/content/promo-banner'); }
  updatePromoBanner(data: any) {
    return this.request('/api/admin/content/promo-banner', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Promo Codes
  getPromoCodes() { return this.request('/api/admin/promocodes'); }
  getPromoCode(id: number) { return this.request(`/api/admin/promocodes/${id}`); }
  createPromoCode(data: any) {
    return this.request('/api/admin/promocodes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  updatePromoCode(id: number, data: any) {
    return this.request(`/api/admin/promocodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  deletePromoCode(id: number) {
    return this.request(`/api/admin/promocodes/${id}`, {
      method: 'DELETE'
    });
  }
  async exportPromoCodes() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/admin/promocodes/export/excel`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promocodes.xlsx';
    a.click();
  }
  async importPromoCodes(file: File) {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/api/admin/promocodes/import/excel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
  }
  validatePromoCode(code: string) {
    return this.request(`/api/promocodes/validate?code=${encodeURIComponent(code)}`);
  }

  // Content (Other)
  getFeaturedWatches() { return this.request('/api/admin/content/featured-watches'); }
  updateFeaturedWatches(productIds: string[]) {
    return this.request('/api/admin/content/featured-watches', {
      method: 'PUT',
      body: JSON.stringify(productIds)
    });
  }
  getHeritageSection() { return this.request('/api/admin/content/heritage'); }
  updateHeritageSection(data: any) {
    return this.request('/api/admin/content/heritage', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // History
  getHistoryEvents() { return this.request('/api/content/history'); }
  createHistoryEvent(data: any) {
    return this.request('/api/admin/content/history', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  updateHistoryEvent(id: number, data: any) {
    return this.request(`/api/admin/content/history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  deleteHistoryEvent(id: number) {
    return this.request(`/api/admin/content/history/${id}`, {
      method: 'DELETE'
    });
  }

  // Settings
  getSettings() { return this.request('/api/admin/settings'); }
  updateSettings(data: any) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Boutique Content
  getBoutiquePageData() { return this.request('/api/admin/content/boutique'); }
  updateBoutiquePageData(data: any) {
    return this.request('/api/admin/content/boutique', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Policies
  getPolicy(slug: string) { return this.request(`/api/admin/content/policy/${slug}`); }
  updatePolicy(slug: string, data: any) {
    return this.request(`/api/admin/content/policy/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Upload
  async uploadImage(file: File) {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
}

export const api = new ApiService();