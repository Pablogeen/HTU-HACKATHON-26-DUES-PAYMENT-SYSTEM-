/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types file for DuesFlow platform simulation and architecture specifications.

export type AcademicLevel = '100' | '200' | '300' | '400' | 'All';

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'REFUNDED' | 'PARTIALLY_PAID';

export type TicketStatus = 'UNUSED' | 'VERIFIED' | 'EXPIRED' | 'REVOKED';

export type ExecutiveRole = 'FINANCIAL_SECRETARY' | 'PRESIDENT' | 'SUPER_ADMIN';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Student {
  indexNumber: string;
  name: string;
  email: string;
  level: AcademicLevel;
  outstandingDues: number;
  paidAmount: number;
  status: PaymentStatus;
  organizationId: string;
  departmentId: string;
  hasPass: boolean;
  passDetails?: string; // QR code representation of the signed ticket JWT
  // Sprint 3 additions:
  paymentPlan?: 'FULL' | '2_PART' | '3_PART';
  installmentsPaid?: number; // 0, 1, 2, or 3 paid installments
  installmentStatus?: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED';
  registeredEvents?: string[]; // IDs of events student has registered for
}

export interface DepartmentalEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  fees: number;
  attendeesCount: number;
  maxAttendees: number;
  // Sprint 3 additions:
  eventType?: 'Dinner' | 'Seminar' | 'Workshop' | 'General Meeting' | 'Conference' | 'Orientation' | 'Department Week' | 'Custom Event';
  location?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  ticketRequired?: boolean;
  registrationDeadline?: string;
  eligibilityRules?: 'All' | 'Cleared' | 'Paid' | 'Level100' | 'Level200' | 'Level300' | 'Level400';
  bannerImage?: string;
}

export interface Transaction {
  id: string;
  reference: string;
  studentIndex: string;
  studentName: string;
  departmentId: string;
  organizationId: string;
  amount: number;
  channel: 'Card' | 'Mobile Money';
  status: 'SUCCESS' | 'FAILED' | 'REVERSED';
  timestamp: string;
  email: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  studentIndex: string;
  studentName: string;
  eventId: string;
  eventName: string;
  status: TicketStatus;
  issuedAt: string;
  scannedAt?: string;
  signature: string;
  seatNumber?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'Normal' | 'Important' | 'Urgent' | 'Critical';
  targetAudience: 'All' | '100' | '200' | '300' | '400' | 'Cleared' | 'Paid';
  publishDate: string;
  expirationDate: string;
  attachments?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  device: string;
  details: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  source: string;
  details: string;
  status: 'ACTIVE' | 'RESOLVED' | 'IGNORED';
}

export interface SystemService {
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency: number; // in ms
  throughput: string;
  icon: string;
}

export interface DeliverableDoc {
  id: string;
  title: string;
  category: 'architecture' | 'database' | 'api' | 'security' | 'infrastructure' | 'future';
  summary: string;
  markdown: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: ExecutiveRole;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface OrgSettings {
  orgName: string;
  deptName: string;
  instName: string;
  orgLogo: string;
  themeColor: string;
  academicYear: string;
  emailDomain: string;
  emailPattern: string;
  otpLength: number;
  otpExpiry: number;
  resendLimit: number;
  sessionTimeout: number;
  currency: string;
  paymentProvider: string;
  receiptPrefix: string;
  verificationPrefix: string;
  ticketPrefix: string;
}

