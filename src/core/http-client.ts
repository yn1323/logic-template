type HttpClientOptions = {
  timeout?: number;
  headers?: Record<string, string>;
};

type HttpResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  executionTime: number;
};

class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public executionTime: number,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export async function httpGet<T>(
  url: string,
  options: HttpClientOptions = {},
): Promise<HttpResponse<T>> {
  const startTime = performance.now();
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (!response.ok) {
      throw new HttpError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        executionTime,
      );
    }

    const data = await response.json();

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      executionTime,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(
        `Request timeout after ${timeout}ms`,
        0,
        'Timeout',
        executionTime,
      );
    }

    throw new HttpError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      'Network Error',
      executionTime,
    );
  }
}

export { HttpError };
export type { HttpClientOptions, HttpResponse };
