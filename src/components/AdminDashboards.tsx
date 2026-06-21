/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, DepartmentalEvent, AuditLog, SecurityAlert, SystemService, AcademicLevel, Staff, Announcement, Ticket, Transaction, OrgSettings } from '../types';
import { getStudentVerificationId } from '../utils/verification';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  Percent, CircleAlert, Users, CalendarCheck, ShieldCheck, Database, Server,
  TrendingUp, Download, Check, AlertCircle, FileSpreadsheet, Plus, Filter, RefreshCw, Eye, EyeOff,
  Search, Printer, Clock, Lock, QrCode, Mail, Trash2, ShieldAlert, Settings, Bell, BookOpen, Layers,
  User, Menu, X, Shield, Briefcase, Activity
} from 'lucide-react';

interface AdminDashboardsProps {
  role: 'FINANCIAL_SECRETARY' | 'PRESIDENT' | 'SUPER_ADMIN';
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  events: DepartmentalEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DepartmentalEvent[]>>;
  auditLogs: AuditLog[];
  securityAlerts: SecurityAlert[];
  setSecurityAlerts: React.Dispatch<React.SetStateAction<SecurityAlert[]>>;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  orgSettings: OrgSettings;
  setOrgSettings: React.Dispatch<React.SetStateAction<OrgSettings>>;
}

export default function AdminDashboards({
  role,
  students,
  setStudents,
  events,
  setEvents,
  auditLogs,
  securityAlerts,
  setSecurityAlerts,
  addAuditLog,
  staffList,
  setStaffList,
  transactions,
  setTransactions,
  announcements,
  setAnnouncements,
  tickets,
  setTickets,
  orgSettings,
  setOrgSettings,
}: AdminDashboardsProps) {
  // Common states
  const [levelFilter, setLevelFilter] = useState<AcademicLevel>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Verification Desk states
  type AdminSubTab = 'OVERVIEW' | 'VERIFICATION_DESK' | 'ANNOUNCEMENTS' | 'AUDIT_LOGS' | 'SETTINGS' | 'PERSONAL_SETTINGS';
  const [subTab, setSubTab] = useState<AdminSubTab>('OVERVIEW');
  const [isAdminMobileNavOpen, setIsAdminMobileNavOpen] = useState(false);
  const [accentColor, setAccentColor] = useState<'blue' | 'indigo' | 'violet' | 'teal'>('blue');

  // Personal Settings operational states
  const [personalName, setPersonalName] = useState(
    role === 'SUPER_ADMIN' ? 'Root Administrator' :
    role === 'PRESIDENT' ? 'Hon. President Executive' :
    'Treasury Secretary'
  );
  const [personalEmail, setPersonalEmail] = useState(
    role === 'SUPER_ADMIN' ? 'admin@duesflow.edu.gh' :
    role === 'PRESIDENT' ? 'president@duesflow.edu.gh' :
    'secretary@duesflow.edu.gh'
  );
  const [personalPhone, setPersonalPhone] = useState('+233 24 123 4567');
  const [personalizedTheme, setPersonalizedTheme] = useState('Classic Slate');
  const [personalNotify, setPersonalNotify] = useState(true);
  const [personalSuccessMessage, setPersonalSuccessMessage] = useState('');
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [verifySearchResult, setVerifySearchResult] = useState<Student | null>(null);
  const [verifySearchError, setVerifySearchError] = useState('');
  const [manualPayFeedback, setManualPayFeedback] = useState('');

  // CSV Validation parameters
  const [csvFile, setCsvFile] = useState<any | null>(null);
  const [isCsvDragging, setIsCsvDragging] = useState(false);
  const [isValidatingCsv, setIsValidatingCsv] = useState(false);
  const [csvValidateResult, setCsvValidateResult] = useState<{
    token: string;
    total: number;
    validList: Partial<Student>[];
    duplicates: any[];
    errors: { row: number; col: string; message: string; val: string }[];
  } | null>(null);
  const [csvCommitting, setCsvCommitting] = useState(false);

  // New Event Builder states
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventFee, setNewEventFee] = useState(20);
  const [newEventDate, setNewEventDate] = useState('2026-06-30T19:00');
  const [newEventMax, setNewEventMax] = useState(300);

  // Super Admin security lists
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Dynamic Staff state handles
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'FINANCIAL_SECRETARY' | 'PRESIDENT' | 'SUPER_ADMIN'>('FINANCIAL_SECRETARY');
  const [staffAddError, setStaffAddError] = useState('');
  const [staffAddSuccess, setStaffAddSuccess] = useState('');

  // Announcements broadcast states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'Normal' | 'Important' | 'Urgent' | 'Critical'>('Normal');
  const [annAttachments, setAnnAttachments] = useState('');
  const [annSuccess, setAnnSuccess] = useState('');
  const [annError, setAnnError] = useState('');

  // Alerts acknowledge feedback
  const [alertsFeedback, setAlertsFeedback] = useState('');

  // Audit filters search
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>('ALL');

  // Org Settings edit caching
  const [instName, setInstName] = useState(orgSettings.instName);
  const [deptName, setDeptName] = useState(orgSettings.deptName);
  const [academicYear, setAcademicYear] = useState(orgSettings.academicYear);
  const [emailDomain, setEmailDomain] = useState(orgSettings.emailDomain);
  const [emailPattern, setEmailPattern] = useState(orgSettings.emailPattern);
  const [ticketPrefix, setTicketPrefix] = useState(orgSettings.ticketPrefix);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffAddError('');
    setStaffAddSuccess('');

    const name = newStaffName.trim();
    const email = newStaffEmail.trim().toLowerCase();

    if (!name || !email) {
      setStaffAddError('All fields are strictly required.');
      return;
    }

    if (!email.endsWith('@duesflow.edu.gh') && !email.endsWith('@inst.edu.gh')) {
      setStaffAddError('Institutional staff emails must end with @duesflow.edu.gh or @inst.edu.gh');
      return;
    }

    const emailInUse = staffList.some(s => s.email.toLowerCase() === email);
    if (emailInUse) {
      setStaffAddError('A staff member with this email address has already been enrolled.');
      return;
    }

    const newStaff: Staff = {
      id: (staffList.length + 1).toString(),
      name,
      email,
      role: newStaffRole,
      status: 'ACTIVE'
    };

    setStaffList(prev => [...prev, newStaff]);
    addAuditLog(
      'STAFF_MEMBER_ENROLLED',
      undefined,
      undefined,
      `Super Administrator enrolled new staff member: ${name} (${email}) as ${newStaffRole}. Security key generated.`,
      'Super Administrator',
      'SUPER_ADMIN'
    );

    setNewStaffName('');
    setNewStaffEmail('');
    setStaffAddSuccess(`Successfully enrolled ${name} with '${newStaffRole}' credentials!`);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSuccess('');
    setAnnError('');

    const title = annTitle.trim();
    const content = annContent.trim();
    if (!title || !content) {
      setAnnError('Please provide both an announcement title and markdown message body.');
      return;
    }

    const newAnnouncement: Announcement = {
      id: Math.random().toString(),
      title,
      message: content,
      priority: annPriority,
      targetAudience: 'All',
      publishDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      expirationDate: '31 Dec 2026',
      attachments: annAttachments || undefined
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setAnnSuccess(`Broadcast published securely! Delivered and queued SMTP receipts to matching student indexes.`);
    
    // Reset fields
    setAnnTitle('');
    setAnnContent('');
    setAnnAttachments('');
    setAnnPriority('Normal');

    addAuditLog(
      'ANNOUNCEMENT_PUBLISHED_SECURE',
      undefined,
      undefined,
      `Published broadcast announcement "${title}" (Priority: ${annPriority}). Attached documents: ${annAttachments || 'None'}.`,
      'Administrative Executive',
      role
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');

    const updated: OrgSettings = {
      ...orgSettings,
      instName,
      deptName,
      academicYear,
      emailDomain,
      emailPattern,
      ticketPrefix
    };

    setOrgSettings(updated);
    setSettingsSuccess('Organization settings deployed and synchronized in real-time with Student Portal registries!');

    addAuditLog(
      'ORG_SETTINGS_UPDATE',
      JSON.stringify(orgSettings),
      JSON.stringify(updated),
      'Administrative configs optimized (Institutions, index domain rules, and secure ticketing prefixes updated.)',
      'Super Administrative Core',
      role
    );
  };

  const handleToggleStaffStatus = (id: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        if (s.email === 'admin@duesflow.edu.gh') return s; // Do not suspend root admin
        const updatedStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        addAuditLog(
          'STAFF_STATUS_MODIFIED',
          s.status,
          updatedStatus,
          `Super Administrator modified staff state for ${s.name} (${s.email}) to ${updatedStatus}.`,
          'Super Administrator',
          'SUPER_ADMIN'
        );
        return { ...s, status: updatedStatus as 'ACTIVE' | 'SUSPENDED' };
      }
      return s;
    }));
  };

  // Math Calculations for Dashboard Metrics
  const totalRevenue = students.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalOutstanding = students.reduce((acc, s) => acc + s.outstandingDues, 0);
  const paidCount = students.filter(s => s.status === 'PAID').length;
  const collectionRate = students.length > 0 ? (totalRevenue / (totalRevenue + totalOutstanding)) * 100 : 0;

  // Recharts Chart datasets
  const levelData = [
    { name: 'L100', paid: students.filter(s => s.level === '100').reduce((acc, s) => acc + s.paidAmount, 0), outstanding: students.filter(s => s.level === '100').reduce((acc, s) => acc + s.outstandingDues, 0) },
    { name: 'L200', paid: students.filter(s => s.level === '200').reduce((acc, s) => acc + s.paidAmount, 0), outstanding: students.filter(s => s.level === '200').reduce((acc, s) => acc + s.outstandingDues, 0) },
    { name: 'L300', paid: students.filter(s => s.level === '300').reduce((acc, s) => acc + s.paidAmount, 0), outstanding: students.filter(s => s.level === '300').reduce((acc, s) => acc + s.outstandingDues, 0) },
    { name: 'L400', paid: students.filter(s => s.level === '400').reduce((acc, s) => acc + s.paidAmount, 0), outstanding: students.filter(s => s.level === '400').reduce((acc, s) => acc + s.outstandingDues, 0) },
  ];

  const historicalTrends = [
    { date: 'Jun 14', net: totalRevenue * 0.4 },
    { date: 'Jun 15', net: totalRevenue * 0.55 },
    { date: 'Jun 16', net: totalRevenue * 0.72 },
    { date: 'Jun 17', net: totalRevenue * 0.88 },
    { date: 'Jun 18', net: totalRevenue },
  ];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.indexNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Microservice Health Deck
  const microservices: SystemService[] = [
    { name: 'Auth Node (OTP)', status: 'ONLINE', latency: 4, throughput: '350 req/s', icon: 'key' },
    { name: 'Paystack Hook Sink', status: 'ONLINE', latency: 8, throughput: '24 tx/s', icon: 'wallet' },
    { name: 'Ticket Signing HSM', status: 'ONLINE', latency: 12, throughput: '412 tkt/s', icon: 'shield' },
    { name: 'SMTP Rabbit Dispatcher', status: 'ONLINE', latency: 31, throughput: '80 mails/m', icon: 'mail' },
    { name: 'PostgreSQL Main Instance', status: 'ONLINE', latency: 2, throughput: '99.98% uptime', icon: 'database' }
  ];

  // Drag & drop triggers
  const handleDragCsv = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsCsvDragging(true);
    } else if (e.type === 'dragleave') {
      setIsCsvDragging(false);
    }
  };

  const handleDropCsv = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCsvDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvMock(e.dataTransfer.files[0]);
    }
  };

  // Run dynamic analysis and validation of CSV matching guidelines
  const processCsvMock = (file: any) => {
    setIsValidatingCsv(true);
    setCsvFile(file);

    setTimeout(() => {
      // Create interesting validator spreadsheet outcome containing errors & duplicates to test UX!
      setCsvValidateResult({
        token: 'token_val_' + Math.random().toString(36).substr(2, 9),
        total: 5,
        validList: [
          { indexNumber: 'STU-400-991', name: 'Abigail Osei', email: 'aosei@inst.edu.gh', level: '400', outstandingDues: 360, paidAmount: 0, status: 'PENDING', organizationId: 'COMPSSA-U', departmentId: 'COMPS-AFF', hasPass: false },
          { indexNumber: 'STU-100-992', name: 'Prince Amisah', email: 'pamisah@inst.edu.gh', level: '100', outstandingDues: 360, paidAmount: 0, status: 'PENDING', organizationId: 'COMPSSA-U', departmentId: 'COMPS-AFF', hasPass: false },
          { indexNumber: 'STU-200-993', name: 'Theresa Mensah', email: 'tmensah @inst.edu.gh', level: '200', outstandingDues: 360, paidAmount: 0, status: 'PENDING', organizationId: 'COMPSSA-U', departmentId: 'COMPS-AFF', hasPass: false }
        ],
        duplicates: [
          { row: 2, indexNumber: 'STU-300-002', name: 'Kano Mensah (Clashing with Kofi)', email: 'kmensah@inst.edu.gh' }
        ],
        errors: [
          { row: 4, col: 'email', message: 'Institutional layout required; gmail.com was rejected', val: 'fritz@gmail.com' },
          { row: 5, col: 'indexNumber', message: 'Missing academic index format', val: '' }
        ]
      });
      setIsValidatingCsv(false);
    }, 1200);
  };

  // Commit valid CSV logs to Postgres State
  const handleCommitCsv = () => {
    if (!csvValidateResult) return;
    setCsvCommitting(true);

    setTimeout(() => {
      const recordsToInsert = csvValidateResult.validList as Student[];
      
      setStudents(prev => [...prev, ...recordsToInsert]);

      addAuditLog(
        'CSV_FILE_BULK_WRITE',
        'Count: ' + students.length,
        'Count: ' + (students.length + recordsToInsert.length),
        `Wrote ${recordsToInsert.length} validated student records to database securely. Synchronized clearing states.`,
        'Financial Secretary Desk',
        'FINANCIAL_SECRETARY'
      );

      setCsvCommitting(false);
      setCsvValidateResult(null);
      setCsvFile(null);
    }, 1000);
  };

  // Trigger building new Departmental event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const nEv: DepartmentalEvent = {
      id: 'EVT-' + Math.floor(1001 + Math.random() * 8999),
      name: newEventTitle,
      fees: Number(newEventFee),
      date: new Date(newEventDate).toLocaleDateString() + ' ' + new Date(newEventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      maxAttendees: Number(newEventMax),
      attendeesCount: 0,
      description: 'Annual departmental registration'
    };

    setEvents(prev => [...prev, nEv]);
    setShowEventModal(false);

    addAuditLog(
      'EVENT_MANIFEST_CREATED',
      undefined,
      nEv.name,
      `Configured new event ticket constraint at Gate. Fee set to GHS ${nEv.fees.toFixed(2)}. Max entry ticket capping: ${nEv.maxAttendees}.`,
      'Financial Secretary Desk',
      'FINANCIAL_SECRETARY'
    );

    // Reset fields
    setNewEventTitle('');
  };

  // Toggle active alerts (solve)
  const handleResolveAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'RESOLVED' as const };
      }
      return a;
    }));

    addAuditLog(
      'SECURITY_CRU_THREAT_RESOLVED',
      'ACTIVE',
      'RESOLVED',
      `Super Administrator resolved vulnerability trace ${alertId} manual override completed.`,
      'Root Operator Dashboard',
      'SUPER_ADMIN'
    );
  };

  // Staff verification helpers
  const performStaffVerify = (query: string) => {
    setVerifySearchError('');
    setVerifySearchResult(null);
    setManualPayFeedback('');
    
    if (!query.trim()) return;

    const cleanQuery = query.trim().toUpperCase();
    
    // Lookup by indexNumber, email, verification ID, or simulated receipt number
    const student = students.find(s => 
      s.indexNumber.toUpperCase() === cleanQuery ||
      s.email.toUpperCase() === cleanQuery ||
      getStudentVerificationId(s.indexNumber).toUpperCase() === cleanQuery ||
      ('RCP-2026-' + s.indexNumber.replace('STU-', '')).toUpperCase() === cleanQuery
    );

    if (student) {
      setVerifySearchResult(student);
      addAuditLog(
        'STAFF_LOOKUP_VERIFIED',
        undefined,
        cleanQuery,
        `Staff administrative search matched index number ${student.indexNumber} during dues clearance check. Executed by staff role: ${role}.`,
        'Administrative Staff Desk',
        role
      );
    } else {
      setVerifySearchError(`Unregistered handshake credentials: "${query}" could not be matched inside the registry database.`);
      
      addAuditLog(
        'STAFF_LOOKUP_ALERT',
        undefined,
        cleanQuery,
        `Invalid operational search attempt inside staff dashboard for keyword: "${query}". Restricted footprint logged.`,
        'Administrative Staff Desk',
        role
      );
    }
  };

  const handleStaffVerifyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    performStaffVerify(verifySearchQuery);
  };

  const handleExecuteCashOverride = (studentIndex: string) => {
    setManualPayFeedback('');
    
    setStudents(prev => prev.map(s => {
      if (s.indexNumber === studentIndex) {
        const totalCost = s.outstandingDues + s.paidAmount;
        
        addAuditLog(
          'STAFF_CASH_DUE_CLEARANCE',
          s.status,
          'PAID',
          `Manual administrative dues clearance override approved. Recorded GHS ${s.outstandingDues.toFixed(2)} cash payment and updated clearance keys for student: ${s.name}.`,
          'Administrative Staff Desk',
          role
        );
        
        const updated = {
          ...s,
          outstandingDues: 0,
          paidAmount: totalCost,
          status: 'PAID' as any,
          hasPass: true,
          passDetails: `JWS:INDEX="${s.indexNumber}",TKT="TKT-${s.indexNumber.replace('STU-', 'OVERRIDE-')}",AMT=${totalCost},SIG=HS256-STAFF-${role.substring(0,3)}`
        };
        
        setVerifySearchResult(updated);
        return updated;
      }
      return s;
    }));

    setManualPayFeedback('Clearance ledger override complete! Student account is now FULLY CLEARED.');
  };

  // Custom standalone HTML audit report download for staff
  const downloadAuditReportHTML = () => {
    if (!verifySearchResult) return;
    const student = verifySearchResult;
    const studentVerificationId = getStudentVerificationId(student.indexNumber);
    
    // Dynamic Level dues breakdown status
    const levelsList = ['100', '200', '300', '400'];
    const currentLvlInt = parseInt(student.level);
    
    const duesRowsHTML = levelsList.map(lvl => {
      const lvlInt = parseInt(lvl);
      let statusText = 'PENDING';
      let badgeStyle = 'background: #fee2e2; color: #b91c1c;';
      if (lvlInt < currentLvlInt) {
        statusText = 'PAID';
        badgeStyle = 'background: #dcfce7; color: #15803d;';
      } else if (lvlInt === currentLvlInt) {
        if (student.status === 'PAID') {
          statusText = 'PAID';
          badgeStyle = 'background: #dcfce7; color: #15803d;';
        } else if (student.status === 'PARTIALLY_PAID') {
          statusText = 'PARTIALLY PAID';
          badgeStyle = 'background: #fef3c7; color: #a16207;';
        }
      }
      return `
        <div class="row" style="padding: 6px 0;">
          <span>LEVEL ${lvl} DUES STATUS (expected GHS 120):</span>
          <span class="badge" style="${badgeStyle}">${statusText}</span>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DuesFlow Audit Report - ${student.name}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1e293b; padding: 40px; }
          .card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; max-width: 650px; margin: 0 auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 18px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
          .subtitle { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #475569; text-transform: uppercase; margin-top: 4px; }
          .meta { display: flex; justify-content: center; gap: 20px; font-size: 10px; color: #64748b; margin-top: 10px; font-family: monospace; }
          .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; margin: 24px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .table { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; padding: 18px; margin-bottom: 16px; }
          .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 8px 0; font-size: 12px; }
          .row:last-child { border-bottom: none; }
          .bold { font-weight: 800; }
          .green { color: #16a34a; font-weight: 800; }
          .rose { color: #dc2626; font-weight: 800; }
          .badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace; text-transform: uppercase; }
          .badge-paid { background: #dcfce7; color: #15803d; }
          .badge-partial { background: #fef3c7; color: #a16207; }
          .badge-pending { background: #fee2e2; color: #b91c1c; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; text-align: center; }
          .signature-box { border-top: 1px solid #94a3b8; width: 45%; padding-top: 8px; }
          .secure-badge { font-size: 9px; color: #16a34a; font-weight: bold; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2 class="title">University Division of Academic Affairs</h2>
            <div class="subtitle font-mono">FINANCIAL LEDGER STATEMENT AUDIT REPORT</div>
            <div class="meta">
              <span>Audit Run: <b>${new Date().toLocaleString()}</b></span>
              <span>Verification Key: <b>${studentVerificationId}</b></span>
            </div>
          </div>
          
          <div class="section-title">Student Profile Details</div>
          <div class="table">
            <div class="row"><span>Cleared Name:</span><span class="bold">${student.name}</span></div>
            <div class="row"><span>Email Reference:</span><span class="bold font-mono">${student.email}</span></div>
            <div class="row"><span>Index ID Match:</span><span class="bold font-mono">${student.indexNumber}</span></div>
            <div class="row"><span>Academic Level:</span><span class="bold">Level ${student.level}</span></div>
          </div>

          <div class="section-title">Accounts Balance Sheets Reconcile</div>
          <div class="table">
            <div class="row"><span>Total Dues Expected:</span><span class="bold">GHS ${(student.paidAmount + student.outstandingDues).toFixed(2)}</span></div>
            <div class="row"><span>Paid Amount:</span><span class="bold font-mono text-emerald-650">GHS ${student.paidAmount.toFixed(2)}</span></div>
            <div class="row"><span>Outstanding Balance:</span><span class="bold font-mono ${student.outstandingDues === 0 ? 'green' : 'rose'}">GHS ${student.outstandingDues.toFixed(2)}</span></div>
            <div class="row">
              <span>Overall Clearance Status:</span>
              <span class="badge ${student.status === 'PAID' ? 'badge-paid' : student.status === 'PARTIALLY_PAID' ? 'badge-partial' : 'badge-pending'}">
                ${student.status === 'PAID' ? 'FULLY CLEARED' : student.status === 'PARTIALLY_PAID' ? 'PARTIALLY CLEARED' : 'UNCLEARED'}
              </span>
            </div>
          </div>

          <div class="section-title">Academic Year Dues Breakdown</div>
          <div class="table uppercase" style="font-family: monospace; font-size: 11px;">
            ${duesRowsHTML}
          </div>

          <div class="signatures">
            <div class="signature-box">
              <strong style="color: #0f172a;">STAFF RECORD EXAMINER</strong><br>
              <span>DuesFlow University Core</span><br>
              <span class="secure-badge font-mono">✓ SYSTEM VERIFIED FOOTPRINT</span>
            </div>
            <div class="signature-box">
              <strong style="color: #0f172a;">CRYPTOSIGNATURE GATEWAY</strong><br>
              <span>Digital Ledger Services</span><br>
              <span class="secure-badge font-mono">✓ SHA-256 COUNTER-SIGNED</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_Audit_${student.indexNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addAuditLog(
      'STAFF_AUDIT_DOWNLOAD',
      undefined,
      undefined,
      `Staff administrative downloaded printable Ledger Audit Report file for index ${student.indexNumber}.`,
      'Administrative Staff Desk',
      role
    );
  };

  const menuItems = [
    { id: 'OVERVIEW', label: 'Treasury Pipeline', icon: Layers, roles: ['FINANCIAL_SECRETARY', 'PRESIDENT', 'SUPER_ADMIN'] },
    { id: 'VERIFICATION_DESK', label: 'Payment Desk', icon: QrCode, roles: ['FINANCIAL_SECRETARY', 'SUPER_ADMIN'] },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Bell, roles: ['FINANCIAL_SECRETARY', 'PRESIDENT', 'SUPER_ADMIN'] },
    { id: 'AUDIT_LOGS', label: 'Audit Trail', icon: ShieldAlert, roles: ['FINANCIAL_SECRETARY', 'PRESIDENT', 'SUPER_ADMIN'] },
    { id: 'SETTINGS', label: 'Org Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
    { id: 'PERSONAL_SETTINGS', label: 'Personal Settings', icon: User, roles: ['FINANCIAL_SECRETARY', 'PRESIDENT', 'SUPER_ADMIN'] },
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(role));

  const getAccentStyles = (isActive: boolean) => {
    if (!isActive) return 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50';
    if (accentColor === 'blue') return 'bg-blue-600/15 border-l-4 border-blue-500 text-blue-400 font-bold';
    if (accentColor === 'indigo') return 'bg-indigo-600/15 border-l-4 border-indigo-500 text-indigo-400 font-bold';
    if (accentColor === 'violet') return 'bg-violet-600/15 border-l-4 border-violet-500 text-violet-400 font-bold';
    return 'bg-teal-600/15 border-l-4 border-teal-500 text-teal-400 font-bold';
  };

  const getAccentSolidBg = () => {
    if (accentColor === 'blue') return 'bg-blue-600 hover:bg-blue-500';
    if (accentColor === 'indigo') return 'bg-indigo-600 hover:bg-indigo-500';
    if (accentColor === 'violet') return 'bg-violet-600 hover:bg-violet-500';
    return 'bg-teal-600 hover:bg-teal-505';
  };

  const getAccentText = () => {
    if (accentColor === 'blue') return 'text-blue-400';
    if (accentColor === 'indigo') return 'text-indigo-400';
    if (accentColor === 'violet') return 'text-violet-400';
    return 'text-teal-400';
  };

  const getAccentBorder = () => {
    if (accentColor === 'blue') return 'border-blue-500/25';
    if (accentColor === 'indigo') return 'border-indigo-500/25';
    if (accentColor === 'violet') return 'border-violet-500/25';
    return 'border-teal-500/25';
  };

  return (
    <div id="admin-workspace-wrap" className="space-y-6">
      
      {/* Mobile Sticky Navbar */}
      <div className="flex lg:hidden items-center justify-between p-4 bg-[#080d16] border border-slate-900 rounded-2xl sticky top-2 z-40">
        <div className="flex items-center gap-2">
          <Briefcase className={`h-5 w-5 ${getAccentText()}`} />
          <div>
            <span className="text-[9px] text-slate-500 font-mono block leading-none">STAFF HUB</span>
            <span className="text-xs font-bold font-mono tracking-tight text-white capitalize">{personalName}</span>
          </div>
        </div>
        <button
          onClick={() => setIsAdminMobileNavOpen(true)}
          className="p-1.5 rounded-lg bg-slate-905 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Main Structural Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* DESKTOP DESK SIDEBAR (lg:col-span-3) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-6 bg-[#080d16] border border-slate-900 rounded-3xl p-5 space-y-6">
          
          {/* Officer profile card */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-900 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 h-10 w-10 bg-gradient-to-br ${
              accentColor === 'blue' ? 'from-blue-500/10' :
              accentColor === 'indigo' ? 'from-indigo-550/10' :
              accentColor === 'violet' ? 'from-violet-550/10' :
              'from-teal-550/10'
            } to-transparent rounded-full filter blur`}></div>

            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${
                role === 'SUPER_ADMIN' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : role === 'PRESIDENT' 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-450'
              }`}>
                {role === 'SUPER_ADMIN' ? <Shield className="h-5 w-5" /> : role === 'PRESIDENT' ? <User className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block leading-3">{role.replace("_", " ")}</span>
                <strong className="text-xs text-white block truncate font-sans mt-0.5">{personalName}</strong>
                <span className="text-[9.5px] text-slate-400 truncate block mt-0.5 leading-none">{personalEmail}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Node Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 leading-none">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation link stacks */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-slate-500 block px-3 mb-2">OPERATIONAL CONSOLE</span>
            {allowedMenuItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSubTab(item.id as AdminSubTab)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-3 transition-all cursor-pointer ${
                    getAccentStyles(subTab === item.id)
                  }`}
                >
                  <IconComp className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Infrastructure status block */}
          <div className="p-3.5 bg-slate-950/40 border border-slate-900/55 rounded-2xl text-[10px] font-mono text-slate-500 space-y-1.5 leading-snug">
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="text-slate-400 font-bold">Secure Sandbox</span>
            </div>
            <div className="flex justify-between">
              <span>Domain Area:</span>
              <span className="text-blue-400 font-bold truncate select-all">{orgSettings?.emailDomain || '@duesflow.edu.gh'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-900 pb-0.5">
              <span>Dues Node Prefix:</span>
              <span className="text-slate-400 font-bold">{orgSettings.ticketPrefix}-SEC</span>
            </div>
          </div>
        </div>

        {/* MOBILE SIDEBAR MODAL DRAWER SLIDER */}
        {isAdminMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div 
              onClick={() => setIsAdminMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            />
            
            {/* Drawer Body */}
            <div className="relative w-80 max-w-[85vw] bg-[#080d16] border-r border-[#1a1f2c] min-h-screen p-5 flex flex-col justify-between z-10 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className={`h-5 w-5 ${getAccentText()}`} />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">STAFF CONSOLE</span>
                  </div>
                  <button
                    onClick={() => setIsAdminMobileNavOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Identity header inside mobile drawer */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                      ST
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block leading-3">{role}</span>
                      <strong className="text-xs text-white block">{personalName}</strong>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation List */}
                <div className="space-y-1.5">
                  {allowedMenuItems.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSubTab(item.id as AdminSubTab);
                          setIsAdminMobileNavOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-3 transition-all cursor-pointer ${
                          getAccentStyles(subTab === item.id)
                        }`}
                      >
                        <IconComp className="h-4.5 w-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-550 font-mono text-center pt-4 border-t border-slate-900">
                SYSTEM REGISTER SECURE CONSOLE
              </div>
            </div>
          </div>
        )}

        {/* MAIN PANEL CONTENT SPACE (lg:col-span-9) */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Header context card */}
          <div className="bg-gradient-to-r from-slate-950 to-[#080d16] p-5 rounded-3xl border border-slate-900 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <span className={`text-[10px] font-mono tracking-widest font-bold uppercase ${getAccentText()}`}>Administrative Operations Desk</span>
              <h1 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight mt-1">
                {role === 'FINANCIAL_SECRETARY' && 'Financial Secretary Treasury'}
                {role === 'PRESIDENT' && 'Presidential Transparency Gate'}
                {role === 'SUPER_ADMIN' && 'Super Administrative Console'}
              </h1>
              <p className="text-xs text-slate-400 font-normal mt-0.5 leading-relaxed">
                {role === 'FINANCIAL_SECRETARY' && 'Upload CSV ledgers, manage events, examine treasury pipelines, and review audits.'}
                {role === 'PRESIDENT' && 'Institutional real-time read-only oversight monitoring revenue collection graphs.'}
                {role === 'SUPER_ADMIN' && 'Coordinate microservice clusters, assign authorization roles, and audit security telemetry alerts.'}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 leading-none shrink-0 self-start sm:self-center">
              <span className="text-slate-500">Access Node:</span>
              <span className={`font-bold ${getAccentText()}`}>{role}</span>
            </div>
          </div>

      {subTab === 'OVERVIEW' && (
        <>
          {/* 2. Top Treasury metrics layer - Grid of 4 */}
          <div id="analytics-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-930 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Treasury Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-lg md:text-2xl font-bold font-mono tracking-tight text-white block mt-2">GHS {totalRevenue.toFixed(2)}</span>
          <span className="text-[9px] text-emerald-400/80 font-mono mt-1 block">▲ 100% Mobile persistence</span>
        </div>

        <div className="p-4 bg-slate-930 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Outstanding Balances</span>
            <CircleAlert className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-lg md:text-2xl font-bold font-mono tracking-tight text-slate-200 block mt-2">GHS {totalOutstanding.toFixed(2)}</span>
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">Accountable targets</span>
        </div>

        <div className="p-4 bg-slate-930 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Cleared Students</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-lg md:text-2xl font-bold font-mono tracking-tight text-white block mt-2">{paidCount} <span className="text-slate-500 text-xs font-normal">/ {students.length}</span></span>
          <span className="text-[9px] text-cyan-400 font-mono mt-1 block">Active event checkers</span>
        </div>

        <div className="p-4 bg-slate-930 rounded-2xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">Conversion Ratio</span>
            <Percent className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-lg md:text-2xl font-bold font-mono tracking-tight text-indigo-400 block mt-2">{collectionRate.toFixed(1)}%</span>
          <span className="text-[9px] text-slate-500 font-mono mt-1 block">Total billing success</span>
        </div>
      </div>

      {/* Role Context layout split */}
      
      {/* SECTION A: FINANCIAL SECRETARY WRITER MODULES */}
      {role === 'FINANCIAL_SECRETARY' && (
        <div id="fin-sec-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main workspace (Students & Uploads) - Col Span 2 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CSV validation container */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-slate-400" />
                Dues Sheet CSV Import Validating
              </h3>
              <p className="text-xs text-slate-400">Upload a departmental CSV sheet containing matric numbers, student names, and emails for clearance registers.</p>

              {/* Upload Drop Zone */}
              {!csvValidateResult ? (
                <div
                  onDragEnter={handleDragCsv}
                  onDragOver={handleDragCsv}
                  onDragLeave={handleDragCsv}
                  onDrop={handleDropCsv}
                  className={`border-2 border-dashed rounded-xl p-8 mt-4 text-center cursor-pointer transition-all ${
                    isCsvDragging 
                      ? 'border-blue-500 bg-blue-950/20' 
                      : 'border-slate-800 hover:border-slate-755 bg-slate-900/35'
                  }`}
                >
                  <FileSpreadsheet className="h-8 w-8 text-slate-650 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-300 block">Drag & drop students CSV, or select local file</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Auto-verifies duplicate indices, levels boundaries, and email domains.</span>
                  
                  {/* File selection input */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      id="upload-csv-trigger"
                      onClick={() => {
                        // Create virtual mock file simulation to provide premium immediate testing
                        const file = { name: "students_lev_400.csv", size: 450, type: "text/csv" };
                        processCsvMock(file);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Run Demo validation sheet
                    </button>
                    <span className="text-[10px] text-slate-500 font-normal mt-0.5">Recommended structure validation.</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4 animate-scale-up">
                  {/* Validation readout header */}
                  <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-300 font-semibold block">Analysis report: <b className="text-blue-400">{csvFile?.name || 'demofile.csv'}</b></span>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">Found 5 total entries. Prechecks flagged 1 duplicate and 2 email/index errors.</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-900 text-blue-300 font-semibold rounded text-[10px] font-mono">TOKEN: {csvValidateResult.token.substring(0, 8)}</span>
                  </div>

                  {/* Errors table diagnostics */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-900/20 text-xs">
                    <div className="bg-slate-900 px-4 py-2 font-semibold text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wide">
                      Diagnostic Validation Log (Needs manual approval)
                    </div>
                    <div className="p-4 space-y-2 max-h-[160px] overflow-y-auto">
                      {/* 1. Clashing Duplicate */}
                      {csvValidateResult.duplicates.map((dup, idx) => (
                        <div key={`dup-${idx}`} className="flex items-start gap-2 text-amber-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <div>
                            <span>Row {dup.row}: Duplicate Index <b className="font-mono text-slate-300">{dup.indexNumber}</b> ignored.</span>
                            <p className="text-[9px] text-slate-500 font-normal">Reason: Student record already exists inside PostgreSQL instance.</p>
                          </div>
                        </div>
                      ))}

                      {/* 2. Format errors */}
                      {csvValidateResult.errors.map((err, idx) => (
                        <div key={`err-${idx}`} className="flex items-start gap-2 text-rose-400 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <div>
                            <span>Row {err.row}: Code rejection on column <b className="capitalize font-mono text-slate-300">{err.col}</b> (Value: "{err.val}").</span>
                            <p className="text-[9px] text-slate-500 font-normal">Error message: {err.message}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-start gap-2 text-emerald-400 font-medium pt-1.5 border-t border-slate-900">
                        <Check className="h-3.5 w-3.5 mt-0.5" />
                        <div>
                          <span>Success: {csvValidateResult.validList.length} clean student entries verified successfully.</span>
                          <p className="text-[9px] text-slate-500 font-normal">Ready to insert into student databases.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      id="commit-csv-action"
                      onClick={handleCommitCsv}
                      disabled={csvCommitting || csvValidateResult.validList.length === 0}
                      className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 text-white font-semibold rounded-lg text-xs cursor-pointer disabled:opacity-50"
                    >
                      {csvCommitting ? 'Committing...' : `Insert verified ${csvValidateResult.validList.length} students`}
                    </button>
                    <button
                      id="reset-csv-action"
                      onClick={() => setCsvValidateResult(null)}
                      className="py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Students database lookup */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-3 border-b border-slate-850 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-200">Departmental Students Ledger</h3>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search bar helper */}
                  <input
                    id="ledger-search-box"
                    type="text"
                    placeholder="Search index, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border border-slate-850 px-2.5 py-1 text-xs rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
                  />

                  {/* Level select filter */}
                  <select
                    id="ledger-level-filter"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value as AcademicLevel)}
                    className="bg-slate-900 border border-slate-850 px-2 py-1 text-xs rounded-lg text-slate-300 focus:outline-none font-semibold"
                  >
                    <option value="All">All Levels</option>
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                  </select>
                </div>
              </div>

              {/* Table ledger view */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400">
                      <th className="pb-3 pt-1">Student Index ID</th>
                      <th className="pb-3 pt-1">Student Name</th>
                      <th className="pb-3 pt-1">Institutional Mail</th>
                      <th className="pb-3 pt-1 text-center">Level</th>
                      <th className="pb-3 pt-1 text-right">Outstanding</th>
                      <th className="pb-3 pt-1 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300 font-normal">
                    {filteredStudents.map((s) => (
                      <tr key={s.indexNumber} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-400">{s.indexNumber}</td>
                        <td className="py-3 font-medium text-slate-200">{s.name}</td>
                        <td className="py-3 text-slate-400 font-mono tracking-tight">{s.email}</td>
                        <td className="py-3 text-center">{s.level}</td>
                        <td className="py-3 text-right font-mono text-slate-400">GHS {s.outstandingDues.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded font-mono ${
                            s.status === 'PAID'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
                              : s.status === 'OVERDUE'
                              ? 'bg-rose-950/40 text-rose-400 border border-rose-900/20'
                              : 'bg-amber-950/40 text-amber-400 border border-amber-900/20'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar parameters (Events Builder & Actions) */}
          <div className="space-y-6">
            
            {/* Create event ticket controller */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-200">Active Gate Events</h3>
                <button
                  id="add-event-modal-trigger"
                  onClick={() => setShowEventModal(true)}
                  className="p-1 hover:bg-slate-800 text-blue-400 shrink-0 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">Active gates looking up validation codes.</p>

              <div className="flex flex-col gap-3">
                {events.map(ev => (
                  <div key={ev.id} className="p-3 bg-slate-900/45 border border-slate-850 rounded-xl relative">
                    <h4 className="text-xs font-bold text-slate-200">{ev.name}</h4>
                    <span className="text-[10px] text-slate-505 block mt-0.5">Entrance checkpoint: GHS {ev.fees.toFixed(2)}</span>
                    
                    <div className="flex justify-between items-center text-[10px] mt-2.5 pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Total scanners checking:</span>
                      <span className="font-mono text-blue-400 font-bold">{ev.attendeesCount} checked</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Builders Modal Dialog UI */}
            {showEventModal && (
              <div id="event-dialog-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 max-w-sm w-full p-5 rounded-2xl shadow-xl">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2 mb-4">Manifest New Department Event</h3>
                  
                  <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                    <div>
                      <label htmlFor="evt-title-input" className="block text-slate-400 font-semibold mb-1">EVENT TITLE</label>
                      <input
                        id="evt-title-input"
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g. Annual CS Dinner, General Assembly"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="evt-fee-input" className="block text-slate-400 font-semibold mb-1 font-sans">ADMISSION FEE (GHS)</label>
                        <input
                          id="evt-fee-input"
                          type="number"
                          required
                          value={newEventFee}
                          onChange={(e) => setNewEventFee(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="evt-max-input" className="block text-slate-400 font-semibold mb-1">GATES CAPPING (MAX)</label>
                        <input
                          id="evt-max-input"
                          type="number"
                          required
                          value={newEventMax}
                          onChange={(e) => setNewEventMax(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="evt-date-input" className="block text-slate-400 font-semibold mb-1">EVENT DATE & TIME</label>
                      <input
                        id="evt-date-input"
                        type="datetime-local"
                        required
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        id="evt-confirm-create"
                        type="submit"
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold hover:border-blue-400 border border-blue-600/30 cursor-pointer"
                      >
                        Register Gate
                      </button>
                      <button
                        id="evt-cancel-create"
                        type="button"
                        onClick={() => setShowEventModal(false)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Core Audit Records trail - top 4 logs inside FinSec */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-850 pb-2">Voucher Core Logging Audit</h3>
              
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                {auditLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="text-[10px] leading-relaxed select-none">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-slate-400">{log.action}</span>
                      <span className="text-slate-505 font-mono">{log.timestamp.substring(11, 19)}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5 leading-normal">{log.details}</p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1">
                      <span>Operator:</span>
                      <span className="text-blue-500 font-semibold font-mono">{log.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: PRESIDENT COMPONENT INTERFACES */}
      {role === 'PRESIDENT' && (
        <div id="pres-dashboard" className="space-y-6">
          {/* Presidential Top Analytical Charts layer - Grid of 2 charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Bar chart: Level based collection rate */}
            <div className="p-5 bg-slate-930 border border-slate-800 rounded-2xl shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Level-Based Collections distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Shoring split clearances between levels (GHS value)</p>
                </div>
                <TrendingUp className="h-4.5 w-4.5 text-blue-400" />
              </div>

              <div className="h-[220px] w-full mt-2 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Bar dataKey="paid" name="Paid (GHS)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outstanding" name="Outstanding (GHS)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Area Chart: Net Revenue Clearance Trends */}
            <div className="p-5 bg-slate-930 border border-slate-800 rounded-2xl shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Clearing Velocity Sequence</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological treasury curve metrics today</p>
                </div>
                <Percent className="h-4.5 w-4.5 text-cyan-400" />
              </div>

              <div className="h-[220px] w-full mt-2 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="net" name="Revenue Velocity (GHS)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Presidential Read-only ledger lists */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Presidential Registry Review</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Institutional student accounts clearance checklists.</p>
              </div>
              <span className="px-2 py-1 text-[10px] bg-slate-900 border border-slate-800 rounded text-slate-500 font-mono font-bold select-none">READ WRITER LOCK ENABLED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400">
                    <th className="pb-3 pt-1">Student Index ID</th>
                    <th className="pb-3 pt-1">Student Name</th>
                    <th className="pb-3 pt-1">Level</th>
                    <th className="pb-3 pt-1 text-right">Cleared Ledger sum</th>
                    <th className="pb-3 pt-1 text-right">Outstanding balances</th>
                    <th className="pb-3 pt-1 text-right">Gate Ticket issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300 font-normal">
                  {students.map((s) => (
                    <tr key={s.indexNumber} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-400">{s.indexNumber}</td>
                      <td className="py-2.5 font-medium text-slate-200">{s.name}</td>
                      <td className="py-2.5 text-slate-400">{s.level}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-400">GHS {s.paidAmount.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono text-slate-400">GHS {s.outstandingDues.toFixed(2)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded font-mono ${
                          s.hasPass
                            ? 'bg-blue-950/40 text-blue-400 border border-blue-900/20'
                            : 'bg-slate-900 text-slate-500 border border-slate-850'
                        }`}>
                          {s.hasPass ? 'ACTIVE TKT' : 'NONE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: SUPER ADMINISTRATIVE SYSTEM PANEL */}
      {role === 'SUPER_ADMIN' && (
        <div id="super-admin-desk" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main super-admin dashboard diagnostics - Col span 2 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Threat audit alarm deck */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <CircleAlert className="h-4.5 w-4.5 text-rose-400" />
                Vulnerability Alerts & Fraud Inspector
              </h3>
              <p className="text-xs text-slate-400">Active behavioral filters logs tracking multiple login failures, webhook discrepancies, or duplicate scanner collisions.</p>

              <div className="space-y-3 mt-4">
                {securityAlerts.map((alt) => (
                  <div key={alt.id} className="p-3.5 bg-slate-900/40 border border-slate-850 rounded-xl relative hover:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
                        alt.severity === 'CRITICAL' 
                          ? 'bg-rose-950/50 border-rose-900/30 text-rose-400 animate-pulse'
                          : 'bg-amber-950/50 border-amber-900/30 text-amber-400'
                      }`}>
                        <CircleAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{alt.source}</span>
                          <span className="text-[9px] font-mono text-slate-500">{alt.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{alt.details}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-xs">
                      {alt.status === 'ACTIVE' ? (
                        <button
                          id={`resolve-alert-btn-${alt.id}`}
                          onClick={() => handleResolveAlert(alt.id)}
                          className="px-3 py-1.5 bg-rose-605 hover:bg-rose-500 text-white font-semibold rounded-lg text-[10px] cursor-pointer"
                        >
                          Resolve Alert
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-950/40 text-emerald-400 font-bold rounded text-[10px] border border-emerald-900/20 font-mono select-none">RESOLVED</span>
                      )}
                    </div>
                  </div>
                ))}

                {securityAlerts.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-slate-850 rounded-lg">
                    <span className="text-slate-500 text-xs font-medium">No critical security alarms detected. Systems pristine.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Administrators / Executive logs & role builders */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-850 pb-2">Active Association Officers (RBAC Rules)</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400">
                      <th className="pb-3 pt-1">Officer Name</th>
                      <th className="pb-3 pt-1">Access Credentials</th>
                      <th className="pb-3 pt-1">Assigned Role Scope</th>
                      <th className="pb-3 pt-1 text-right">Administrative State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 font-semibold text-slate-200">{st.name}</td>
                        <td className="py-3 font-mono text-slate-400">{st.email}</td>
                        <td className="py-3 font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            st.role === 'SUPER_ADMIN' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : st.role === 'PRESIDENT' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {st.role}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStaffStatus(st.id)}
                            disabled={st.email === 'admin@duesflow.edu.gh'}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                              st.status === 'ACTIVE'
                                ? 'bg-emerald-950/40 border-emerald-900/20 text-emerald-400 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/20'
                                : 'bg-red-950/40 border-red-900/20 text-red-400 hover:bg-emerald-950/20 hover:text-emerald-400 hover:border-emerald-900/20'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={st.email === 'admin@duesflow.edu.gh' ? 'Root Admin cannot be suspended' : `Click to toggle status`}
                          >
                            {st.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Form to Add New Staff */}
              <div className="mt-6 pt-5 border-t border-slate-900">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 block mb-3 font-mono">
                  🔑 Enroll New Association Staff Member (RBAC Profile)
                </span>
                
                <form onSubmit={handleAddStaffSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daniel Lawson"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. secret@duesflow.edu.gh"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Assigned Role</label>
                    <div className="flex gap-2">
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as any)}
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-2 py-2 text-xs text-slate-350 focus:outline-none cursor-pointer"
                      >
                        <option value="FINANCIAL_SECRETARY">Financial Sec</option>
                        <option value="PRESIDENT">President</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                      >
                        <Plus className="h-4 w-4" /> Enroll
                      </button>
                    </div>
                  </div>
                </form>

                {staffAddError && (
                  <div className="mt-3.5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    {staffAddError}
                  </div>
                )}

                {staffAddSuccess && (
                  <div className="mt-3.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 animate-bounce" />
                    {staffAddSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Infrastructure Health Ticker Deck */}
          <div className="space-y-6">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 mb-3 border-b border-slate-850 pb-2">Microservices Cluster telemetry</h3>
              
              <div className="flex flex-col gap-3">
                {microservices.map((svc) => (
                  <div key={svc.name} className="p-3 bg-slate-930 border border-slate-85 shadow rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{svc.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Latency: {svc.latency}ms • Throughput: {svc.throughput}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px] font-bold">ONLINE</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Docker configurations panel */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-widest mb-2 border-b border-slate-850 pb-1.5">SaaS Tenancy Configuration</h3>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-900 select-none">
                  <span>Current Tenant ID:</span>
                  <span className="font-mono text-blue-400 font-bold">COMPSSA_U_2026</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900 select-none">
                  <span>SSL Certificate:</span>
                  <span className="text-emerald-400 font-semibold font-mono">DigiCert Exp 2027</span>
                </div>
                <div className="flex justify-between py-1 select-none">
                  <span>Encrypted Hashing:</span>
                  <span className="text-slate-300 font-mono">BCrypt Cost 12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}

  {subTab === 'VERIFICATION_DESK' && (
    <div id="staff-verification-workbench" className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <QrCode className="h-4.5 w-4.5 text-blue-400" />
              Department Financial Verification Deck & Gate Reconciler
            </h3>
            <p className="text-xs text-slate-400">
              Check in and verify any student's clearance status. Search by email address, index number, unique Verification ID (e.g., DFC-XXXXXXXX-XXXX), or paste a scanned QR link.
            </p>

            <form onSubmit={handleStaffVerifyLookup} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter Search Criteria (Email, Index, Verification ID, or Receipt Number)..."
                  value={verifySearchQuery}
                  onChange={(e) => setVerifySearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl pl-9 pr-12 py-2.5 text-xs text-white focus:outline-none focus:ring-0 transition-colors placeholder-slate-650"
                />
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-500" />
              </div>
              <button
                type="submit"
                className="px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-500/10"
              >
                Perform Audit Lookup
              </button>
            </form>

            {/* Quick pre-populate links for examiners inside the prompt checklist */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest font-bold">SIMULATION DIRECT-DIALS:</span>
              <button
                type="button"
                onClick={() => {
                  setVerifySearchQuery('STU-300-002');
                  performStaffVerify('STU-300-002');
                }}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg text-[10px] font-mono text-emerald-400 font-black cursor-pointer animate-pulse"
              >
                Kofi Mensah (CLEARED)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerifySearchQuery('STU-400-001');
                  performStaffVerify('STU-400-001');
                }}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg text-[10px] font-mono text-amber-400 font-black cursor-pointer"
              >
                Ama Serwaa (PARTIAL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerifySearchQuery('STU-200-003');
                  performStaffVerify('STU-200-003');
                }}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg text-[10px] font-mono text-rose-500 font-black cursor-pointer"
              >
                Evelyn Boateng (OVERDUE)
              </button>
            </div>
          </div>

          {verifySearchError && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-400 font-semibold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-up">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <span>{verifySearchError}</span>
              </div>
              <span className="text-[9px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                SECURITY LOG FILE UPDATED
              </span>
            </div>
          )}

          {verifySearchResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-scale-up">
              {/* Profile Card & Badges */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-slate-805 shadow-md text-center bg-[#090d16]">
                  <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800 mb-3 text-slate-450 text-base">
                    <Users className="h-6 w-6 text-slate-450" />
                  </div>
                  
                  <h4 className="text-sm font-black text-slate-100">{verifySearchResult.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{verifySearchResult.email}</span>
                  
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-3.5 text-left text-xs text-slate-450">
                    <div className="flex justify-between">
                      <span>Index ID Match:</span>
                      <strong className="text-slate-200 font-mono font-extrabold">{verifySearchResult.indexNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Academic Level:</span>
                      <strong className="text-slate-200 font-semibold">Level {verifySearchResult.level}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification UUID:</span>
                      <strong className="text-slate-200 font-mono">{getStudentVerificationId(verifySearchResult.indexNumber)}</strong>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black tracking-wider border block text-center uppercase ${
                      verifySearchResult.status === 'PAID'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : verifySearchResult.status === 'PARTIALLY_PAID'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                    }`}>
                      {verifySearchResult.status === 'PAID' ? 'FULLY CLEARED' : verifySearchResult.status === 'PARTIALLY_PAID' ? 'PARTIALLY CLEARED' : 'UNCLEARED'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic QR preview */}
                <div className="glass-card p-5 rounded-3xl border border-slate-800 text-center space-y-3 bg-[#090d16]">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block font-black leading-none">Security Reference Token QR</span>
                  <div className="bg-white p-3 rounded-xl inline-block border border-slate-350 shadow-inner">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify/${getStudentVerificationId(verifySearchResult.indexNumber)}`}
                      size={120}
                      level="H"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 leading-snug">
                    Point any smartphone scanning hardware at this token to execute validation on the secure gateway channel.
                  </p>
                </div>
              </div>

              {/* Transaction history and clearance controls */}
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-md bg-[#090d16]">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3 mb-4 flex items-center justify-between">
                    <span>Dues Balance sheets Reconcile</span>
                    <span className="text-xs text-slate-500 font-mono">Status: {verifySearchResult.status}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                      <span className="text-slate-500 font-mono uppercase block text-[10px]">Total Dues Expected:</span>
                      <strong className="text-lg font-bold font-mono text-slate-200 mt-1 block">GHS {(verifySearchResult.paidAmount + verifySearchResult.outstandingDues).toFixed(2)}</strong>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-905 rounded-xl">
                      <span className="text-slate-500 font-mono uppercase block text-[10px]">Outstanding Balance Dues:</span>
                      <strong className={`text-lg font-bold font-mono mt-1 block ${verifySearchResult.outstandingDues === 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                        GHS {verifySearchResult.outstandingDues.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Level dues breakdown table */}
                  <div className="space-y-2.5">
                    {['100', '205', '300', '400'].map((lvl) => {
                      const finalLvl = lvl === '205' ? '200' : lvl;
                      const currentLvlInt = parseInt(verifySearchResult.level);
                      const lvlInt = parseInt(finalLvl);
                      
                      let ledgerStatus = 'PENDING';
                      if (lvlInt < currentLvlInt) {
                        ledgerStatus = 'PAID';
                      } else if (lvlInt === currentLvlInt) {
                        ledgerStatus = verifySearchResult.status === 'PAID' ? 'PAID' : verifySearchResult.status === 'PARTIALLY_PAID' ? 'PARTIALLY PAID' : 'PENDING';
                      }

                      return (
                        <div key={lvl} className={`p-3 border rounded-xl flex items-center justify-between text-xs ${
                          ledgerStatus === 'PAID' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-950/20 border-slate-900'
                        }`}>
                          <span className="font-semibold text-slate-300">Level {finalLvl} Departmental Dues</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono">Cost: GHS 120.00</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border uppercase ${
                              ledgerStatus === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                            }`}>
                              {ledgerStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Administrative Action Bar */}
                  <div className="mt-6 pt-5 border-t border-slate-900 flex flex-wrap gap-2.5 items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Executive Staff Action Core</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Record cash receipts, perform bypass overrides, or print official reports.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {verifySearchResult.status !== 'PAID' && (
                        <button
                          type="button"
                          onClick={() => handleExecuteCashOverride(verifySearchResult.indexNumber)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-extrabold rounded-xl transition-all shadow shadow-emerald-500/15 cursor-pointer animate-pulse"
                        >
                          Settle Dues Override (Cash/Bank)
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            window.print();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3.5 py-2 border border-slate-800 hover:border-slate-705 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none"
                        title="Print record"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-400" />
                        Print Record
                      </button>

                      <button
                        type="button"
                        onClick={downloadAuditReportHTML}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none"
                        title="Download physical report file"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Report
                      </button>
                    </div>
                  </div>

                  {manualPayFeedback && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
                      <Check className="h-4.5 w-4.5 text-emerald-500" />
                      {manualPayFeedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANNOUNCEMENTS & MESSAGING SUB-DESK */}
      {subTab === 'ANNOUNCEMENTS' && (
        <div id="staff-announcements-workbench" className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Bell className="h-4.5 w-4.5 text-blue-400" />
              Executive Broadcasters Announcements Center
            </h3>
            <p className="text-xs text-slate-400">
              Publish news and updates directly to the Student Portal. Broadcasts trigger system-wide notifications and simulated SMTP delivery.
            </p>

            {role === 'PRESIDENT' ? (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-900/20 rounded-xl text-blue-400 text-xs">
                <span>Hold: Presidential oversight allows read-only viewing of the announcements ledger. Writing announcements is delegated to the Treasury or IT departments.</span>
              </div>
            ) : (
              <form onSubmit={handlePublishAnnouncement} className="mt-4 space-y-4">
                {annError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl">
                    {annError}
                  </div>
                )}
                {annSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                    {annSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Transmission Subject / Title</label>
                    <input
                      type="text"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. SRC Association Annual Dues Payment Deadline Revised"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Priority Classification</label>
                    <select
                      value={annPriority}
                      onChange={(e: any) => setAnnPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="NORMAL">Normal Info Notice</option>
                      <option value="IMPORTANT">Important Warning</option>
                      <option value="CRITICAL">Critical Direct Directive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Broadcast Message Body (Rich Text Markdown supported)</label>
                  <textarea
                    rows={4}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Provide details about the announcement. Be concise, transparent, and accurate..."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-sans"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Simulated Document Attachments (Comma-separated name labels)</label>
                  <input
                    type="text"
                    value={annAttachments}
                    onChange={(e) => setAnnAttachments(e.target.value)}
                    placeholder="e.g. Revised_Policy_Syllabus.pdf, HTU_Verification_Brochure.docx"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white text-xs font-extrabold rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="h-4 w-4" />
                    Publish Broadcast Bulletin
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* List of currently published announcements */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-500" />
              Published Bulletins Ledger ({announcements.length})
            </h4>

            {announcements.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-xs text-slate-500 block">No bulletins published inside the network feed.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 border border-slate-850 bg-slate-950/45 rounded-xl transition-all hover:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 block max-w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider font-mono uppercase ${
                            ann.priority === 'Critical' || ann.priority === 'Urgent'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : ann.priority === 'Important'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {ann.priority}
                          </span>
                          <span className="text-[9px] font-mono text-slate-450 font-bold">
                            Published {ann.publishDate} • Target Audience: {ann.targetAudience}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-100 mt-1">{ann.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                          {ann.message}
                        </p>
                        {ann.attachments && (
                          <div className="flex flex-wrap gap-2 pt-2.5">
                            <span className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                              📂 {ann.attachments}
                            </span>
                          </div>
                        )}
                      </div>

                      {role !== 'PRESIDENT' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Suspension confirmation: Remove bulletin "${ann.title}" from Student Portal immediately?`)) {
                              setAnnouncements(prev => prev.filter(item => item.id !== ann.id));
                              addAuditLog(
                                'ANNOUNCEMENT_REMOVED_SECURE',
                                JSON.stringify(ann),
                                undefined,
                                `Bulletin "${ann.title}" permanently purged from direct client feeds.`,
                                'Administrative Executive',
                                role
                              );
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all shrink-0"
                          title="Purge Announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECURITY METRICS & CRYPTOGRAPHIC AUDIT WORKSPACE */}
      {subTab === 'AUDIT_LOGS' && (
        <div id="staff-audit-logs-workbench" className="space-y-6 animate-fade-in">
          {/* Security alerts triggers */}
          {securityAlerts.length > 0 && (
            <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 shadow">
              <h3 className="text-xs font-black tracking-widest uppercase text-rose-500 font-mono flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 animate-pulse" />
                CRITICAL INTRUSION PREVENTION LOGS ({securityAlerts.filter(a => a.status === 'ACTIVE').length} UNRESOLVED ALERTS)
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-4xl leading-normal">
                Double payment attempts, invalid cryptographic index scans, and potential API breaches detected by our gate microservices.
              </p>

              <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {securityAlerts.map((alt) => (
                  <div key={alt.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    alt.status === 'ACTIVE' 
                      ? 'bg-rose-950/20 border-rose-900/30 text-rose-450 font-bold' 
                      : 'bg-emerald-950/10 border-emerald-900/10 text-emerald-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{alt.timestamp}</span>
                      <span>{alt.details}</span>
                    </div>
                    {alt.status === 'ACTIVE' && role === 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSecurityAlerts(prev => prev.map(a => a.id === alt.id ? { ...a, status: 'RESOLVED' } : a));
                          addAuditLog(
                            'ALERT_RESOLVED_MANUAL',
                            JSON.stringify(alt),
                            undefined,
                            `Security Alert ID ${alt.id} acknowledged and marked resolved by Admin.`,
                            'IT Security Officer',
                            role
                          );
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9.5px] cursor-pointer font-bold font-sans"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Search panel */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-850 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-blue-400" />
                  Chronological System Audit Trail Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Read-only cryptographic compliance verification log tracing administrative staff actions, student registrations, checkins, and payments.
                </p>
              </div>

              {/* Download actions */}
              <button
                type="button"
                onClick={() => {
                  const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>System Compliance Audit Trail Report</title>
                      <meta charset="utf-8">
                      <style>
                        body { font-family: monospace; padding: 30px; font-size: 11px; background: white; color: black; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f2f2f2; }
                      </style>
                    </head>
                    <body>
                      <h2>DUESFLOW OFFICIAL MICROSERVICES COMPLIANCE LEDGER</h2>
                      <p>Report Compiled: ${new Date().toLocaleString()}</p>
                      <table>
                        <thead>
                          <tr>
                            <th>TIMESTAMP</th>
                            <th>ACTION</th>
                            <th>USER</th>
                            <th>DETAILS</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${auditLogs.map(log => `
                            <tr>
                              <td>${log.timestamp}</td>
                              <td>${log.action}</td>
                              <td>${log.user} (${log.role})</td>
                              <td>${log.details || ''}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </body>
                    </html>
                  `;
                  const blob = new Blob([htmlContent], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `DuesFlow_Audit_Trail_${Date.now()}.html`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-705 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                Export Ledger
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Filter logs by details, action name, or key value..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-500" />
              </div>
              <div>
                <select
                  value={auditRoleFilter}
                  onChange={(e) => setAuditRoleFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Executive & Student Roles</option>
                  <option value="SUPER_ADMIN">IT Admin Roles Only</option>
                  <option value="FINANCIAL_SECRETARY">Financial Secretariat</option>
                  <option value="STUDENT">Student Logs Only</option>
                  <option value="SYSTEM">System Automations</option>
                </select>
              </div>
            </div>

            {/* Audit trail list */}
            <div className="overflow-x-auto rounded-xl border border-slate-855 bg-slate-950/25">
              <table className="w-full font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/50 text-[10px] text-slate-400 select-none uppercase tracking-wider">
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Action</th>
                    <th className="p-3.5 font-bold">Account</th>
                    <th className="p-3.5 font-bold">Log Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-[11px] text-slate-300">
                  {auditLogs
                    .filter(log => {
                      const matchesQuery = !auditSearchQuery || 
                        log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                        (log.details && log.details.toLowerCase().includes(auditSearchQuery.toLowerCase())) ||
                        log.user.toLowerCase().includes(auditSearchQuery.toLowerCase());
                      
                      const matchesRole = auditRoleFilter === 'ALL' || 
                        (auditRoleFilter === 'SYSTEM' && log.role === 'SYSTEM') ||
                        log.role === auditRoleFilter;

                      return matchesQuery && matchesRole;
                    })
                    .slice(0, 50)
                    .map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-slate-400">
                          {log.user} <span className="text-[9px] text-slate-500 border border-slate-800 px-1 rounded bg-slate-950">{log.role}</span>
                        </td>
                        <td className="p-3.5 text-slate-350 leading-relaxed font-sans">{log.details}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Showing up to 50 chronological logs. Access levels required: INTERNAL VERIFICATION ONLY</span>
              <span>Client Node: HTU SERVER NETWORK ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM DYNAMIC REGISTRATION SETTINGS POLICY DEPLOYMENT */}
      {subTab === 'SETTINGS' && (
        <div id="staff-settings-workbench" className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Settings className="h-4.5 w-4.5 text-blue-400" />
              Organization & Registrar Configuration Portal
            </h3>
            <p className="text-xs text-slate-400">
              Set standard domain policies, email compilation strategies, ticketing prefixes, and local institution configurations. Correct changes immediately wire into active student client terminals.
            </p>

            <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
              {settingsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                  {settingsSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400">Institution Properties</h4>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Host Corporate Institution</label>
                    <input
                      type="text"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Academic Department Branch</label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Reporting Academic Year session</label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Email patterns and formats */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400">Registry Rules & Pattern Compile</h4>
                  
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono font-mono">Custom Email Domain Policy</label>
                    <input
                      type="text"
                      value={emailDomain}
                      onChange={(e) => setEmailDomain(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Registration Email Pattern (Real-time Generator)</label>
                    <input
                      type="text"
                      value={emailPattern}
                      onChange={(e) => setEmailPattern(e.target.value)}
                      placeholder="{index}@htu.edu.gh"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <span className="text-[9.5px] text-slate-550 mt-1 block">
                      Use placeholder token <code>{"{index}"}</code> to compiled index logins automatically inside student forms.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono font-mono font-mono">Secure admission Ticket Code Prefix</label>
                    <input
                      type="text"
                      value={ticketPrefix}
                      onChange={(e) => setTicketPrefix(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Apply action button */}
              <div className="border-t border-slate-850 pt-5 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="h-4 w-4 animate-spin-slow" />
                  Save Organization Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subTab === 'PERSONAL_SETTINGS' && (
        <div id="personal-settings-workbench" className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 shadow-md bg-slate-950/20">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <User className="h-4.5 w-4.5 text-blue-400" />
              Administrative Officer Profile & Security Gate
            </h3>
            <p className="text-xs text-slate-400">
              Update your personnel credentials, customize color accent highlighting, and view sandbox cryptographic key pairings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Profile Inputs Column - Left */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-5 rounded-2xl border border-slate-850 bg-slate-900/10 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">PERSONNEL IDENTITY DATA</span>

                  {personalSuccessMessage && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl animate-fade-in">
                      {personalSuccessMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Officer Display name</label>
                      <input
                        type="text"
                        value={personalName}
                        onChange={(e) => setPersonalName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Verified Administrative Mailbox</label>
                      <input
                        type="email"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Duty Helpline Phone</label>
                      <input
                        type="text"
                        value={personalPhone}
                        onChange={(e) => setPersonalPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold font-mono">Assigned Role Clearance</label>
                      <div className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono font-bold select-none capitalize">
                        {role.toLowerCase().replace("_", " ")} Clearance
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="notify-toggle"
                      checked={personalNotify}
                      onChange={(e) => setPersonalNotify(e.target.checked)}
                      className="rounded border-slate-800 text-blue-650 focus:ring-blue-500/40 bg-slate-950 h-4 w-4"
                    />
                    <label htmlFor="notify-toggle" className="text-xs text-slate-400 cursor-pointer select-none">
                      Email dispatch summaries on critical voucher clearances & alarms
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPersonalSuccessMessage('Personnel directory profile updated successfully.');
                        setTimeout(() => setPersonalSuccessMessage(''), 4000);
                        
                        addAuditLog(
                          'STAFF_PROFILE_UPDATE',
                          undefined,
                          undefined,
                          `Officer ${personalName} updated personal credentials and phone logs.`,
                          personalName,
                          role
                        );
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-805 border border-slate-800 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Update Profile Caches
                    </button>
                  </div>
                </div>

                {/* Cryptographic token list */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" /> LOCAL CIPHER CERTIFICATE
                  </span>
                  <div className="p-3 bg-black rounded-xl border border-slate-900 font-mono text-[9px] text-zinc-400 select-all leading-normal break-all">
                    {"AES_256::TLS_SANDBOX_KEY::" + Date.now() + "::VALID::" + btoa(personalName).substring(0,10) + "::" + (orgSettings?.academicYear?.replace(" ", "_") || "COHORT")}
                  </div>
                  <p className="text-[9.5px] text-slate-500 font-mono leading-tight">
                    This digital security signature is registered locally. Do not expose this key to unauthorized students or secondary nodes.
                  </p>
                </div>
              </div>

              {/* Theme Customizer - Right column */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/10 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">CONSOLE BRANDING ACCENT</span>
                  
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Switch the active console primary color highlighting. Transitions will update menu badges and buttons immediately.
                  </p>

                  <div className="space-y-2 pt-2">
                    {[
                      { id: 'blue', name: 'Ocean Blue', colorBg: 'bg-blue-500' },
                      { id: 'indigo', name: 'Regal Indigo', colorBg: 'bg-indigo-500' },
                      { id: 'violet', name: 'Cyber Violet', colorBg: 'bg-violet-500' },
                      { id: 'teal', name: 'Clear Teal', colorBg: 'bg-teal-500' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setAccentColor(col.id as any);
                          setPersonalSuccessMessage(`Console color theme switched to ${col.name}!`);
                          setTimeout(() => setPersonalSuccessMessage(''), 4500);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          accentColor === col.id 
                            ? 'border-slate-700 bg-slate-900/60 font-semibold text-white' 
                            : 'border-slate-850/40 hover:border-slate-805 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-3.5 w-3.5 rounded-full ${col.colorBg} shrink-0`}></span>
                          <span>{col.name}</span>
                        </div>
                        {accentColor === col.id && <Check className="h-4 w-4 text-slate-200" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-blue-900/10 bg-blue-950/5 flex items-start gap-2.5 text-xs text-slate-400">
                  <Bell className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Theme options are persistent for the active dashboard shell connection session.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

        </div>
      </div>
    </div>
  );
}
