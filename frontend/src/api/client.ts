const API_BASE_URL = '/api';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, code: string = 'ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('upay_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token expired - clean up and trigger logout event if necessary
      localStorage.removeItem('upay_access_token');
      localStorage.removeItem('upay_refresh_token');
      localStorage.removeItem('upay_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const errMessage = data?.error?.message || response.statusText || 'Request failed';
    const errCode = data?.error?.code || 'API_ERROR';
    throw new ApiError(errMessage, response.status, errCode, data?.error?.details);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  get: <T>(url: string, params?: Record<string, any>) => {
    let query = '';
    if (params) {
      const filteredParams = Object.entries(params).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ''
      );
      if (filteredParams.length > 0) {
        query = '?' + new URLSearchParams(filteredParams as [string, string][]).toString();
      }
    }
    return request<T>(`${url}${query}`, { method: 'GET' });
  },

  post: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: any) =>
    request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(url: string) =>
    request<T>(url, {
      method: 'DELETE',
    }),
};
