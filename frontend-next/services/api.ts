import axios from 'axios';
import { Domain, DomainDetail, Source, Stats, ApiResponse } from '@/types';

// ==================== CONFIGURATION DYNAMIQUE ====================
const getApiUrl = () => {
  // En production sur Vercel (même domaine)
  if (typeof window !== 'undefined') {
    const isVercel = window.location.hostname.includes('vercel.app');
    if (isVercel) {
      // Sur le même domaine, l'API est sous /api
      return '/api';
    }
  }
  
  // En développement local
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

const API_URL = getApiUrl();
console.log('🌐 API URL:', API_URL); // Utile pour debug

// ==================== CLIENT AXIOS ====================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 secondes timeout
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// ==================== SERVICES ====================

export const domainService = {
  getAll: async (): Promise<Domain[]> => {
    const response = await api.get<ApiResponse<Domain[]>>('/domains');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<DomainDetail | null> => {
    const response = await api.get<ApiResponse<DomainDetail>>(`/domains/${id}`);
    return response.data.data || null;
  },

  getSources: async (id: string): Promise<Source[]> => {
    const response = await api.get<ApiResponse<Record<string, Omit<Source, 'id'>>>>(`/domains/${id}/sources`);
    const sources = response.data.data || {};
    
    return Object.entries(sources).map(([sourceId, source]) => ({
      id: sourceId,
      ...source,
      domainId: id,
      domainName: ''
    }));
  }
};

export const searchService = {
  search: async (query: string, type?: string, domain?: string): Promise<Source[]> => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type && type !== 'all') params.append('type', type);
    if (domain && domain !== 'all') params.append('domain', domain);
    
    const response = await api.get<ApiResponse<Source[]>>(`/search?${params}`);
    return response.data.data || [];
  }
};

export const statsService = {
  getStats: async (): Promise<Stats | null> => {
    const response = await api.get<ApiResponse<Stats>>('/stats');
    return response.data.data || null;
  }
};

// Export par défaut pour utilisation facile
export default api;