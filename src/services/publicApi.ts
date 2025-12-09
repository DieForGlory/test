const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

class PublicApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(error.detail || error.message || 'API Error');
      }
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Products
  getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    // Новые фильтры
    brand?: string;
    gender?: string;
    minDiameter?: number;
    maxDiameter?: number;
    strapMaterial?: string;
    movement?: string;
    caseMaterial?: string;
    dialColor?: string;
    waterResistance?: string;
    features?: string[]; // <--- ДОБАВЛЕНО: Массив строк
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.collection) queryParams.append('collection', params.collection);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    // Одиночные фильтры
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.gender) queryParams.append('gender', params.gender);
    if (params?.minDiameter) queryParams.append('minDiameter', params.minDiameter.toString());
    if (params?.maxDiameter) queryParams.append('maxDiameter', params.maxDiameter.toString());
    if (params?.strapMaterial) queryParams.append('strapMaterial', params.strapMaterial);
    if (params?.movement) queryParams.append('movement', params.movement);
    if (params?.caseMaterial) queryParams.append('caseMaterial', params.caseMaterial);
    if (params?.dialColor) queryParams.append('dialColor', params.dialColor);
    if (params?.waterResistance) queryParams.append('waterResistance', params.waterResistance);

    // --- ИСПРАВЛЕНИЕ: Обработка массива features ---
    if (params?.features && Array.isArray(params.features)) {
      params.features.forEach(feature => {
        queryParams.append('features', feature);
      });
    }

    const query = queryParams.toString();
    return this.request(`/api/products${query ? `?${query}` : ''}`);
  }

  getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  // Filters
  getFilters() {
    return this.request('/api/products/filters');
  }

  // Collections
  getCollections() {
    return this.request('/api/collections');
  }

  getCollection(id: string) {
    return this.request(`/api/collections/${id}`);
  }

  getCollectionProducts(id: string, params?: { limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const query = queryParams.toString();
    return this.request(`/api/collections/${id}/products${query ? `?${query}` : ''}`);
  }

  // Orders
  createOrder(data: any) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Bookings
  createBooking(data: any) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Promo Codes
  validatePromoCode(code: string) {
    return this.request(`/api/promocodes/validate?code=${encodeURIComponent(code)}`);
  }

  // Content & Settings
  getSiteLogo() { return this.request('/api/content/logo'); }
  getHeroContent() { return this.request('/api/content/hero'); }
  getPromoBanner() { return this.request('/api/content/promo-banner'); }
  getFeaturedWatches() { return this.request('/api/content/featured-watches'); }
  getHeritageSection() { return this.request('/api/content/heritage'); }
  getBoutiqueContent() { return this.request('/api/content/boutique'); }
  getHistoryEvents() { return this.request('/api/content/history'); }
  getPolicy(slug: string) { return this.request(`/api/content/policy/${slug}`); }
  getCurrency() { return this.request('/api/settings/currency'); }
  getFilterSettings() { return this.request('/api/settings/filters'); }
  getShippingInfo() { return this.request('/api/settings/shipping'); }
  getSiteInfo() { return this.request('/api/settings/site'); }
  getSocialLinks() { return this.request('/api/settings/social'); }
}

export const publicApi = new PublicApiService();