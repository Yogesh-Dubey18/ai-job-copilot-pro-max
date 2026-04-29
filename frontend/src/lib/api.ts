const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('ai_job_copilot_token');
};

export async function api<T>(path: string, options: { method?: Method; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'API request failed');
  }

  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ success: boolean; token: string; user: unknown }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
  register: (name: string, email: string, password: string) =>
    api<{ success: boolean; token: string; user: unknown }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    })
};
