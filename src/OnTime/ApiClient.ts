export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: HeadersInit = {}
  ) {}

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...this.defaultHeaders
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `API GET ${path} failed (${res.status}): ${text}`
      );
    }

    return res.json() as Promise<T>;
  }
}