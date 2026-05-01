type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  errors: unknown[];

  constructor(message: string, status: number, errors: unknown[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function api<T>(path: string, options: { method?: Method; body?: unknown } = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(payload.message || 'API request failed', response.status, payload.errors || []);
  }

  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ success: boolean; user: unknown }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
  register: (name: string, email: string, password: string) =>
    api<{ success: boolean; user: unknown }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    })
};
