import type {
  AuthResponse,
  ConfirmationTokenRequest,
  ImportSummary,
  InitializePaymentResponse,
  LoginRequest,
  OverallSummaryResponse,
  Programme,
  ProgrammeDetailSummaryResponse,
  RegisterRequest,
  RefreshTokenRequest,
  StudentResponse,
  TransactionReportResponse,
  TransactionResponse,
  TransactionStatusResponse,
  UpdateStudentRequest,
} from '@/types/api';
import { HttpError, parseErrorMessage } from '@/lib/utils';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type TokenGetter = () => string | null;
type RefreshHandler = () => Promise<boolean>;

let getAccessToken: TokenGetter = () => getStoredAuth()?.accessToken ?? null;
let onRefresh: RefreshHandler = async () => false;

export function configureApi(options: {
  getAccessToken: TokenGetter;
  onRefresh: RefreshHandler;
}) {
  getAccessToken = options.getAccessToken;
  onRefresh = options.onRefresh;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && onRefresh) {
    const refreshed = await onRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    clearStoredAuth();
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new HttpError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
    return (await response.blob()) as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const api = {
  auth: {
    login: (body: LoginRequest) =>
      request<string>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    verify: (body: ConfirmationTokenRequest) =>
      request<AuthResponse>('/api/v1/auth/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    refresh: (body: RefreshTokenRequest) =>
      request<AuthResponse>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    logout: (body: RefreshTokenRequest) =>
      request<string>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    resendVerification: (email: string) =>
      request<string>(`/api/v1/auth/resend-verification${qs({ email })}`),
  },

  students: {
    me: () => request<StudentResponse>('/api/v1/students/me'),

    getAll: (page = 0, size = 10) =>
      request<StudentResponse[]>(`/api/v1/students${qs({ page, size })}`),

    getById: (id: number) =>
      request<StudentResponse>(`/api/v1/students/${id}`),

    getByEmail: (email: string) =>
      request<StudentResponse>(`/api/v1/students/${encodeURIComponent(email)}`),

    byPaymentStatus: (paymentStatus: string, page = 0, size = 10) =>
      request<StudentResponse[]>(
        `/api/v1/students/payment-status${qs({ paymentStatus, page, size })}`,
      ),

    byProgramme: (programme: Programme, page = 0, size = 10) =>
      request<StudentResponse[]>(
        `/api/v1/students/programme${qs({ programme, page, size })}`,
      ),

    byProgrammeAndPaymentStatus: (
      programme: Programme,
      paymentStatus: string,
      page = 0,
      size = 10,
    ) =>
      request<StudentResponse[]>(
        `/api/v1/students/programme/payment-status${qs({ programme, paymentStatus, page, size })}`,
      ),

    register: (body: RegisterRequest) =>
      request<StudentResponse>('/api/v1/students/register-student', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    import: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return request<ImportSummary>('/api/v1/students/import', {
        method: 'POST',
        body: form,
      });
    },

    update: (email: string, body: UpdateStudentRequest) =>
      request<StudentResponse>(`/api/v1/students/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    assignRole: (email: string) =>
      request<StudentResponse>(
        `/api/v1/students/${encodeURIComponent(email)}/assign-role`,
        { method: 'PUT' },
      ),

    revokeRole: (email: string) =>
      request<StudentResponse>(
        `/api/v1/students/${encodeURIComponent(email)}/revoke-role`,
        { method: 'PUT' },
      ),

    delete: (email: string) =>
      request<void>(`/api/v1/students/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      }),
  },

  payments: {
    initialize: () =>
      request<InitializePaymentResponse>('/api/v1/payments/initialize', {
        method: 'POST',
      }),

    studentTransactions: () =>
      request<TransactionResponse[]>('/api/v1/payments/student'),

    all: (page = 0, size = 10) =>
      request<TransactionResponse[]>(`/api/v1/payments${qs({ page, size })}`),

    status: (reference: string) =>
      request<TransactionStatusResponse>(
        `/api/v1/payments/status/${encodeURIComponent(reference)}`,
      ),
  },

  reports: {
    summary: () => request<OverallSummaryResponse>('/api/v1/reports/summary'),

    downloadSummary: () =>
      request<Blob>('/api/v1/reports/summary/download'),

    programmeSummary: (programme: Programme) =>
      request<ProgrammeDetailSummaryResponse>(
        `/api/v1/reports/summary/programme/${programme}`,
      ),

    downloadProgrammeSummary: (programme: Programme) =>
      request<Blob>(`/api/v1/reports/summary/programme/${programme}/download`),

    transactionHistory: () =>
      request<TransactionReportResponse[]>('/api/v1/reports/transactions'),

    downloadTransactionHistory: () =>
      request<Blob>('/api/v1/reports/transactions/download'),
  },

  receipts: {
    download: (reference: string) =>
      request<Blob>(`/api/v1/receipts/${encodeURIComponent(reference)}`),
  },
};

export { setStoredAuth };
