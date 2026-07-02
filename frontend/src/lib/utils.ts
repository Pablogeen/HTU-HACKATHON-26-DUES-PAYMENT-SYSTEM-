import type { ApiError } from '@/types/api';

export class HttpError extends Error {
  status: number;
  body: ApiError | null;

  constructor(status: number, message: string, body: ApiError | null = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;
    return data.error ?? data.message ?? response.statusText;
  } catch {
    try {
      const text = await response.text();
      return text || response.statusText;
    } catch {
      return response.statusText;
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function fullName(first: string, last: string, middle?: string): string {
  return [first, middle, last].filter(Boolean).join(' ');
}
