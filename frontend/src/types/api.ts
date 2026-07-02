export type Role = 'STUDENT' | 'FINANCIAL_SECRETARY' | 'PRESIDENT' | 'ADMIN';
export type Programme = 'ICT' | 'COMPUTER_SCIENCE';
export type Level = 'L100' | 'L200' | 'L300' | 'L400';
export type Qualification = 'BTECH' | 'HND';
export type PaymentStatus = 'PAID' | 'UNPAID';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
}

export interface ConfirmationTokenRequest {
  email: string;
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface StudentResponse {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  academicYear: string;
  level: Level;
  qualificationType: Qualification;
  paymentStatus: PaymentStatus;
  programme: Programme;
}

export interface RegisterRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  level: Level;
  phoneNumber: string;
  academicYear: string;
  programme: Programme;
  qualificationType: Qualification;
}

export interface UpdateStudentRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  level: Level;
  phoneNumber: string;
  academicYear: string;
  qualificationType: Qualification;
  programme: Programme;
}

export interface ImportSummary {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  skippedReasons: string[];
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  status: TransactionStatus;
}

export interface TransactionResponse {
  reference: string;
  amount: number;
  status: TransactionStatus;
  paidAt?: string;
  createdAt: string;
  studentEmail: string;
}

export interface TransactionStatusResponse {
  reference: string;
  status: TransactionStatus;
  paidAt?: string;
}

export interface LevelSummary {
  level: string;
  totalStudents: number;
  totalPaid: number;
  totalUnpaid: number;
}

export interface ProgrammeSummary {
  programme: string;
  totalStudents: number;
  totalPaid: number;
  totalUnpaid: number;
}

export interface OverallSummaryResponse {
  totalStudents: number;
  totalPaid: number;
  totalUnpaid: number;
  totalAmountCollectedInCedis: number;
  programmeSummaries: ProgrammeSummary[];
  levelSummaries: LevelSummary[];
}

export interface ProgrammeDetailSummaryResponse {
  programme: string;
  totalStudents: number;
  totalPaid: number;
  totalUnpaid: number;
  totalAmountCollectedInCedis: number;
  levelSummaries: LevelSummary[];
}

export interface TransactionReportResponse {
  reference: string;
  studentName: string;
  email: string;
  programme: string;
  level: string;
  amountInCedis: number;
  paidAt: string;
}

export interface ApiError {
  error?: string;
  message?: string;
}

export const PROGRAMMES: Programme[] = ['ICT', 'COMPUTER_SCIENCE'];
export const LEVELS: Level[] = ['L100', 'L200', 'L300', 'L400'];
export const QUALIFICATIONS: Qualification[] = ['BTECH', 'HND'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PAID', 'UNPAID'];

export function formatProgramme(p: Programme): string {
  return p === 'COMPUTER_SCIENCE' ? 'Computer Science' : p;
}

export function formatRole(role: Role): string {
  return role.replace(/_/g, ' ');
}

export function formatCedis(amountInPesewas: number): string {
  return `GH₵ ${(amountInPesewas / 100).toFixed(2)}`;
}

export function formatCedisWhole(amountInCedis: number): string {
  return `GH₵ ${amountInCedis.toFixed(2)}`;
}
