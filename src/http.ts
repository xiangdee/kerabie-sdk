export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private orgId?: string;
  private timeout: number;

  constructor(baseUrl: string, apiKey: string, orgId?: string, timeout = 30_000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.orgId = orgId;
    this.timeout = timeout;
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    const url = new URL(this.baseUrl + opts.path);
    if (opts.params) {
      Object.entries(opts.params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.orgId) headers['X-Kerabie-Org'] = this.orgId;

    try {
      const res = await fetch(url.toString(), {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new HttpError(res.status, (errBody as any).message ?? `HTTP ${res.status}`, errBody);
      }

      if (res.status === 204) return undefined as unknown as T;
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>({ method: 'GET', path, params });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
