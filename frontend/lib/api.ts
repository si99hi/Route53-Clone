import {
  User,
  AuthResponse,
  HostedZone,
  HostedZoneCreate,
  HostedZoneUpdate,
  HostedZonePage,
  DNSRecord,
  DNSRecordCreate,
  DNSRecordUpdate,
  DNSRecordPage,
  RecordType,
} from './types';

const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const cleanUrl = url.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

class APIError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail || `HTTP Error ${status}`);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if present in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('session_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Ensure cookies are sent (needed for session cookie auth)
  options.credentials = 'include';
  options.headers = headers;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    if (url.includes('localhost:8000')) {
      try {
        const fallbackUrl = url.replace('localhost:8000', '127.0.0.1:8000');
        response = await fetch(fallbackUrl, options);
      } catch {
        throw new APIError(
          0,
          'Unable to connect to backend server (http://localhost:8000). Please check backend logs.'
        );
      }
    } else {
      throw new APIError(
        0,
        'Unable to connect to backend server. Please check backend logs.'
      );
    }
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorDetail = 'Something went wrong';
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail
          .map((e: any) => (e.msg ? `${e.loc ? e.loc.slice(1).join('.') + ': ' : ''}${e.msg}` : JSON.stringify(e)))
          .join('; ');
      } else if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'object' ? JSON.stringify(errorJson.detail) : String(errorJson.detail);
      }
    } catch {
      // JSON parsing failed, use generic error
    }
    throw new APIError(response.status, errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async sendOTP(payload: { email: string; account_name?: string; is_signup?: boolean }): Promise<{ message: string; email: string; code?: string }> {
    return request<{ message: string; email: string; code?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyOTP(payload: { email: string; code: string; account_name?: string; password?: string; is_signup?: boolean }): Promise<User> {
    const res = await request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.access_token && typeof window !== 'undefined') {
      localStorage.setItem('session_token', res.access_token);
      document.cookie = `session_token=${res.access_token}; path=/; max-age=604800; SameSite=Lax`;
    }

    return res.user || (res as unknown as User);
  },

  async login(payload: { email: string; password: string }): Promise<User> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.access_token && typeof window !== 'undefined') {
      localStorage.setItem('session_token', res.access_token);
      document.cookie = `session_token=${res.access_token}; path=/; max-age=604800; SameSite=Lax`;
    }

    return res.user || (res as unknown as User);
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_token');
      document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    return request<void>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me', {
      method: 'GET',
    });
  },

  // Hosted Zones
  async getHostedZones(params: {
    search?: string;
    page?: number;
    page_size?: number;
  } = {}): Promise<HostedZonePage> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<HostedZonePage>(`/hosted-zones${queryString}`);
  },

  async createHostedZone(payload: HostedZoneCreate): Promise<HostedZone> {
    return request<HostedZone>('/hosted-zones', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getHostedZone(id: string): Promise<HostedZone> {
    return request<HostedZone>(`/hosted-zones/${id}`);
  },

  async updateHostedZone(id: string, payload: HostedZoneUpdate): Promise<HostedZone> {
    return request<HostedZone>(`/hosted-zones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteHostedZone(id: string): Promise<void> {
    return request<void>(`/hosted-zones/${id}`, {
      method: 'DELETE',
    });
  },

  // DNS Records
  async getRecords(
    zoneId: string,
    params: {
      search?: string;
      type?: RecordType;
      page?: number;
      page_size?: number;
    } = {}
  ): Promise<DNSRecordPage> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<DNSRecordPage>(`/hosted-zones/${zoneId}/records${queryString}`);
  },

  async createRecord(zoneId: string, payload: DNSRecordCreate): Promise<DNSRecord> {
    return request<DNSRecord>(`/hosted-zones/${zoneId}/records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRecord(zoneId: string, recordId: string): Promise<DNSRecord> {
    return request<DNSRecord>(`/hosted-zones/${zoneId}/records/${recordId}`);
  },

  async updateRecord(
    zoneId: string,
    recordId: string,
    payload: DNSRecordUpdate
  ): Promise<DNSRecord> {
    return request<DNSRecord>(`/hosted-zones/${zoneId}/records/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteRecord(zoneId: string, recordId: string): Promise<void> {
    return request<void>(`/hosted-zones/${zoneId}/records/${recordId}`, {
      method: 'DELETE',
    });
  },
};
