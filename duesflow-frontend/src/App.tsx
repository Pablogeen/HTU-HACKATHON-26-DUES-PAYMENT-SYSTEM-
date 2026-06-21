/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, DepartmentalEvent, AuditLog, SecurityAlert, ExecutiveRole, AcademicLevel, Staff, Announcement, Ticket, Transaction, OrgSettings } from './types';
import StudentPortal from './components/StudentPortal';
import GatekeeperApp from './components/GatekeeperApp';
import AdminDashboards from './components/AdminDashboards';
import VerificationPortal from './components/VerificationPortal';
import { 
  Terminal, ShieldCheck, Laptop2, Fingerprint, Award, Layers, HelpCircle,
  Smartphone, UserCheck, ShieldClose, Lock, Unlock, Database, Activity,
  Wallet, CreditCard, ArrowRight, ChevronRight, Sparkles, Check, CheckCircle2,
  BarChart3, Key, Receipt, Shield, Mail, Menu, X, Ticket as TicketIcon, Loader2, Sun, Moon, Info, ShieldAlert,
  LogOut
} from 'lucide-react';

const INITIAL_STUDENTS: Student[] = [
  {
    indexNumber: 'STU-400-001',
    name: 'Ama Serwaa',
    email: 'aserwaa@inst.edu.gh',
    level: '400',
    outstandingDues: 120,
    paidAmount: 240,
    status: 'PARTIALLY_PAID',
    organizationId: 'COMPSSA-U',
    departmentId: 'COMPS-AFF',
    hasPass: true,
    passDetails: 'JWS:INDEX="STU-400-001",TKT="TKT-AMA-001",AMT=240,SIG=HS256-D0E1F2',
    paymentPlan: '3_PART',
    installmentsPaid: 2,
    installmentStatus: 'ACTIVE',
    registeredEvents: ['EVT-CS-2026-DINNER']
  },
  {
    indexNumber: 'STU-300-002',
    name: 'Kofi Mensah',
    email: 'kmensah@inst.edu.gh',
    level: '300',
    outstandingDues: 0,
    paidAmount: 360,
    status: 'PAID',
    organizationId: 'COMPSSA-U',
    departmentId: 'COMPS-AFF',
    hasPass: true,
    passDetails: 'JWS:INDEX="STU-300-002",TKT="TKT-KOFI-002",AMT=360,SIG=HS256-A4B5C6',
    paymentPlan: 'FULL',
    installmentsPaid: 1,
    installmentStatus: 'COMPLETED',
    registeredEvents: ['EVT-CS-2026-DINNER', 'EVT-CS-2026-SEMINAR']
  },
  {
    indexNumber: 'STU-200-003',
    name: 'Evelyn Boateng',
    email: 'eboateng@inst.edu.gh',
    level: '200',
    outstandingDues: 360,
    paidAmount: 0,
    status: 'OVERDUE',
    organizationId: 'COMPSSA-U',
    departmentId: 'COMPS-AFF',
    hasPass: false,
    paymentPlan: 'FULL',
    installmentsPaid: 0,
    installmentStatus: 'NOT_STARTED',
    registeredEvents: []
  },
  {
    indexNumber: 'STU-100-004',
    name: 'John Mahama',
    email: 'jmahama@inst.edu.gh',
    level: '100',
    outstandingDues: 360,
    paidAmount: 0,
    status: 'PENDING',
    organizationId: 'COMPSSA-U',
    departmentId: 'COMPS-AFF',
    hasPass: false,
    paymentPlan: 'FULL',
    installmentsPaid: 0,
    installmentStatus: 'NOT_STARTED',
    registeredEvents: []
  }
];

const INITIAL_EVENTS: DepartmentalEvent[] = [
  {
    id: 'EVT-CS-2026-DINNER',
    name: 'COMPSSA Annual Dinner & Awards Ceremony',
    fees: 120,
    date: '2026-06-19 19:30',
    maxAttendees: 500,
    attendeesCount: 42,
    description: 'The premier annual gathering of members within the Computer Science Department.',
    eventType: 'Dinner',
    location: 'Main University Banquet Hall',
    startDate: '2026-07-25T19:30',
    endDate: '2026-07-25T23:30',
    capacity: 500,
    ticketRequired: true,
    registrationDeadline: '2026-07-24',
    eligibilityRules: 'Paid',
    bannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'EVT-CS-2026-SEMINAR',
    name: 'Biotech and IoT Fair - Fall Semester',
    fees: 0,
    date: '2026-07-04 10:00',
    maxAttendees: 300,
    attendeesCount: 14,
    description: 'Showcasing the latest research nodes on internet of things and biology.',
    eventType: 'Seminar',
    location: 'Grand Seminar Auditorium',
    startDate: '2026-07-04T10:00',
    endDate: '2026-07-04T13:00',
    capacity: 300,
    ticketRequired: true,
    registrationDeadline: '2026-07-03',
    eligibilityRules: 'All',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-001',
    title: 'COMPSSA Annual Dinner & Awards Registration Open',
    message: 'We are pleased to announce that registrations are now officially open for the COMPSSA Annual Dinner & Awards Ceremony. Ensure you have settled your dues to be eligible to register and receive your scan ticket.',
    priority: 'Important',
    targetAudience: 'All',
    publishDate: '2026-06-18',
    expirationDate: '2026-07-25'
  },
  {
    id: 'ANN-002',
    title: 'Dues Payment Deadline Extended',
    message: 'The financial secretary executive body has extended the deadline for dues installment and full clearance payments to allow all students to clear their statements before exams.',
    priority: 'Urgent',
    targetAudience: 'All',
    publishDate: '2026-06-19',
    expirationDate: '2026-06-30'
  },
  {
    id: 'ANN-003',
    title: 'Level 400 Dissertation Seminar Checklist',
    message: 'To all Level 400 student nodes: Please remember to obtain your final verification ledger footprint clearance before checking into the presentation theater.',
    priority: 'Normal',
    targetAudience: '400',
    publishDate: '2026-06-17',
    expirationDate: '2026-06-25'
  }
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    ticketCode: 'TCK-2026-AMA-DINNER',
    studentIndex: 'STU-400-001',
    studentName: 'Ama Serwaa',
    eventId: 'EVT-CS-2026-DINNER',
    eventName: 'COMPSSA Annual Dinner & Awards Ceremony',
    status: 'UNUSED',
    issuedAt: '2026-06-19 12:00',
    signature: 'JWS_EVENT_SIGNATURE_STU_400_001_D0E1F2',
    seatNumber: 'Table 4, Seat 5'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'Tx-001',
    reference: 'PAYSTK-RCP-2026-001',
    studentIndex: 'STU-400-001',
    studentName: 'Ama Serwaa',
    departmentId: 'COMPS-AFF',
    organizationId: 'COMPSSA-U',
    amount: 120,
    channel: 'Mobile Money',
    status: 'SUCCESS',
    timestamp: '2026-06-18 12:00',
    email: 'aserwaa@inst.edu.gh'
  },
  {
    id: 'Tx-002',
    reference: 'PAYSTK-RCP-2026-002',
    studentIndex: 'STU-400-001',
    studentName: 'Ama Serwaa',
    departmentId: 'COMPS-AFF',
    organizationId: 'COMPSSA-U',
    amount: 120,
    channel: 'Card',
    status: 'SUCCESS',
    timestamp: '2026-06-19 09:00',
    email: 'aserwaa@inst.edu.gh'
  },
  {
    id: 'Tx-003',
    reference: 'PAYSTK-RCP-2026-003',
    studentIndex: 'STU-300-002',
    studentName: 'Kofi Mensah',
    departmentId: 'COMPS-AFF',
    organizationId: 'COMPSSA-U',
    amount: 360,
    channel: 'Mobile Money',
    status: 'SUCCESS',
    timestamp: '2026-06-17 14:00',
    email: 'kmensah@inst.edu.gh'
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2026-06-18T19:02:11.000Z',
    user: 'Ebenezer Boateng',
    role: 'FINANCIAL_SECRETARY',
    action: 'STUDENTS_CSV_IMPORT',
    details: 'Uploaded Level 400 Student Clearance dataset containing 110 clean rows. Commits verified successfully.',
    ipAddress: '127.0.0.1 (Sandbox Gateway)',
    device: 'Safari MacOS - Admin Panel'
  },
  {
    id: '2',
    timestamp: '2026-06-18T19:05:44.000Z',
    user: 'Priscilla Mensah',
    role: 'PRESIDENT',
    action: 'REPORTS_EXPORTED',
    details: 'Exported quarterly dues financial metrics statement to CSV and PDF.',
    ipAddress: '127.0.0.1 (Sandbox Gateway)',
    device: 'Firefox Windows - Oversight Panel'
  },
  {
    id: '3',
    timestamp: '2026-06-18T19:10:01.000Z',
    user: 'Super Administrator',
    role: 'SUPER_ADMIN',
    action: 'EXECUTIVE_ROLE_ASSIGNED',
    details: 'Modified permissions for Ebenezer Boateng; Assigned write scope FINANCIAL_SECRETARY privileges.',
    ipAddress: '127.0.0.1 (Sandbox Gateway)',
    device: 'Chrome Linux - Root Portal'
  }
];

const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT001',
    timestamp: '15 mins ago',
    severity: 'WARNING',
    source: 'Gate 01 Checkpoint Scanner',
    details: 'Duplicate ticket QR scan attempted for student STU-300-002 (Kofi Mensah) at central conventional room entrance.',
    status: 'ACTIVE'
  },
  {
    id: 'ALT002',
    timestamp: '5 mins ago',
    severity: 'CRITICAL',
    source: 'Auth Filter Hook',
    details: 'Brute force warning block triggered for student index "STU-100-004". 4 repeated failed OTP verifications from IP 182.21.9.92.',
    status: 'ACTIVE'
  }
];

const INITIAL_SETTINGS: OrgSettings = {
  orgName: 'COMPSSA HTU',
  deptName: 'Computer Science Department',
  instName: 'Ho Technical University',
  orgLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
  themeColor: 'teal',
  academicYear: '2025/2026',
  emailDomain: 'htu.edu.gh',
  emailPattern: '{index}@htu.edu.gh',
  otpLength: 6,
  otpExpiry: 60,
  resendLimit: 3,
  sessionTimeout: 15,
  currency: 'GHS',
  paymentProvider: 'Paystack',
  receiptPrefix: 'PAYSTK-RCP',
  verificationPrefix: 'DF-VL',
  ticketPrefix: 'TCK'
};

export default function App() {
  // Navigation tabs selection
  type NavigationTab = 'HOME' | 'STUDENT_PORTAL' | 'GATE_SCANNER' | 'EXECUTIVE_BOARD' | 'ADMIN_LOGIN' | 'VERIFY_ID_PORTAL';
  const [activeTab, setActiveTab] = useState<NavigationTab>('HOME');

  // Unified theme switcher state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Lifted states
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [events, setEvents] = useState<DepartmentalEvent[]>(INITIAL_EVENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDITS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [staffList, setStaffList] = useState<Staff[]>([
    { id: '1', name: 'Ebenezer Boateng', email: 'secretary@duesflow.edu.gh', role: 'FINANCIAL_SECRETARY', status: 'ACTIVE' },
    { id: '2', name: 'Priscilla Mensah', email: 'president@duesflow.edu.gh', role: 'PRESIDENT', status: 'ACTIVE' },
    { id: '3', name: 'Super Administrator', email: 'admin@duesflow.edu.gh', role: 'SUPER_ADMIN', status: 'ACTIVE' }
  ]);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(INITIAL_SETTINGS);

  // Active student auth states (lifted for landing integration)
  const [studentActiveStudent, setStudentActiveStudent] = useState<Student | null>(null);
  const [studentLoginStep, setStudentLoginStep] = useState<'ID' | 'OTP' | 'LOGGED'>('ID');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentGeneratedOtp, setStudentGeneratedOtp] = useState('');
  const [studentEnteredOtp, setStudentEnteredOtp] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState('');
  const [heroCaptcha, setHeroCaptcha] = useState(false);

  // Unified Staff login states (No role picker buttons/dropdown!)
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffError, setStaffError] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  
  // Active executive sub-role inside Boardroom tab
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [execRole, setExecRole] = useState<ExecutiveRole>('FINANCIAL_SECRETARY');

  // Sync index.html root dark / light toggles
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#060a13';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [isDarkMode]);

  // Global Logging Helpers
  const addAuditLog = (
    action: string,
    oldValue?: string,
    newValue?: string,
    details?: string,
    user?: string,
    role?: string
  ) => {
    const newEntry: AuditLog = {
      id: (auditLogs.length + 1).toString(),
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous Client',
      role: role || 'GUEST',
      action: action,
      oldValue: oldValue,
      newValue: newValue,
      ipAddress: '127.0.0.1 (Sandbox Gateway)',
      device: 'Secure Web Core Browser API',
      details: details || 'No additional footprints logged.'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const addSecurityAlert = (
    severity: 'CRITICAL' | 'WARNING' | 'INFO',
    source: string,
    details: string
  ) => {
    const newAlert: SecurityAlert = {
      id: 'ALT' + Math.floor(100 + Math.random() * 900),
      timestamp: 'Just now',
      severity,
      source,
      details,
      status: 'ACTIVE'
    };
    setSecurityAlerts(prev => [newAlert, ...prev]);
  };

  // Unified Staff Authentication (determines role automatically based on email matching)
  const handleStaffAuthentication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim()) {
      setStaffError('Please enter your Staff / Executive official email address.');
      return;
    }

    setStaffLoading(true);
    setStaffError('');

    setTimeout(() => {
      setStaffLoading(false);
      const email = staffEmail.toLowerCase().trim();
      
      const foundStaff = staffList.find(s => s.email.toLowerCase() === email);

      if (foundStaff) {
        if (foundStaff.status === 'SUSPENDED') {
          setStaffError('This staff account has been suspended by the administrator.');
          return;
        }

        const assignedRole = foundStaff.role;
        const officerName = foundStaff.name;

        setIsAdminLoggedIn(true);
        setExecRole(assignedRole);
        setActiveTab('EXECUTIVE_BOARD');
        setStaffError('');

        addAuditLog(
          'ADMIN_AUTH_SUCCESS',
          undefined,
          undefined,
          `Role-based staff authentication clearance granted. Name: ${officerName}, Role: ${assignedRole}. Signature OK.`,
          officerName,
          assignedRole
        );
      } else {
        setStaffError('Unrecognized staff credentials. Access Denied.');
        addSecurityAlert(
          'WARNING',
          'Staff Login Failure',
          `An unauthorized attempt to access executive board was made with unrecognized email: "${staffEmail}".`
        );
      }
    }, 950);
  };

  const handleScrollToId = (elementId: string) => {
    setActiveTab('HOME');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Student Quick Search / Handshake continuous flow on hero submit
  const handleHeroEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) {
      setHeroError('Please enter your institutional email address.');
      return;
    }
    if (!heroCaptcha) {
      setHeroError('Please confirm the security handshake box checklist.');
      return;
    }
    
    setHeroLoading(true);
    setHeroError('');
    
    setTimeout(() => {
      const found = students.find(
        s => s.email.trim().toLowerCase() === studentEmail.trim().toLowerCase()
      );
      
      setHeroLoading(false);
      if (found) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setStudentGeneratedOtp(otp);
        setStudentLoginStep('OTP');
        
        addAuditLog(
          'OTP_REQUESTED', 
          undefined, 
          undefined, 
          `Secure OTP successfully generated via landing portal for student email ${studentEmail}. Dispatching verification key...`,
          found.name,
          'STUDENT'
        );
        
        setActiveTab('STUDENT_PORTAL');
      } else {
        setHeroError('We could not locate an active student account in our registry associated with this email.');
        addSecurityAlert(
          'WARNING',
          'Access Restriction Block',
          `Unauthorized access clearance rejected on landing checkout: "${studentEmail}"`
        );
      }
    }, 1000);
  };

  return (
    <div id="app-viewport-root" className={`min-h-screen text-slate-100 flex flex-col justify-between transition-all ${
      isDarkMode ? 'bg-[#060a13] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-transparent blur-[140px] rounded-full -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-teal-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* 1. Global Navigation Bar */}
      <header id="main-product-head" className={`border-b sticky top-0 z-50 transition-all ${
        isDarkMode ? 'border-slate-900 bg-[#060a13]/70 backdrop-blur-lg' : 'border-slate-200 bg-white/75 backdrop-blur-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            id="duesflow-brand-logo" 
            onClick={() => setActiveTab('HOME')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-10 w-10 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/15 group-hover:scale-105 transition-transform duration-300">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className={`font-black text-lg tracking-tight flex items-center gap-1.5 leading-none ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                DuesFlow
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          {!studentActiveStudent && !isAdminLoggedIn && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/5 border rounded-xl p-1 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('HOME');
                  setTimeout(() => handleScrollToId('landing-hero'), 100);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('VERIFY_ID_PORTAL')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'VERIFY_ID_PORTAL'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-slate-500 hover:text-blue-400'
                }`}
              >
                🛡️ Verify QR Code
              </button>
              <button
                onClick={() => {
                  setActiveTab('HOME');
                  setTimeout(() => handleScrollToId('features-section-deck'), 100);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => {
                  setActiveTab('HOME');
                  setTimeout(() => handleScrollToId('timeline-flowchart'), 100);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                How It Works
              </button>
            </nav>
          )}

          {/* Right session triggers and Theme controls */}
          <div className="flex items-center gap-3">
            
            {studentActiveStudent ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('STUDENT_PORTAL')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Portal Dashboard
                </button>
                <button
                  onClick={() => {
                    setStudentActiveStudent(null);
                    setStudentLoginStep('ID');
                    setActiveTab('HOME');
                    addAuditLog('STUDENT_LOGOUT', undefined, undefined, 'Student closed auth session.', 'Ama Serwaa', 'STUDENT');
                  }}
                  className={`p-2 border rounded-xl cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-400 hover:text-rose-400' : 'bg-slate-100 border-slate-205 text-slate-600 hover:text-rose-500'
                  }`}
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('EXECUTIVE_BOARD')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-xs text-white font-bold rounded-xl transition-all shadow hover:scale-[1.01] cursor-pointer"
                >
                  Oversight board
                </button>
                <button
                  onClick={() => {
                    setIsAdminLoggedIn(false);
                    setActiveTab('HOME');
                    addAuditLog('ADMIN_LOGOUT', undefined, undefined, 'Staff Administrative board signed off.');
                  }}
                  className={`p-2 border rounded-xl cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-400 hover:text-rose-400' : 'bg-slate-100 border-slate-205 text-slate-600 hover:text-rose-500'
                  }`}
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('ADMIN_LOGIN') || setStaffError('')}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  activeTab === 'ADMIN_LOGIN'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-500 text-white shadow-md'
                    : isDarkMode 
                      ? 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900' 
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Staff Sign In
              </button>
            )}

            {/* Mobile burger toggle */}
            {!studentActiveStudent && !isAdminLoggedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 md:hidden border rounded-xl text-slate-400 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b p-4 space-y-2 animate-fade-in ${
            isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <button
              onClick={() => setActiveTab('HOME') || setMobileMenuOpen(false)}
              className="block w-full py-2.5 px-4 text-xs font-bold rounded-xl text-left hover:bg-emerald-500/5 hover:text-emerald-500"
            >
              Home Landing
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (studentActiveStudent) {
                  setActiveTab('STUDENT_PORTAL');
                } else {
                  setActiveTab('STUDENT_PORTAL');
                  setStudentLoginStep('ID');
                }
              }}
              className="block w-full py-2.5 px-4 text-xs font-bold rounded-xl text-left hover:bg-emerald-500/5 hover:text-emerald-500"
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveTab('GATE_SCANNER') || setMobileMenuOpen(false)}
              className="block w-full py-2.5 px-4 text-xs font-bold rounded-xl text-left hover:bg-emerald-500/5 hover:text-emerald-500"
            >
              Event Checkpoints
            </button>
            {!studentActiveStudent && !isAdminLoggedIn && (
              <button
                onClick={() => setActiveTab('ADMIN_LOGIN') || setMobileMenuOpen(false)}
                className="block w-full py-2.5 px-4 text-xs font-bold text-emerald-500 rounded-xl text-left hover:bg-emerald-500/10 border border-emerald-500/20"
              >
                Executive Staff Login
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. Main Canvas Grid Routing */}
      <main id="main-content-canvas" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* LANDING PAGE SPECIFICATION (HOME) */}
        {activeTab === 'HOME' && (
          <div className="space-y-24 animate-fade-in">
            
            {/* HERO REDESIGN */}
            <section id="landing-hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6 pb-6">
              
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                  University Financial <br />
                  <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                    Operations Made Simple
                  </span>
                </h1>

                <p className={`text-sm leading-relaxed max-w-xl ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Pay dues securely, receive instant receipts, access digital event tickets, and manage your financial records from one platform. Built securely for the modern university campus ecosystem.
                </p>

                {/* Primary/Secondary CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('STUDENT_PORTAL') || setStudentLoginStep('ID')}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-500/20 text-xs text-white font-black rounded-xl shadow-lg shadow-emerald-500/15 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Enter Student Portal
                  </button>
                  <button
                    onClick={() => setActiveTab('ADMIN_LOGIN') || setStaffError('')}
                    className={`px-6 py-3.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#0f172a] hover:bg-slate-900 border-slate-900 hover:border-slate-800 text-slate-350' 
                        : 'bg-white hover:bg-slate-100 border-slate-205 text-slate-800 shadow-sm'
                    }`}
                  >
                    Executive Staff Portal
                  </button>
                </div>

                {/* Trust list indicator checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-6 border-t border-slate-900/10">
                  {[
                    'Secure Mobile Money Payments',
                    'Instant Digital Receipts',
                    'Financial Clearance Tracking',
                    'QR Event Verification'
                  ].map((trust, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{trust}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redesigned mini access card on hero right */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
                <div className={`p-1.5 rounded-3xl border transition-all relative z-10 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-900 shadow-2xl' : 'bg-white border-slate-350 shadow-xl'
                }`}>
                  <div className={`p-6 rounded-2.5xl ${
                    isDarkMode ? 'bg-[#090d16]' : 'bg-slate-50'
                  }`}>
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black tracking-wider uppercase font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded">
                        QUICK LEDGER PASS
                      </span>
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                    </div>

                    <h3 className="text-sm font-bold tracking-tight">Access Your Student Dues Wallet</h3>
                    <p className={`text-[11px] leading-relaxed mt-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Authenticate using your official university email address to retrieve clearance passes instantly and verify pending balances.
                    </p>

                    <form onSubmit={handleHeroEmailSubmit} className="space-y-3 mt-4">
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="student@htu.edu.gh"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-slate-950 border-slate-900 focus:border-emerald-500 text-white placeholder-slate-600' 
                              : 'bg-white border-slate-205 focus:border-emerald-500 text-slate-950 placeholder-slate-400 shadow-sm'
                          }`}
                        />
                        <Mail className={`absolute right-3.5 top-3 text-slate-500 h-4 w-4`} />
                      </div>

                      <div className="flex items-center gap-2 p-2.5 border rounded-xl border-dashed border-slate-200 bg-emerald-500/5">
                        <input
                          id="hero-captcha-chk"
                          type="checkbox"
                          checked={heroCaptcha}
                          onChange={(e) => setHeroCaptcha(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-500 cursor-pointer accent-emerald-500"
                        />
                        <label htmlFor="hero-captcha-chk" className={`text-[10px] select-none cursor-pointer ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-650'
                        }`}>
                          Handshake clearance confirmation
                        </label>
                      </div>

                      {heroError && (
                        <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/15 p-2 rounded-xl leading-relaxed text-center font-semibold">
                          {heroError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={heroLoading}
                        className="w-full flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50"
                      >
                        {heroLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Connecting nodes...
                          </>
                        ) : (
                          <>
                            Verify Account
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </section>

            {/* FEATURES SECTION (GRID) */}
            <section id="features-section-deck" className="space-y-8 scroll-mt-24">
              <div className="text-center space-y-2">
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest font-mono">FINTECH SYSTEM CAPABILITIES</span>
                <h2 className="text-3xl font-extrabold tracking-tight">Secure Financial Clearance Engine</h2>
                <p className={`max-w-lg mx-auto text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  University-grade ledger operations designed explicitly to eliminate long queues and physical delays.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Student Financial Records', desc: 'Secure view clearances and outstanding dues on dynamic ledger profiles.', icon: Wallet, bg: 'bg-emerald-500/10 text-emerald-500' },
                  { title: 'Automated Financial Clearance', desc: 'Instantly clear dues upon mobile money settlement without manual queue delays.', icon: ShieldCheck, bg: 'bg-teal-500/10 text-teal-400' },
                  { title: 'Digital PDF Receipts', desc: 'Immutable PDF receipts compiled and cryptographic signed for student download options.', icon: Receipt, bg: 'bg-emerald-500/10 text-emerald-500' },
                  { title: 'QR Event Tickets', desc: 'Dynamic entrance keys encrypted using JWT hashes to safeguard venues.', icon: TicketIcon, bg: 'bg-teal-500/10 text-teal-400' },
                  { title: 'Payment History Ledger', desc: 'Lifetime track audit logs and ledger transactions with reference codes.', icon: BarChart3, bg: 'bg-emerald-500/10 text-emerald-500' },
                  { title: 'Full Rate-Limit Defense', desc: 'State protectors monitoring student index routes from brute threat scenarios.', icon: ShieldAlert, bg: 'bg-rose-500/10 text-rose-500' },
                ].map((feat, idx) => (
                  <div key={idx} className={`p-6 rounded-3xl border transition-all hover:scale-[1.01] ${
                    isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-205 shadow-sm'
                  }`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${feat.bg}`}>
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight">{feat.title}</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* TIMELINE ARCHITECTURE (HOW IT WORKS) */}
            <section id="timeline-flowchart" className="space-y-10 scroll-mt-24">
              <div className="text-center space-y-2">
                <span className="text-xs font-black text-teal-500 uppercase tracking-widest font-mono">FLOW CONVERSION MECHANICS</span>
                <h2 className="text-3xl font-extrabold tracking-tight font-sans">Interactive Settlement in 5 Steps</h2>
                <p className={`max-w-lg mx-auto text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our real-time platform resolves financial clearance and issues tickets under 60 seconds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { num: '01', title: 'Verify Email', desc: 'Evaluate official institutional registry credentials.', icon: Mail },
                  { num: '02', title: 'View Balance', desc: 'Instantly view pending invoice ledger balances.', icon: Wallet },
                  { num: '03', title: 'Pay Securely', desc: 'Settle instantly using Mobile Money or Cards.', icon: CreditCard },
                  { num: '04', title: 'Get Receipt', desc: 'Spool cryptographic signed digital PDF clearances.', icon: Receipt },
                  { num: '05', title: 'Access Services', desc: 'Swipe cryptographical QR passes at checkpoints.', icon: TicketIcon }
                ].map((step, idx) => (
                  <div key={idx} className={`p-5 rounded-3xl border text-center flex flex-col items-center justify-center relative hover:scale-[1.01] transition-all ${
                    isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-205 shadow-sm'
                  }`}>
                    <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-emerald-600 border border-emerald-500 text-[10px] text-white font-extrabold rounded-full font-mono">
                      {step.num}
                    </span>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-3 mt-1.5">
                      <step.icon className="h-4.5 w-4.5" />
                    </div>
                    <h4 className="text-xs font-bold tracking-tight">{step.title}</h4>
                    <p className={`text-[11px] leading-relaxed mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* METRICS SHOWCASING */}
            <section id="system-stats" className={`p-8 rounded-3xl border relative overflow-hidden text-center ${
              isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-205 shadow-sm'
            }`}>
              <div className="absolute right-1/4 top-0 w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] rounded-full"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                {[
                  { val: 'GHS 280,000+', title: 'Dues spooled' },
                  { val: '6,400+', title: 'Students Cleared' },
                  { val: '1,200+', title: 'Passes Generated' },
                  { val: '99.99%', title: 'Security Clearances' }
                ].map((stats, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-3xl font-black block tracking-tight font-sans bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      {stats.val}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${
                      isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {stats.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* TRUST & SECURITY */}
            <section id="security-measures" className="space-y-8 scroll-mt-24">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">Certified Auditing & Security Measures</h2>
                <p className={`max-w-md mx-auto text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Engineered using strict design paradigms to ensure high transaction and scanning integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Cryptographic QR signatures', desc: 'Event gate scanners perform signature evaluations of cryptographic JWS payloads.', icon: Key, bg: 'text-emerald-400 bg-emerald-500/10' },
                  { title: 'Two-Factor Access Handshakes', desc: 'Bypasses standard logins using temporary secure 2FA keys.', icon: ShieldAlert, bg: 'text-teal-400 bg-teal-500/10' },
                  { title: 'PCI-DSS Compliance Sink', desc: 'Secure integrations through sandboxed Paystack endpoints processing transactions.', icon: ShieldCheck, bg: 'text-emerald-400 bg-emerald-500/10' }
                ].map((sec, idx) => (
                  <div key={idx} className={`p-5 rounded-3xl border flex gap-4 ${
                    isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-205 shadow-sm'
                  }`}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${sec.bg}`}>
                      <sec.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight">{sec.title}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {sec.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ACTIVE STUDENTS ENTRY PORTAL */}
        {activeTab === 'STUDENT_PORTAL' && (
          <div className="animate-fade-in">
            <StudentPortal
              students={students}
              setStudents={setStudents}
              transactions={transactions}
              setTransactions={setTransactions}
              events={events}
              setEvents={setEvents}
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              tickets={tickets}
              setTickets={setTickets}
              addAuditLog={addAuditLog}
              addSecurityAlert={addSecurityAlert}
              orgSettings={orgSettings}
              setOrgSettings={setOrgSettings}
              
              activeStudent={studentActiveStudent}
              setActiveStudent={setStudentActiveStudent}
              loginStep={studentLoginStep}
              setLoginStep={setStudentLoginStep}
              emailAddress={studentEmail}
              setEmailAddress={setStudentEmail}
              generatedOtp={studentGeneratedOtp}
              setGeneratedOtp={setStudentGeneratedOtp}
              enteredOtp={studentEnteredOtp}
              setEnteredOtp={setStudentEnteredOtp}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* SEPARATE EVENT GATES HARDWARE SIMULATOR */}
        {activeTab === 'GATE_SCANNER' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-200 shadow shadow-slate-100'
            }`}>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 animate-fade-in">
                  Event Gate Checkpoint Simulator
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Hardware camera scanning simulator. Point student JWS QR payloads at scan decoders to verify permissions.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('HOME')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-xs text-white font-bold rounded-xl shadow cursor-pointer transition-all hover:scale-[1.01]"
              >
                Go to Landing
              </button>
            </div>

            <div className={`p-1.5 border rounded-3xl ${
              isDarkMode ? 'bg-slate-950 border-slate-900 shadow-xl' : 'bg-white border-slate-205 shadow-lg'
            }`}>
              <GatekeeperApp
                students={students}
                setStudents={setStudents}
                events={events}
                tickets={tickets}
                setTickets={setTickets}
                addAuditLog={addAuditLog}
                addSecurityAlert={addSecurityAlert}
                orgSettings={orgSettings}
              />
            </div>
          </div>
        )}

        {/* SEPARATE CORE SPECIFICATIONS BLUEPRINTS - REMOVED */}

        {/* UNIFIED EXECUTIVE BOARD DASHBOARDS */}
        {activeTab === 'EXECUTIVE_BOARD' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
              isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-500/10 text-teal-500 rounded-xl flex items-center justify-center border border-teal-500/25">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Oversight Administrative Console</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-none">
                    Security dashboard. Operational scope role evaluated as: <b className="text-emerald-500 font-bold font-mono">{execRole}</b>
                  </p>
                </div>
              </div>

              {/* Inter role toggles for administrative auditing - REMOVED */}
              <div className="flex items-center gap-2 font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3 py-1.5 leading-tight font-bold">
                🔑 ROLE-RESTRICTED ACCESS SESSION ACTIVE
              </div>
            </div>

            <div className={`p-1 border rounded-3xl ${
              isDarkMode ? 'bg-slate-950 border-slate-900 shadow-2xl' : 'bg-white border-slate-205 shadow-xl'
            }`}>
              <AdminDashboards
                role={execRole}
                students={students}
                setStudents={setStudents}
                events={events}
                setEvents={setEvents}
                auditLogs={auditLogs}
                securityAlerts={securityAlerts}
                setSecurityAlerts={setSecurityAlerts}
                addAuditLog={addAuditLog}
                staffList={staffList}
                setStaffList={setStaffList}
                transactions={transactions}
                setTransactions={setTransactions}
                announcements={announcements}
                setAnnouncements={setAnnouncements}
                tickets={tickets}
                setTickets={setTickets}
                orgSettings={orgSettings}
                setOrgSettings={setOrgSettings}
              />
            </div>
          </div>
        )}

        {/* PUBLIC GEOGRAPHIC & CRYPTOGRAPHIC VERIFICATION QR PORTAL */}
        {activeTab === 'VERIFY_ID_PORTAL' && (
          <div className="space-y-6 animate-fade-in">
            <VerificationPortal
              students={students}
              isDarkMode={isDarkMode}
              onBackToHome={() => setActiveTab('HOME')}
              addAuditLog={addAuditLog}
              addSecurityAlert={addSecurityAlert}
            />
          </div>
        )}

        {/* STAFF UNIFIED SIGN IN AUTH SECTION */}
        {activeTab === 'ADMIN_LOGIN' && (
          <div className="max-w-md mx-auto py-10 animate-fade-inFor">
            <div className={`p-8 rounded-3xl border transition-all ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 text-slate-100 shadow-2xl' 
                : 'bg-white border-slate-205 text-slate-900 shadow-xl'
            }`}>
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Staff Authentication Flow</h2>
                <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Unified credentials. Permissions computed automatically.
                </p>
              </div>

              <form onSubmit={handleStaffAuthentication} className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 font-mono ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Staff / Executive Email
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g. secretary@duesflow.edu.gh"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-900 focus:border-emerald-500 text-white placeholder-slate-650' 
                        : 'bg-slate-5 border-slate-200 focus:border-emerald-500 text-slate-950 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 font-mono ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Security bypass password
                  </label>
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter passphrase (or blank to bypass)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-900 focus:border-emerald-500 text-white placeholder-slate-650' 
                        : 'bg-slate-5 border-slate-200 focus:border-emerald-500 text-slate-950 placeholder-slate-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Demo bypass: blank or enter <b>demo</b>
                  </span>
                </div>

                {staffError && (
                  <p className="text-xs text-rose-450 bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl text-center font-semibold">
                    {staffError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-black rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {staffLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Evaluating credentials...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 text-white" />
                      Sign In to Console
                    </>
                  )}
                </button>
              </form>

              {/* Role bypass cards for easy execution check */}
              <div className={`mt-6 pt-5 border-t ${
                isDarkMode ? 'border-slate-900' : 'border-slate-100'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 font-mono ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  AUTOMATIC ROLE RESOLUTION DIRECT-DIALS:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-black tracking-wider">
                  <button
                    onClick={() => {
                      setStaffEmail('secretary@duesflow.edu.gh');
                      setStaffPassword('demo');
                      setStaffError('');
                    }}
                    className={`py-2 px-1 border rounded-lg cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border-slate-900' : 'bg-slate-50 hover:bg-slate-100 border-slate-205'
                    }`}
                  >
                    F. Secretary
                  </button>
                  <button
                    onClick={() => {
                      setStaffEmail('president@duesflow.edu.gh');
                      setStaffPassword('demo');
                      setStaffError('');
                    }}
                    className={`py-2 px-1 border rounded-lg cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border-slate-900' : 'bg-slate-50 hover:bg-slate-100 border-slate-205'
                    }`}
                  >
                    President
                  </button>
                  <button
                    onClick={() => {
                      setStaffEmail('admin@duesflow.edu.gh');
                      setStaffPassword('demo');
                      setStaffError('');
                    }}
                    className={`py-2 px-1 border rounded-lg cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 hover:bg-slate-900 border-slate-900' : 'bg-slate-50 hover:bg-slate-100 border-slate-205'
                    }`}
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
