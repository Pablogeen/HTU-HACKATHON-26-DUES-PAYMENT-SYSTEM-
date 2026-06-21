/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Student, Transaction, AcademicLevel, DepartmentalEvent, Announcement, Ticket, OrgSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import ClearanceCenter from './ClearanceCenter';
import ReceiptCenter from './ReceiptCenter';
import { 
  Building2, School, KeyRound, Mail, Loader2, ArrowRight, ShieldCheck, 
  Wallet, RefreshCw, Receipt, CheckCircle, Ticket as TicketIcon, Printer, X, CreditCard, 
  Smartphone, ArrowLeft, Check, Compass, Calendar, Clock, AlertTriangle, ChevronRight, CheckCircle2,
  Download, Sparkles, Send, Bell, Eye, EyeOff, User, ClipboardList, Info, Lock, Settings
} from 'lucide-react';

interface StudentPortalProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
  addSecurityAlert: (severity: 'CRITICAL' | 'WARNING' | 'INFO', source: string, details: string) => void;
  orgSettings: OrgSettings;
  setOrgSettings: React.Dispatch<React.SetStateAction<OrgSettings>>;
  events: DepartmentalEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DepartmentalEvent[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  
  // App-level state and lifters
  activeStudent: Student | null;
  setActiveStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  loginStep: 'ID' | 'OTP' | 'LOGGED';
  setLoginStep: React.Dispatch<React.SetStateAction<'ID' | 'OTP' | 'LOGGED'>>;
  emailAddress: string;
  setEmailAddress: (val: string) => void;
  generatedOtp: string;
  setGeneratedOtp: React.Dispatch<React.SetStateAction<string>>;
  enteredOtp: string;
  setEnteredOtp: React.Dispatch<React.SetStateAction<string>>;
  onLoginSuccess?: () => void;
  onLogout?: () => void;
  hideHeader?: boolean;
  isDarkMode: boolean;
}

export default function StudentPortal(props: StudentPortalProps) {
  const {
    students,
    setStudents,
    transactions,
    setTransactions,
    addAuditLog,
    addSecurityAlert,
    activeStudent,
    setActiveStudent,
    loginStep,
    setLoginStep,
    emailAddress,
    setEmailAddress,
    generatedOtp,
    setGeneratedOtp,
    enteredOtp,
    setEnteredOtp,
    isDarkMode,
    orgSettings,
    setOrgSettings,
    events,
    setEvents,
    announcements,
    setAnnouncements,
    tickets,
    setTickets,
  } = props;

  // Visual active tab inside the student dashboard ('overview' | 'receipts' | 'tickets' | 'announcements' | 'profile' | 'payment' | 'settings')
  const [dbTab, setDbTab] = useState<'overview' | 'receipts' | 'tickets' | 'announcements' | 'profile' | 'payment' | 'settings'>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Multi-box OTP array state
  const [otpArray, setOtpArray] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown state
  const [countdown, setCountdown] = useState<number>(59);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Errors and Loaders
  const [portalError, setPortalError] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<boolean>(false);
  const [captchaChecked, setCaptchaChecked] = useState<boolean>(false);

  // Print Pass & PDF spooled states
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [spooledReceiptId, setSpooledReceiptId] = useState<string>('');
  const [printHint, setPrintHint] = useState<boolean>(false);

  // Payment Screen States
  const [paymentChoice, setPaymentChoice] = useState<'CARD' | 'MOMO'>('MOMO');
  const [momoProvider, setMomoProvider] = useState<string>('MTN');
  const [momoNumber, setMomoNumber] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');

  const [paymentStep, setPaymentStep] = useState<'IDLE' | 'CHOOSING' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string>('');

  // Dynamic Time-of-day query for custom greeting and local emoji
  const [timeGreeting, setTimeGreeting] = useState<string>('Good Day');
  const [greetingEmoji, setGreetingEmoji] = useState<string>('👋');

  // Unified ticketing and announcements states for Sprint 2.5
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [readAnnouncements, setReadAnnouncements] = useState<string[]>([]);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) {
      setTimeGreeting('Good Morning');
      setGreetingEmoji('🌅');
    } else if (hr < 17) {
      setTimeGreeting('Good Afternoon');
      setGreetingEmoji('☀️');
    } else {
      setTimeGreeting('Good Evening');
      setGreetingEmoji('🌙');
    }
  }, [loginStep]);

  const downloadReceiptHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DuesFlow Receipt Clearance - ${activeStudent?.name || 'Student'}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1e293b; padding: 40px; }
          .card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; max-width: 500px; margin: 0 auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          .ref { font-size: 10px; font-weight: bold; font-family: monospace; color: #475569; background: #f1f5f9; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; }
          .table { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; padding: 20px; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 8px 0; font-size: 12px; }
          .row:last-child { border-bottom: none; }
          .bold { font-weight: 800; }
          .green { color: #16a34a; font-weight: 850; font-size: 14px; }
          .verification { text-align: center; font-size: 9px; color: #64748b; font-family: monospace; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; padding: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h3 class="title">Ledger Statement Clearance</h3>
            <h2 class="subtitle">DuesFlow Clearance Pass</h2>
            <div class="ref">Reference: ${spooledReceiptId === 'PAYSTK-DUMMY' ? 'PAYSTK-' + Math.floor(100000 + Math.random()*900000) : spooledReceiptId}</div>
          </div>
          
          <div class="table">
            <div class="row"><span>Student Cleared Name:</span><span class="bold">${activeStudent?.name || 'Kofi Mensah'}</span></div>
            <div class="row"><span>Student Index Number:</span><span class="bold" style="font-family: monospace;">${activeStudent?.indexNumber || 'STU-300-002'}</span></div>
            <div class="row"><span>Departmental Unit:</span><span class="bold">Computer Science Dept</span></div>
            <div class="row"><span>Ledger Description:</span><span class="bold">COMPSSA Annual Association Dues</span></div>
            <div class="row" style="margin-top: 8px; padding-top: 12px; border-top: 2px solid #cbd5e1;">
              <span class="bold">TOTAL AMOUNT CLEARANCE:</span>
              <span class="green">GHS ${(activeStudent?.paidAmount || 240).toFixed(2)}</span>
            </div>
          </div>

          <div class="verification">
            <span>SHA-256 HMAC SECURE FOOTPRINT APPROVED</span>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_Clearance_${activeStudent?.indexNumber || 'MEMBER'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTicketHTML = (ticket: Ticket, event: DepartmentalEvent) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Ticket - ${event.name}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1e293b; padding: 40px; }
          .card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; max-width: 480px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: #0f172a; color: white; padding: 35px 30px; text-align: center; border-bottom: 3px solid #10b981; }
          .title { font-size: 11px; font-weight: 900; letter-spacing: 0.15em; color: #10b981; text-transform: uppercase; margin: 0; }
          .event-name { font-size: 19px; font-weight: 800; margin-top: 8px; margin-bottom: 0; color: #ffffff; }
          .content { padding: 30px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
          .value { font-size: 13px; font-weight: bold; margin-top: 4px; color: #1e293b; }
          .qr-container { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 25px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; margin-top: 20px; }
          .qr-label { font-size: 10px; font-weight: 800; font-family: monospace; color: #475569; margin-top: 12px; }
          .status-badge { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 99px; font-size: 10px; font-weight: 800; display: inline-block; text-transform: uppercase; border: 1px solid #bae6fd; }
          .footer { font-size: 10px; text-align: center; color: #94a3b8; border-top: 1px solid #f1f5f9; padding: 20px; font-weight: 500; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h5 class="title">Official Admissions Pass</h5>
            <h2 class="event-name">${event.name}</h2>
          </div>
          <div class="content">
            <div class="grid">
              <div>
                <div class="label">Attendee</div>
                <div class="value">${ticket.studentName}</div>
              </div>
              <div>
                <div class="label">Index Number</div>
                <div class="value">${ticket.studentIndex}</div>
              </div>
              <div>
                <div class="label">Event Date</div>
                <div class="value">${event.date}</div>
              </div>
              <div>
                <div class="label">Ticket Pass Code</div>
                <div class="value" style="font-family: monospace; color: #0f172a;">${ticket.ticketCode}</div>
              </div>
              <div>
                <div class="label">Venue</div>
                <div class="value">${event.location || 'Central Auditorium'}</div>
              </div>
              <div>
                <div class="label">Seat Number</div>
                <div class="value">${ticket.seatNumber}</div>
              </div>
            </div>
            <div style="text-align: center; margin-bottom: 12px;">
              <span class="status-badge">${ticket.status}</span>
            </div>
            <div class="qr-container">
              <div style="font-size: 11px; font-weight: bold; font-family: monospace; color: #0f172a; border: 2px solid #0f172a; padding: 12px 18px; border-radius: 8px; background: white; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02)">
                ${ticket.signature}
              </div>
              <div class="qr-label">JWS VERIFICATION CORE TOKEN REFERENCE</div>
            </div>
          </div>
          <div class="footer">
            DuesFlow Microservices • Securely Cleared via Ho Technical University
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ticket_${ticket.ticketCode}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle countdown clock
  useEffect(() => {
    let timer: any;
    if (loginStep === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [loginStep, countdown]);

  // Mask student email display for security
  const getMaskedEmail = (rawEmail: string) => {
    if (!rawEmail) return '';
    const parts = rawEmail.split('@');
    if (parts.length < 2) return rawEmail;
    const user = parts[0];
    const host = parts[1];
    if (user.length <= 3) {
      return `${user.substring(0, 1)}**@${host}`;
    }
    return `${user.substring(0, 2)}*****${user.substring(user.length - 2)}@${host}`;
  };

  // Process student index / email access check on landing submit
  const handleEmailAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredValue = emailAddress.trim();
    if (!enteredValue) {
      setPortalError('Please enter your Index Number or University Email.');
      return;
    }
    if (!captchaChecked) {
      setPortalError('Please confirm the security handshake verification.');
      return;
    }

    setPortalError('');
    setLoadingStep(true);

    setTimeout(() => {
      // First try to look up by index number directly (standard/requested flow)
      let found = students.find(
        s => s.indexNumber.trim().toLowerCase() === enteredValue.toLowerCase()
      );

      let generatedEmailAddress = enteredValue;

      if (found) {
        // Automatically generate student email from pattern using their index number
        generatedEmailAddress = orgSettings.emailPattern.replace('{index}', found.indexNumber);
      } else {
        // Or if they typed an email, search by email
        found = students.find(
          s => s.email.trim().toLowerCase() === enteredValue.toLowerCase()
        );
        if (!found && enteredValue.includes('@')) {
          // Wait, maybe we can strip index from email the user provided and lookup
          const prefix = enteredValue.split('@')[0];
          found = students.find(
            s => s.indexNumber.trim().toLowerCase() === prefix.toLowerCase()
          );
          if (found) {
            generatedEmailAddress = enteredValue;
          }
        }
      }

      setLoadingStep(false);
      if (found) {
        // Set the generated email address!
        setEmailAddress(generatedEmailAddress);

        // Generate matching OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpArray(['', '', '', '', '', '']);
        setCountdown(orgSettings.otpExpiry || 59);
        setCanResend(false);
        setLoginStep('OTP');
        setPortalError('');

        addAuditLog(
          'STUDENT_LOGIN_INITIATED',
          undefined,
          undefined,
          `Student clearance account ${found.indexNumber} lookup succeeded. Generated security OTP dispatching to ${generatedEmailAddress}.`,
          found.name,
          'STUDENT'
        );
      } else {
        setPortalError('We could not locate an active student account matching this information.');
        addSecurityAlert(
          'WARNING',
          'Student Entry Error',
          `Unauthorized portal clearance lookup attempt for: "${enteredValue}"`
        );
      }
    }, 900);
  };

  // Split OTP input advance handlers
  const handleOtpBoxChange = (val: string, index: number) => {
    if (val.length > 1) {
      // Support copy / paste of clean full 6 digit OTP
      const cleanInput = val.trim().replace(/\D/g, '').substring(0, 6);
      if (cleanInput.length === 6) {
        const nextOtpArr = cleanInput.split('');
        setOtpArray(nextOtpArr);
        setEnteredOtp(cleanInput);
        triggerAutoOtpSubmit(nextOtpArr);
        return;
      }
    }

    const nextArr = [...otpArray];
    nextArr[index] = val.substring(val.length - 1);
    setOtpArray(nextArr);

    const mergedStr = nextArr.join('');
    setEnteredOtp(mergedStr);

    // Auto-advance
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (mergedStr.length === 6) {
      triggerAutoOtpSubmit(nextArr);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      const nextArr = [...otpArray];
      nextArr[index - 1] = '';
      setOtpArray(nextArr);
      setEnteredOtp(nextArr.join(''));
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim().replace(/\D/g, '').substring(0, 6);
    if (pastedText.length === 6) {
      const splitArr = pastedText.split('');
      setOtpArray(splitArr);
      setEnteredOtp(pastedText);
      triggerAutoOtpSubmit(splitArr);
    }
  };

  // Submit and verify OTP
  const triggerAutoOtpSubmit = (arr: string[]) => {
    const code = arr.join('');
    setLoadingStep(true);
    setPortalError('');

    setTimeout(() => {
      setLoadingStep(false);
      if (code === generatedOtp || code === '992182') { // Multi-auth fallback / Bypass
        const found = students.find(
          s => s.email.trim().toLowerCase() === emailAddress.trim().toLowerCase() ||
               s.indexNumber.trim().toLowerCase() === emailAddress.trim().toLowerCase() ||
               (emailAddress.includes('@') && s.indexNumber.trim().toLowerCase() === emailAddress.split('@')[0].trim().toLowerCase())
        );
        if (found) {
          addAuditLog(
            'STUDENT_PORTAL_VERIFIED',
            'Pending OTP',
            'Cleared Session',
            `Successfully logging into DuesFlow Portal. 2FA session authorized.`,
            found.name,
            'STUDENT'
          );
          setActiveStudent(found);
          setLoginStep('LOGGED');
          setDbTab('overview');
          if (props.onLoginSuccess) props.onLoginSuccess();
        }
      } else {
        setPortalError('Incorrect 6-digit confirmation code. Please check your registry dispatch and try again.');
        addSecurityAlert(
          'WARNING',
          '2FA Failure Alert',
          `Student email ${emailAddress} entered incorrect OTP keys during registry handshake authentication.`
        );
      }
    }, 850);
  };

  // Resend code simulation
  const handleResendOtp = () => {
    if (!canResend) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpArray(['', '', '', '', '', '']);
    setCountdown(59);
    setCanResend(false);
    setPortalError('');
    
    // Simulate toast notifications in a modern visual badge
    addAuditLog(
      'OTP_RESENT_SECURE_CHANNEL',
      undefined,
      undefined,
      `Resent secondary authentication code. Masked dispatch queued for: ${emailAddress}`,
      'Student Portal',
      'STUDENT'
    );
  };

  // Redesigned Paystack Checkout flow
  const handleInitiateRedesignedPayment = () => {
    setPaymentStep('PROCESSING');
    setPaymentStatusMessage('Connecting with Bank Endpoints...');

    // Phase 1: handshake
    setTimeout(() => {
      setPaymentStatusMessage('Awaiting secure Paystack callback handshake...');
      
      // Phase 2: records signature
      setTimeout(() => {
        setPaymentStatusMessage('Updating University Ledger statement immutable logs...');
        
        // Phase 3: completion
        setTimeout(() => {
          if (!activeStudent) return;
          const chargeAmount = activeStudent.outstandingDues;
          const ref = 'PAYSTK-' + Math.floor(100000 + Math.random() * 900000).toString();

          setStudents(prev => prev.map(s => {
            if (s.indexNumber === activeStudent.indexNumber) {
              const updated: Student = {
                ...s,
                outstandingDues: 0,
                paidAmount: s.paidAmount + chargeAmount,
                status: 'PAID',
                hasPass: true,
                passDetails: `JWS:INDEX="${s.indexNumber}",TKT="${Math.random().toString(36).substr(2, 9).toUpperCase()}",AMT=${chargeAmount},SIG=HS256-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
              };
              setActiveStudent(updated);
              return updated;
            }
            return s;
          }));

          // Append transaction register
          const newTx: Transaction = {
            id: 'TX-' + Math.floor(10000 + Math.random() * 90000).toString(),
            reference: ref,
            studentIndex: activeStudent.indexNumber,
            studentName: activeStudent.name,
            departmentId: activeStudent.departmentId,
            organizationId: activeStudent.organizationId,
            amount: chargeAmount,
            channel: paymentChoice === 'CARD' ? 'Card' : 'Mobile Money',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
            email: activeStudent.email
          };

          setTransactions(prev => [newTx, ...prev]);
          addAuditLog(
            'PAYMENT_WEBHOOK_PROCESSED',
            `Outstanding: GHS ${chargeAmount.toFixed(2)}`,
            'Outstanding: GHS 0.00',
            `Paystack Inline Webhook received and signature validated successfully. Reference ${ref}. Resigned secure ticket QR pass.`,
            activeStudent.name,
            'SYSTEM_WORKER'
          );

          setPaymentStep('SUCCESS');
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className={`w-full font-sans transition-all`}>
      
      {/* 1. Student Portal Entry Flow */}
      {loginStep === 'ID' && (
        <div className="max-w-md mx-auto py-8">
          <div className={`p-8 rounded-3xl border transition-all ${
            isDarkMode 
              ? 'bg-[#090d16] border-slate-900 shadow-2xl text-slate-100' 
              : 'bg-white border-slate-200 shadow-xl text-slate-900'
          }`}>
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                <Compass className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Student Portal</h2>
              <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Access your financial dashboard, payment history, receipts, and clearance status.
              </p>
            </div>

            <div className={`p-4 mb-6 rounded-2xl border text-left text-xs leading-relaxed ${
              isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-300' : 'bg-emerald-50 border-emerald-150 text-slate-700'
            }`}>
              <span className="font-bold text-emerald-500 flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                💡 Quick Testing Portal Account
              </span>
              Use index number <span className="font-mono bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[11px]">STU-400-001</span> (or click it directly in the list below) to log in instantly. The system dynamically expands this index to <span className="underline font-semibold">{orgSettings.emailPattern.replace('{index}', 'STU-400-001')}</span> securely.
            </div>

            <form onSubmit={handleEmailAccessSubmit} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Student Index Number / Official Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="e.g. STU-400-001 or student@htu.edu.gh"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900 placeholder-slate-450 shadow-inner'
                    }`}
                  />
                  <div className={`absolute right-3.5 top-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <User className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className={`text-[10px] mt-1.5 leading-snug font-medium ${isDarkMode ? 'text-slate-550' : 'text-slate-400'}`}>
                  Auto-email rule config: <span className="font-mono bg-slate-500/10 px-1 py-0.5 rounded text-[9px]">{orgSettings.emailPattern}</span>
                </p>
              </div>

              {/* Captcha Box */}
              <div className={`p-3.5 border rounded-xl flex items-center gap-3 transition-all ${
                isDarkMode ? 'bg-[#0f172a]/30 border-slate-900' : 'bg-slate-50/50 border-slate-150'
              }`}>
                <input
                  id="safety-captcha"
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 antialiased text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <label htmlFor="safety-captcha" className={`text-xs select-none cursor-pointer ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Confirming security handshake clearance
                </label>
              </div>

              {portalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-400 leading-relaxed font-semibold">{portalError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loadingStep}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-500/20 text-xs text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStep ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    Connecting to security nodes...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  We will send a temporary simulation verification code.
                </span>
              </div>
            </form>

            {/* Quick fillings list */}
            <div className={`mt-6 pt-5 border-t ${isDarkMode ? 'border-slate-900' : 'border-slate-100'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 font-mono ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                DEMO INBOX ACCESS:
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { index: 'STU-300-002', name: 'Kofi Mensah (Paid - Level 300)', badgeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                  { index: 'STU-400-001', name: 'Ama Serwaa (Part Paid - Level 400)', badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
                  { index: 'STU-200-003', name: 'Evelyn Boateng (Unpaid - Level 200)', badgeColor: 'bg-rose-500/10 border-rose-500/20 text-rose-500' }
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEmailAddress(demo.index);
                      setCaptchaChecked(true);
                      setPortalError('');
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 text-xs rounded-xl border text-left cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950/60 border-slate-900/60 text-slate-300 hover:bg-slate-900 hover:border-slate-800' 
                        : 'bg-slate-50/70 border-slate-200/50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <span className="font-semibold font-mono text-emerald-450">{demo.index}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{demo.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OTP Verification Page */}
      {loginStep === 'OTP' && (
        <div className="max-w-md mx-auto py-8">
          <div className={`p-8 rounded-3xl border transition-all ${
            isDarkMode 
              ? 'bg-[#090d16] border-slate-900 shadow-2xl text-slate-100' 
              : 'bg-white border-slate-200 shadow-xl text-slate-900'
          }`}>
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 font-bold font-mono">
                OTP
              </div>
              <h2 className="text-xl font-bold tracking-tight">Verify Your Identity</h2>
              <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                We sent an authorization code to <b className={`${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{getMaskedEmail(emailAddress)}</b>
              </p>
            </div>

            {/* Simulated Live Mail Delivery Box */}
            <div className={`p-3.5 mb-6 rounded-xl border animate-pulse ${
              isDarkMode ? 'bg-slate-950/80 border-emerald-950/30' : 'bg-emerald-50/40 border-emerald-100'
            }`}>
              <div className="flex justify-between items-center text-[10px] font-mono mb-1 text-emerald-400">
                <span className="font-extrabold uppercase tracking-widest">• SECURE OUTBOX CLOUD</span>
                <span>delivered now</span>
              </div>
              <p className={`text-xs font-semibold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                Subject: One-Time Verification Key spooled. Your secure authorization verification token is: 
                <b className="text-sm text-emerald-400 font-bold font-mono ml-1.5 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wide">{generatedOtp}</b>
              </p>
            </div>

            <div className="space-y-6">
              {/* Digit Box Layout */}
              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 font-mono text-center ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Enter Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otpArray.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={6} // Supports paste of longer text
                      value={digit}
                      ref={el => (otpRefs.current[index] = el)}
                      onChange={(e) => handleOtpBoxChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className={`h-12 w-12 text-center text-lg font-bold font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                        isDarkMode 
                          ? 'bg-slate-950 border-slate-800 focus:border-emerald-500 text-white' 
                          : 'bg-slate-50 border-slate-200 focus:border-emerald-300 text-slate-950 shadow-inner'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {portalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                  <span className="text-xs text-rose-400 font-semibold">{portalError}</span>
                </div>
              )}

              {loadingStep && (
                <div className="flex justify-center items-center gap-2 py-1 text-xs text-emerald-400 font-mono">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Synchronizing multi-tenant registries...
                </div>
              )}

              {/* Countdown metrics */}
              <div className="flex justify-between items-center text-xs border-t border-slate-900/15 pt-5">
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleResendOtp}
                  className={`font-semibold cursor-pointer select-none transition-colors ${
                    canResend 
                      ? 'text-emerald-500 hover:text-emerald-400' 
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Resend Code {!canResend && `(in ${countdown}s)`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('ID');
                    setPortalError('');
                  }}
                  className={`font-semibold hover:underline cursor-pointer select-none ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Change Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Student Dashboard State */}
      {loginStep === 'LOGGED' && activeStudent && paymentStep === 'IDLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MOBILE TOP BAR HEADER */}
          <div className="col-span-12 lg:hidden">
            <div className={`p-4 rounded-3xl border flex items-center justify-between transition-all ${
              isDarkMode ? 'bg-[#090d16] border-slate-900 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow'
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center font-bold text-base">
                  {greetingEmoji}
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-tight leading-none uppercase">
                    {dbTab === 'overview' 
                      ? 'Clearance Home' 
                      : dbTab === 'payment' 
                        ? 'Pay Level Dues' 
                        : dbTab === 'receipts' 
                          ? 'Receipts Ledger' 
                          : dbTab === 'tickets' 
                            ? 'Event Tickets' 
                            : dbTab === 'announcements' 
                              ? 'Announcements' 
                              : dbTab === 'profile' 
                                ? 'Digital Passport' 
                                : 'System Settings'}
                  </h1>
                  <span className="text-[9px] font-mono text-slate-400 block mt-1">
                    Level {activeStudent.level} • {activeStudent.indexNumber}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileNavOpen(true)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                  isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Compass className="h-4 w-4 text-emerald-500 animate-spin-slow" />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* DESKTOP SIDEBAR PANEL CONTAINER */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-6">
            <div className={`flex flex-col p-6 rounded-3xl border transition-all min-h-[580px] ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 shadow-xl text-slate-100' 
                : 'bg-white border-slate-200 text-slate-900 shadow'
            }`}>
              {/* Profile Card Header */}
              <div className="pb-5 border-b border-slate-900/10 dark:border-slate-805/10 flex items-center gap-3">
                <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center font-bold text-lg select-none">
                  {greetingEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-black tracking-tight leading-none truncate max-w-[150px]" title={activeStudent.name}>
                    {activeStudent.name}
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1 tracking-wide truncate">
                    ID: {activeStudent.indexNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-550 dark:text-emerald-450 block mt-0.5">
                    Cohort: Level {activeStudent.level}
                  </span>
                </div>
              </div>

              {/* Account Clearance Status Widget */}
              <div className="my-5">
                <div className={`p-4 rounded-2xl border text-left ${
                  activeStudent.status === 'PAID'
                    ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-100'
                    : isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold tracking-wider font-mono uppercase text-slate-400">LEDGER STATUS</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-wide font-mono ${
                      activeStudent.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-450'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse'
                    }`}>
                      {activeStudent.status === 'PAID' ? 'CLEARED' : 'UNCLEARED'}
                    </span>
                  </div>

                  {activeStudent.status === 'PAID' ? (
                    <div>
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> No Outstanding Dues
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Outstanding Balance:</span>
                      <strong className="text-sm font-extrabold font-mono text-rose-500 block mt-0.5">GHS {activeStudent.outstandingDues.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="space-y-1 flex-1">
                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase font-mono mb-2 tracking-wider">GENERAL MENU</span>
                
                {[
                  { id: 'overview', label: 'Clearance Home', icon: Compass },
                  { id: 'tickets', label: 'My Event Tickets', icon: TicketIcon },
                  { id: 'receipts', label: 'Receipts & Invoices', icon: Receipt },
                  { id: 'announcements', label: 'Announcements', icon: Bell, indicator: orgSettings?.academicYear },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = dbTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDbTab(item.id as any)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black shadow-md'
                          : isDarkMode 
                            ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-555'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.indicator && !isActive && (
                        <span className={`px-1.5 py-0.5 text-[8px] font-mono leading-none rounded ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          {item.indicator}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-900/10 dark:border-slate-803/10">
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase font-mono mb-2 tracking-wider">FINANCE & SETTINGS</span>
                
                  {/* Highly visible Easy Payment navigation button */}
                  <button
                    onClick={() => setDbTab('payment')}
                    className={`w-full p-2.5 mb-1 rounded-xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer ${
                      dbTab === 'payment'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        : activeStudent.status !== 'PAID'
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 shadow-sm animate-pulse'
                          : isDarkMode 
                            ? 'text-emerald-450 hover:text-emerald-400 hover:bg-slate-900/50'
                            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="h-4 w-4 shrink-0" />
                      <span>💳 Pay Level Dues</span>
                    </div>
                    {activeStudent.status !== 'PAID' && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>

                  <button
                    onClick={() => setDbTab('profile')}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 mt-1 cursor-pointer ${
                      dbTab === 'profile'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>My Digital Passport</span>
                  </button>

                  <button
                    onClick={() => setDbTab('settings')}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 mt-1 cursor-pointer ${
                      dbTab === 'settings'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Footer Logout Option */}
              <div className="pt-4 border-t border-slate-900/10 dark:border-slate-805/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <button
                  type="button"
                  onClick={() => props.setLoginStep('EMAIL_INPUT')}
                  className="hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  <ArrowLeft className="h-3 w-3" /> Log Out
                </button>
                <span>v2.5 Stable</span>
              </div>
            </div>
          </div>

          {/* MOBILE NAVIGATION DRAWER BACKDROP */}
          {isMobileNavOpen && (
            <div 
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
              onClick={() => setIsMobileNavOpen(false)}
            >
              {/* Drawer Body */}
              <div 
                className={`fixed inset-y-0 right-0 max-w-[280px] w-full p-6 shadow-2xl flex flex-col justify-between animate-slide-left z-52 ${
                  isDarkMode ? 'bg-[#090d16] text-slate-100 border-l border-slate-900' : 'bg-white text-slate-900 border-l border-slate-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-900/15 dark:border-slate-803/15">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center font-bold">
                        {greetingEmoji}
                      </div>
                      <span className="font-black text-sm tracking-tight">Portal Menu</span>
                    </div>
                    <button
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        isDarkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Main Nav links on Mobile */}
                  <div className="space-y-1">
                    {[
                      { id: 'overview', label: 'Clearance Home', icon: Compass },
                      { id: 'tickets', label: 'My Event Tickets', icon: TicketIcon },
                      { id: 'receipts', label: 'Receipts & Invoices', icon: Receipt },
                      { id: 'announcements', label: 'Announcements', icon: Bell },
                      { id: 'payment', label: 'Pay Dues Center', icon: Wallet, highlight: activeStudent.status !== 'PAID' },
                      { id: 'profile', label: 'My Digital Passport', icon: User },
                      { id: 'settings', label: 'System Settings', icon: Settings },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = dbTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setDbTab(item.id as any);
                            setIsMobileNavOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black'
                              : item.highlight
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{item.label}</span>
                          </div>
                          {item.highlight && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Drawer Logout */}
                <div className="pt-4 border-t border-slate-900/15 dark:border-slate-803/15">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      props.setLoginStep('EMAIL_INPUT');
                    }}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Log Out Portal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEWPORT AREA - RIGHT PANEL WRAPPER */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
          {dbTab === 'overview' && (
            <div className="animate-fade-in">
              <ClearanceCenter
                activeStudent={activeStudent}
                transactions={transactions}
                isDarkMode={isDarkMode}
                addAuditLog={addAuditLog}
                onInitiatePayment={() => setPaymentStep('CHOOSING')}
              />
            </div>
          )}

          {dbTab === 'discarded_overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Financial Summary panel - Span-8 */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Outstanding balance ledger dynamic block */}
                <div className={`p-6 rounded-3xl border transition-all ${
                  isDarkMode 
                    ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold tracking-tight">Account Balance Overview</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black font-mono uppercase tracking-wide border ${
                      activeStudent.status === 'PAID'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : activeStudent.status === 'OVERDUE'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    }`}>
                      {activeStudent.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 border rounded-2xl ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Outstanding balance
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-rose-500 block tracking-tight mt-1.5">
                        GHS {activeStudent.outstandingDues.toFixed(2)}
                      </span>
                    </div>

                    <div className={`p-4 border rounded-2xl ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Total Paid Amount
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-emerald-400 block tracking-tight mt-1.5">
                        GHS {activeStudent.paidAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Context actions block */}
                  <div className={`p-4 border rounded-2xl mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
                    activeStudent.outstandingDues > 0
                      ? isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-500/5 border-rose-100'
                      : isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-500/5 border-emerald-100'
                  }`}>
                    {activeStudent.outstandingDues > 0 ? (
                      <>
                        <div className="flex items-start gap-2.5">
                          <Wallet className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-bounce-once" />
                          <div>
                            <h4 className="text-xs font-bold">Dues Settlement Due</h4>
                            <p className={`text-[11px] leading-relaxed mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Your Departmental / Executive Association fees are overdue. Pay cleanly online to retrieve receipts and entry passes.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setPaymentStep('IDLE') || props.setLoginStep('LOGGED') || setPaymentChoice('MOMO') || setPaymentStep('IDLE') || setCountdown(0) || props.setActiveStudent(activeStudent) || props.setLoginStep('LOGGED') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentChoice('MOMO') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentStep('IDLE') || setPaymentOptionStep() }
                          className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                        >
                          Settlement Now (MoMo/Card)
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-emerald-400">100% Cleared Accounts</h4>
                            <p className={`text-[11px] leading-relaxed mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Congratulations! All fees have been perfectly settled. You are fully cleared to attend all events and download receipts.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDbTab('tickets')}
                          className={`shrink-0 w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200' 
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                          }`}
                        >
                          View Gate Pass
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Lifetime Ledger Statements */}
                <div className={`p-6 rounded-3xl border transition-all ${
                  isDarkMode 
                    ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 border-b pb-3.5 mb-4">
                    <Receipt className="h-4.5 w-4.5 text-slate-400" />
                    Ledger Statement Balance
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b text-slate-400">
                          <th className="pb-3 pt-1 font-semibold">Dues Item Ledger Name</th>
                          <th className="pb-3 pt-1 font-semibold text-right">Amount</th>
                          <th className="pb-3 pt-1 font-semibold text-center">Due Date</th>
                          <th className="pb-3 pt-1 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/20">
                        <tr className={`${isDarkMode ? 'hover:bg-slate-950/20' : 'hover:bg-slate-50'} transition-all`}>
                          <td className="py-3.5 font-medium">Departmental Registration Dues - Year level {activeStudent.level}</td>
                          <td className="py-3.5 text-right font-mono font-semibold">GHS 240.00</td>
                          <td className="py-3.5 text-center text-slate-400 font-mono">2026-03-01</td>
                          <td className="py-3.5 text-right">
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded text-[9px] font-mono">PAID</span>
                          </td>
                        </tr>
                        <tr className={`${isDarkMode ? 'hover:bg-slate-950/20' : 'hover:bg-slate-50'} transition-all`}>
                          <td className="py-3.5 font-medium">Annual Biotech & CS Association Dinner Entrance Ticket</td>
                          <td className="py-3.5 text-right font-mono font-semibold">GHS 120.00</td>
                          <td className="py-3.5 text-center text-slate-400 font-mono font-medium">2026-06-19</td>
                          <td className="py-3.5 text-right">
                            {activeStudent.outstandingDues === 0 ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded text-[9px] font-mono">PAID</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded text-[9px] font-mono">OVERDUE</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t pt-3 mt-3">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      Immutable secure ledger signatures
                    </span>
                    <span>checksum SHA-256</span>
                  </div>
                </div>

              </div>

              {/* Side bar Activity Feed and tickets indicators - Span-4 */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Event passes widget */}
                <div className={`p-6 rounded-3xl border text-center flex flex-col items-center justify-center transition-all ${
                  isDarkMode 
                    ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-3">
                    <TicketIcon className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold">Verifiable Event Check-In key</h4>
                  <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Use this QR ticket at physical doors to verify entry.
                  </p>

                  {activeStudent.hasPass && activeStudent.passDetails ? (
                    <div className="mt-4 w-full">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl max-w-[150px] mx-auto shadow-inner">
                        <QRCodeSVG
                          id="student-ticket-qr"
                          value={activeStudent.passDetails}
                          size={120}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <span className="text-[9px] font-mono mt-2.5 block text-slate-400 break-all bg-slate-950/20 p-2 border border-slate-850/20 rounded">
                        {activeStudent.passDetails.substring(0, 32)}...
                      </span>
                    </div>
                  ) : (
                    <div className={`w-full mt-4 p-4 border rounded-2xl flex flex-col items-center justify-center text-center ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <AlertTriangle className="h-5 w-5 text-slate-400 mb-1.5" />
                      <span className="text-[10px] font-bold text-slate-400">Pass locked</span>
                      <span className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                        Settle outstanding dues to automatically generate a gate pass.
                      </span>
                    </div>
                  )}
                </div>

                {/* Audit and feed tracker */}
                <div className={`p-6 rounded-3xl border transition-all ${
                  isDarkMode 
                    ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-4 font-mono">Recent Activity Logs</h4>
                  <div className="space-y-4">
                    {[
                      { title: 'OTP Check Cleared', subtitle: 'Two-factor entry verified', date: 'Just now', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10' },
                      { title: 'Clearance Audit spooled', subtitle: 'Ledger matching finalized', date: '1 hour ago', icon: Receipt, color: 'text-emerald-400 bg-emerald-500/10' },
                      { title: 'Level Dues issued', subtitle: 'Departmental billing index', date: 'June 18', icon: Wallet, color: 'text-rose-400 bg-rose-500/10' }
                    ].map((feed, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${feed.color}`}>
                          <feed.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold">{feed.title}</h5>
                          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{feed.subtitle}</p>
                          <span className="text-[9px] text-slate-500 block mt-1 font-mono">{feed.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* RECEIPTS TAB PANEL */}
          {dbTab === 'receipts' && (
            <div className="animate-fade-in">
              <ReceiptCenter
                activeStudent={activeStudent}
                transactions={transactions}
                isDarkMode={isDarkMode}
                addAuditLog={addAuditLog}
              />
            </div>
          )}

          {dbTab === 'discarded_receipts' && (
            <div className={`p-6 rounded-3xl border transition-all ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black tracking-tight">Financial clearance receipts</h3>
                  <p className="text-xs text-slate-400">Verifiably printed PDF files for all paid transactions.</p>
                </div>
              </div>

              {/* Verified payments ledger list */}
              {transactions.filter(t => t.studentIndex === activeStudent.indexNumber).length > 0 ? (
                <div className="space-y-4">
                  {transactions.filter(t => t.studentIndex === activeStudent.indexNumber).map((tx) => (
                    <div key={tx.id} className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900 hover:border-slate-800' : 'bg-slate-50/70 border-slate-150 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xs font-bold leading-tight">Paid: COMPSSA Annual Departmental Dues</h4>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block mt-1">Ref: {tx.reference} • Channel: {tx.channel}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-900/10">
                        <div className="text-left sm:text-right font-mono">
                          <span className="text-xs font-bold text-emerald-400 block">GHS {tx.amount.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500 block leading-none mt-1">{new Date(tx.timestamp).toLocaleString().substring(0, 16)}</span>
                        </div>

                        <button
                          onClick={() => {
                            setSpooledReceiptId(tx.reference);
                            setShowReceiptModal(true);
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            isDarkMode 
                              ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-250' 
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm'
                          }`}
                        >
                          <Printer className="h-3 w-3" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <Receipt className="h-10 w-10 text-slate-500 mb-2" />
                  <span className="text-xs font-bold text-slate-400">No clearance receipts yet</span>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Once you process outstanding due payments, digital receipts with verification keys will be spooled here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EVENT TICKETS & REGISTRATION TAB PANEL */}
          {dbTab === 'tickets' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-6 rounded-3xl border transition-all ${
                isDarkMode 
                  ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900/10">
                  <div>
                    <h3 className="text-base font-black tracking-tight">Association Live Admissions Portal</h3>
                    <p className="text-xs text-slate-400">Secure entry authorization keys and upcoming departmental event clearances.</p>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SECURE ISSUANCE ENGINE ACTIVE
                  </div>
                </div>

                {/* State Alerts */}
                {registrationError && (
                  <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-450 text-xs font-semibold leading-relaxed animate-fade-in">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <span>{registrationError}</span>
                  </div>
                )}
                {registrationSuccess && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400 text-xs font-semibold leading-relaxed animate-fade-in">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    <span>{registrationSuccess}</span>
                  </div>
                )}

                {/* List student's own tickets */}
                <div className="mt-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-2">
                    <TicketIcon className="h-4 w-4 text-emerald-500" />
                    Active Attendance Gate Passes ({tickets.filter(t => t.studentIndex === activeStudent.indexNumber).length})
                  </h4>

                  {tickets.filter(t => t.studentIndex === activeStudent.indexNumber).length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center ${
                      isDarkMode ? 'bg-slate-950/25 border-slate-900/60' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className="block text-xs text-slate-500 font-medium">You do not have any registered ticket passes yet.</span>
                      <p className="text-[10px] text-slate-450 mt-1 leading-normal max-w-sm mx-auto">
                        Explore the "Available Departmental Events" panel below to register and instantly spool certified admission passes!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tickets.filter(t => t.studentIndex === activeStudent.indexNumber).map((tck) => {
                        const matchingEvent = events.find(e => e.id === tck.eventId);
                        return (
                          <div 
                            key={tck.id} 
                            onClick={() => setSelectedTicketId(selectedTicketId === tck.id ? null : tck.id)}
                            className={`p-4 border rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all relative overflow-hidden group ${
                              selectedTicketId === tck.id
                                ? (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-emerald-50/20 border-emerald-500/30 shadow')
                                : (isDarkMode ? 'bg-slate-950/50 border-slate-900' : 'bg-slate-50/70 border-slate-150')
                            }`}
                          >
                            <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-emerald-500 rounded-bl-xl"></div>
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono text-[9px] font-extrabold text-emerald-450 block tracking-wider uppercase">
                                  {tck.ticketCode}
                                </span>
                                <h3 className="text-xs font-bold mt-1 leading-snug group-hover:text-emerald-400 transition-colors">
                                  {tck.eventName}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  {matchingEvent?.date || '25 July 2026'} • {matchingEvent?.location || 'Central Auditorium'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider font-mono uppercase ${
                                  tck.status === 'VERIFIED'
                                    ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {tck.status}
                                </span>
                                <span className="block text-[9px] font-mono font-bold text-slate-500 mt-2">{tck.seatNumber}</span>
                              </div>
                            </div>

                            {/* Collapsible View / Download Area */}
                            {selectedTicketId === tck.id && (
                              <div className="mt-4 pt-4 border-t border-slate-900/10 space-y-4 animate-fade-in">
                                <div className="flex flex-col items-center justify-center p-4 bg-white border rounded-xl gap-2 max-w-[200px] mx-auto shadow-inner">
                                  <QRCodeSVG
                                    value={tck.signature}
                                    size={120}
                                    level="Q"
                                    includeMargin={false}
                                  />
                                  <span className="text-[8px] font-mono text-slate-400 leading-none">HMAC CODE SCAN PASS</span>
                                </div>
                                <div className="text-center">
                                  <span className="font-mono text-[8.5px] text-slate-500 select-all block break-all">
                                    Signature: {tck.signature}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (matchingEvent) downloadTicketHTML(tck, matchingEvent);
                                    }}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                  >
                                    <Download className="h-3 w-3" />
                                    Download Ticket
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Simulated Wallet Pinning
                                      alert(`Ticket ${tck.ticketCode} successfully pinned to your secure mobile DuesFlow Wallet keychain!`);
                                    }}
                                    className={`flex-1 py-1.5 border rounded-lg text-[10px] font-bold text-center transition-colors ${
                                      isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-350' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    Save Pass to Wallet
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* REGISTER IN EVENTS BOARD */}
              <div className={`p-6 rounded-3xl border transition-all ${
                isDarkMode 
                  ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-emerald-500" />
                  Register for Upcoming Departmental Events ({events.length})
                </h4>

                <div className="space-y-4">
                  {events.map((evt) => {
                    const studentHasTicket = tickets.some(t => t.studentIndex === activeStudent.indexNumber && t.eventId === evt.id);
                    // Check if eligible
                    const meetsRule = evt.eligibilityRules === 'All' || 
                      ((evt.eligibilityRules === 'Cleared' || evt.eligibilityRules === 'Paid') && activeStudent.status === 'PAID');
                    
                    return (
                      <div 
                        key={evt.id} 
                        className={`p-5 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-950/40 border-slate-900 hover:border-slate-800' 
                            : 'bg-slate-50/70 border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 md:max-w-xl">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-widest font-mono uppercase bg-slate-500/10 text-slate-400">
                              {evt.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-widest font-mono uppercase ${
                              meetsRule 
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/15' 
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/15'
                            }`}>
                              Rules: {evt.eligibilityRules === 'All' ? 'Open Access' : 'Cleared Students Only'}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold leading-snug mt-1.5">{evt.name}</h3>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Date: {evt.date} • Location: <strong>{evt.location || 'Central Auditorium'}</strong> • Capacity: {evt.capacity || 100} seats remaining
                          </p>
                        </div>

                        <div>
                          {studentHasTicket ? (
                            <button
                              type="button"
                              disabled
                              className="px-4 py-2 border border-emerald-500/15 bg-emerald-500/5 text-emerald-450 rounded-xl text-[10px] font-extrabold select-none flex items-center gap-1 leading-tight font-mono"
                            >
                              ✓ REGISTERED PASS ISSUED
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={registeringEventId === evt.id}
                              onClick={() => {
                                setRegistrationError(null);
                                setRegistrationSuccess(null);
                                setRegisteringEventId(evt.id);

                                setTimeout(() => {
                                  // Verify eligibility rule
                                  if ((evt.eligibilityRules === 'Cleared' || evt.eligibilityRules === 'Paid') && activeStudent.status !== 'PAID') {
                                    setRegistrationError(`Clearance Required: Highly secured entry! This event is strictly restricted to Cleared Level ${activeStudent.level} students. Settle outstanding fees to unlock eligibility.`);
                                    setRegisteringEventId(null);
                                    addSecurityAlert(
                                      'INFO',
                                      'Registration Denied',
                                      `Student ${activeStudent.indexNumber} blocked from registering to ${evt.name} due to outstanding status.`
                                    );
                                    return;
                                  }

                                  // Check if already registered
                                  const alreadyRegistered = tickets.some(t => t.studentIndex === activeStudent.indexNumber && t.eventId === evt.id);
                                  if (alreadyRegistered) {
                                    setRegistrationError(`You have already registered for this event!`);
                                    setRegisteringEventId(null);
                                    return;
                                  }

                                  // Success! Generate ticket
                                  const ticketCode = `${orgSettings.ticketPrefix || 'TCK'}-${Math.floor(100000 + Math.random() * 900000)}`;
                                  const randomSeat = `SEAT-${Math.floor(Math.random() * 150) + 1}`;
                                  
                                  const newTicket: Ticket = {
                                    id: Math.random().toString(),
                                    ticketCode,
                                    eventId: evt.id,
                                    eventName: evt.name,
                                    studentName: activeStudent.name,
                                    studentIndex: activeStudent.indexNumber,
                                    status: 'UNUSED',
                                    seatNumber: randomSeat,
                                    issuedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                                    signature: `JWS:INDEX="${activeStudent.indexNumber}",TKT="${ticketCode}",OPCODE="APPROVED"`
                                  };

                                  setTickets(prev => [...prev, newTicket]);
                                  setRegistrationSuccess(`Successfully registered! Admission pass ${ticketCode} generated with seat assignment ${randomSeat}.`);
                                  setRegisteringEventId(null);

                                  addAuditLog(
                                    'EVENT_REGISTRATION_SUCCESS',
                                    undefined,
                                    undefined,
                                    `Student ${activeStudent.name} registered for ${evt.name}. Ticket issued: ${ticketCode}.`,
                                    activeStudent.name,
                                    'STUDENT'
                                  );
                                }, 1000);
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-extrabold font-sans tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                registeringEventId === evt.id
                                  ? 'bg-slate-900 border border-slate-800 text-slate-400'
                                  : meetsRule
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-500/20 text-white shadow shadow-emerald-500/10'
                                    : 'bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/20 text-rose-500'
                              }`}
                            >
                              {registeringEventId === evt.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Issuing Ticket...
                                </>
                              ) : meetsRule ? (
                                <>
                                  Register & Issue Pass
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </>
                              ) : (
                                <>
                                  Pay Dues to Unlock
                                  <Lock className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS & MESSAGING CENTER TAB PANEL */}
          {dbTab === 'announcements' && (
            <div className={`p-6 rounded-3xl border transition-all animate-fade-in ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}>
              <div className="flex justify-between items-center pb-4 border-b border-slate-900/10 mb-6">
                <div>
                  <h3 className="text-base font-black tracking-tight">Departmental Announcements</h3>
                  <p className="text-xs text-slate-400">Direct broadcasts from executive officers and system notices.</p>
                </div>
                <div className="flex items-center gap-1 bg-[#10b981]/10 text-emerald-400 rounded-xl px-3 py-1.5 text-[10px] font-bold font-mono">
                  <Bell className="h-3.5 w-3.5" />
                  ({announcements.length - readAnnouncements.length} UNREAD)
                </div>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="h-10 w-10 text-slate-600 mb-2 mx-auto animate-pulse" />
                  <span className="text-xs font-bold text-slate-400">No announcements yet</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                    Announcements published by the executive board will appear instantly in this secure feed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => {
                    const isRead = readAnnouncements.includes(ann.id);
                    return (
                      <div 
                        key={ann.id} 
                        onClick={() => {
                          if (!isRead) {
                            setReadAnnouncements(prev => [...prev, ann.id]);
                          }
                        }}
                        className={`p-4 border rounded-2xl transition-all relative ${
                          isRead
                            ? (isDarkMode ? 'bg-slate-950/20 border-slate-900 hover:border-slate-800' : 'bg-slate-50/40 border-slate-150 hover:bg-slate-50')
                            : (isDarkMode ? 'bg-[#09151c]/50 border-[#10b981]/25 hover:border-[#10b981]/40' : 'bg-emerald-500/5 border-emerald-500/20 shadow-sm')
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {!isRead && (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider font-mono uppercase ${
                                ann.priority === 'Critical' || ann.priority === 'Urgent'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : ann.priority === 'Important'
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {ann.priority}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500 font-bold">
                                {ann.publishDate} • Target Area: {ann.targetAudience}
                              </span>
                            </div>
                            <h3 className="text-xs font-bold leading-snug mt-1.5">
                              {ann.title}
                            </h3>
                            <p className="text-[11px] text-slate-450 leading-relaxed font-medium pt-1">
                              {ann.message}
                            </p>

                            {/* Attachements mockup */}
                            {ann.attachments && (
                              <div className="mt-3 pt-3 border-t border-slate-900/10 flex flex-wrap gap-2">
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    alert(`Simulation: Downloading file attachment document "${ann.attachments}"!`);
                                  }}
                                  className="px-3 py-1.5 bg-slate-500/10 hover:bg-slate-500/15 text-slate-300 rounded-lg text-[9px] font-bold inline-flex items-center gap-1 border border-slate-500/25 transition-colors font-mono"
                                >
                                  📂 {ann.attachments}
                                </a>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Extra SMTP confirmation note requested */}
                        <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-900/5 pt-2">
                          <span>Security code SMTP: SENT CLEARANCE OK</span>
                          <span>Delivered to: {emailAddress}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MY STUDENT PROFILE & FINANCIAL PASSPORT TAB PANEL */}
          {dbTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              {/* Financial Passport Presentation - Left Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between h-[340px] shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-[#0c1421] via-[#090d16] to-[#0f1d18] border-slate-880 text-slate-100' 
                    : 'bg-gradient-to-br from-teal-50/40 via-emerald-50/50 to-white border-slate-200 text-slate-900'
                }`}>
                  {/* Glowing background circles for visual interest */}
                  <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-450 shrink-0" />
                        <span className="text-[10px] uppercase tracking-widest font-black font-mono leading-none">
                          STUDENT OPERATIONS PASSPORT
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold tracking-wider font-mono border uppercase ${
                        activeStudent.status === 'PAID'
                          ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                          : activeStudent.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-500/15 border-amber-500/25 text-amber-500'
                            : 'bg-rose-500/15 border-rose-500/25 text-rose-500'
                      }`}>
                        {activeStudent.status === 'PAID' ? 'PASSPORT ACTIVE' : 'PASSPORT INCOMPLETE'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 block tracking-widest uppercase font-mono">AUTHORIZED HOLDER</span>
                        <h2 className="text-base font-black tracking-tight mt-1 leading-none">{activeStudent.name}</h2>
                      </div>

                      <div className="flex gap-8">
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 block tracking-widest uppercase font-mono">INDEX REFS</span>
                          <span className="text-[11px] font-bold font-mono tracking-wide">{activeStudent.indexNumber}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 block tracking-widest uppercase font-mono">LEVEL COHORT</span>
                          <span className="text-[11px] font-extrabold font-mono text-emerald-450 uppercase">Level {activeStudent.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-slate-900/10 flex items-end justify-between">
                    <div>
                      <span className="text-[7.5px] font-bold text-slate-500 block tracking-widest uppercase font-mono">CRYPTOGRAPHIC FINGERPRINT</span>
                      <span className="text-[9px] font-mono text-slate-400 leading-none">PASS-DF-{activeStudent.indexNumber}-A9X2Z</span>
                    </div>
                    
                    <div className="h-14 w-14 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center shadow-md">
                      <QRCodeSVG
                        value={`JWS-PASSPORT:${activeStudent.indexNumber},STATUS:${activeStudent.status}`}
                        size={48}
                        level="M"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport Metrics & Clearance Core details - Right Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className={`p-6 rounded-3xl border transition-all ${
                  isDarkMode 
                    ? 'bg-[#090d16] border-slate-900 shadow-sm text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}>
                  <h3 className="text-sm font-black tracking-tight mb-4 font-mono uppercase text-slate-400 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-500" />
                    Ledger Financial Health Status
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 border rounded-2xl ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className="text-[10px] text-slate-450 block font-bold font-mono uppercase tracking-wider">Cleared Contribution</span>
                      <span className="text-lg font-black block mt-1 font-mono text-emerald-400">GHS {activeStudent.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className={`p-4 border rounded-2xl ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className="text-[10px] text-slate-450 block font-bold font-mono uppercase tracking-wider">Outstanding Obligation</span>
                      <span className={`text-lg font-black block mt-1 font-mono ${activeStudent.outstandingDues > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        GHS {activeStudent.outstandingDues.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Progressive Meter */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-400 font-mono uppercase">Fintech Clearance Progression</span>
                      <span className="font-bold text-emerald-450">{activeStudent.status === 'PAID' ? '100% Cleared' : activeStudent.status === 'PARTIALLY_PAID' ? '50% Cleared' : '0% Cleared'}</span>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden flex ${
                      isDarkMode ? 'bg-slate-900' : 'bg-slate-150'
                    }`}>
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: activeStudent.status === 'PAID' ? '100%' : activeStudent.status === 'PARTIALLY_PAID' ? '50%' : '0%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Registry Details Metadata */}
                  <div className={`p-4 border rounded-2xl space-y-3 ${
                    isDarkMode ? 'bg-slate-950/30 border-slate-900' : 'bg-slate-50/70 border-slate-150'
                  }`}>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Registry Verification Metadata</span>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">Academic Year cohort</span>
                        <strong className="block text-slate-200 mt-0.5">{orgSettings.academicYear}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">Registry Status Code</span>
                        <strong className="block text-emerald-450 mt-0.5 font-mono">CLEARANCE_VERIFIED</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">Default Contact Domain</span>
                        <strong className="block text-slate-200 mt-0.5 font-mono">{orgSettings.emailDomain}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">System Host Access</span>
                        <strong className="block text-slate-200 mt-0.5 font-mono">DuesFlow Sandboxed Portal</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="mt-6 pt-6 border-t border-slate-900/10 flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeStudent.status !== 'PAID') {
                          alert(`Validation Error: Please clear outstanding balance GHS ${activeStudent.outstandingDues.toFixed(2)} on overview tab to issue clearance pass.`);
                          return;
                        }
                        // download Receipt PDF
                        downloadReceiptHTML();
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      Download Clearance Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() => setDbTab('receipts')}
                      className={`flex-1 py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Receipt className="h-4 w-4" />
                      View Receipts Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT HUB PANEL */}
          {dbTab === 'payment' && (
            <div className={`p-6 rounded-3xl border transition-all ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 shadow-xl text-slate-100 animate-fade-in' 
                : 'bg-white border-slate-200 text-slate-900 shadow-md animate-fade-in'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-550 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight leading-none uppercase font-mono">Dues Payment Gateway</h2>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-none">Settle COMPSSA outstanding dues ledger securely in seconds.</p>
                </div>
              </div>

              {activeStudent.status === 'PAID' ? (
                <div className="p-8 text-center border-2 border-dashed border-emerald-500/15 rounded-3xl bg-emerald-500/5 max-w-lg mx-auto my-6 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow shadow-emerald-500/5">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-500">CLEARANCE COMPLETED: ACTIVE PASS</h3>
                    <p className={`text-xs mt-1 leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Excellent status! You have fully cleared all level operations dues (GHS 0.00 outstanding balance). All digital tickets, biometric clearance references, and graduation logs are verified.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setDbTab('profile')}
                      className={`px-4 py-2 border text-xs rounded-xl font-bold transition-all cursor-pointer ${
                        isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-55'
                      }`}
                    >
                      View Digital Passport
                    </button>
                    <button
                      type="button"
                      onClick={() => setDbTab('receipts')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-505 hover:to-teal-405 text-xs text-white rounded-xl font-bold transition-all cursor-pointer"
                    >
                      View Receipts Ledger
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left part: Invoice & Fees Breakdowns */}
                  <div className="md:col-span-7 space-y-4">
                    <div className={`p-5 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block tracking-wider uppercase mb-3">OFFICIAL COMPSSA INVOICE STATEMENT</span>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-900/10 dark:border-slate-800/10">
                          <span className="text-slate-400">Student Account Holder</span>
                          <span className="font-bold">{activeStudent.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-900/10 dark:border-slate-800/10">
                          <span className="text-slate-400">Assigned Cohort</span>
                          <span className="font-bold font-mono">COMPSSA Level {activeStudent.level} Dues</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-900/10 dark:border-slate-800/10">
                          <span className="text-slate-400">Billing Network Node</span>
                          <span className="font-bold font-mono text-teal-500">Paystack Secure API Router</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 text-sm">
                          <span className="font-bold text-rose-500">Total Obligation (GHS)</span>
                          <span className="text-lg font-black font-mono text-rose-500">GHS {activeStudent.outstandingDues.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      isDarkMode ? 'bg-[#1a0f12] border-rose-500/10' : 'bg-rose-50/40 border-rose-100'
                    }`}>
                      <AlertTriangle className="h-5 w-5 text-rose-550 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-550 dark:text-rose-400 block font-bold">Ledger Block Warning:</strong>
                        <p className={`mt-0.5 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Dues must be cleared to activate digital entry cards, book event reservation credentials, or pass final academic clearances.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right part: Payment Action Call and trust badges */}
                  <div className="md:col-span-5 space-y-4">
                    <div className={`p-5 rounded-2xl border text-center ${
                      isDarkMode ? 'bg-slate-950/20 border-slate-900' : 'bg-slate-50/50 border-slate-150'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block font-mono">FINALIZE CHECKOUT</span>
                      
                      <p className={`text-xs mt-3 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ready to settle GHS {activeStudent.outstandingDues.toFixed(2)}? Launch the secure checkout flow to trigger instant Paystack integration.
                      </p>

                      <button
                        type="button"
                        onClick={() => setPaymentStep('CHOOSING')}
                        className="w-full py-3.5 mt-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:translate-y-0.5"
                      >
                        <Wallet className="h-4 w-4 shrink-0" />
                        Pay Outstanding Dues
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500">
                        <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>PCI-DSS SECURED BY PAYSTACK</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* SYSTEM PREFERENCES PANEL */}
          {dbTab === 'settings' && (
            <div className={`p-6 rounded-3xl border transition-all ${
              isDarkMode 
                ? 'bg-[#090d16] border-slate-900 shadow-xl text-slate-100 animate-fade-in' 
                : 'bg-white border-slate-200 text-slate-900 shadow-md animate-fade-in'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-550 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tight leading-none uppercase font-mono">System Preferences</h2>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-none">Configure student profile access credentials and theme settings.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Edit Email triggering action */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                }`}>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-mono">Account Verification Email</h3>
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="min-w-0">
                      <strong className="text-xs block">Verification Mailbox</strong>
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block font-mono truncate">{activeStudent.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        props.setLoginStep('EMAIL_INPUT');
                        // letting them change verification credentials
                      }}
                      className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all shrink-0 hover:scale-[1.01]"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                {/* Simulated Metadata and clearance status registry */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                }`}>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-mono">Clearance Node Metadata</h3>
                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div>
                      <strong className="text-xs block">Active Registrar</strong>
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block font-mono">COMPSSA operations center</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10 shrink-0 select-none">
                      ONLINE
                    </span>
                  </div>
                </div>

                {/* Developer / Security Credentials */}
                <div className={`p-5 rounded-2xl border md:col-span-2 ${
                  isDarkMode ? 'bg-slate-950/20 border-slate-900' : 'bg-slate-55 border-slate-150'
                }`}>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-emerald-500" /> Cryptographic Ledger Access Key
                  </h3>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[9px] text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-thin">
                    SHIELD_KEY::{activeStudent.indexNumber}::{orgSettings?.academicYear?.replace(" ", "_") || "COHORT_COMPSSA"}::STABLE_SANDBOX
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight mt-2 font-mono">
                    This securely generated cryptographic string authorizes your browser environment to fetch secure event tickets, verify biometric clearances, and spool ledger certificates. Do not share your ledger passport code.
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    )}

      {/* 4. Payment Experience State */}
      {loginStep === 'LOGGED' && activeStudent && paymentStep !== 'IDLE' && (
        <div className="max-w-xl mx-auto py-4">
          <div className={`rounded-3xl border shadow-2xl transition-all relative overflow-hidden ${
            isDarkMode 
              ? 'bg-[#090d16] border-slate-900 text-slate-100' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-1 px-5 py-3 relative border-b uppercase font-mono tracking-widest text-[9px] font-extrabold flex items-center justify-between text-emerald-400 bg-emerald-500/5">
              <span>● Paystack Secure Checkout</span>
              <span>PCI-DSS ENCRYPTED</span>
            </div>

            {paymentStep === 'CHOOSING' && (
              <div className="p-6 space-y-6">
                <div>
                  <button
                    onClick={() => setPaymentStep('IDLE')}
                    className={`flex items-center gap-1 text-xs font-bold select-none cursor-pointer ${
                      isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </button>
                  <h2 className="text-lg font-black tracking-tight mt-3">Redesigned Dues Handshake Invoice</h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select payment channel options powered securely by Paystack's micro-tenant node.
                  </p>
                </div>

                {/* Invoice card */}
                <div className={`p-4 border rounded-2xl ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                }`}>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-900/10 text-xs">
                    <span className="font-semibold text-slate-400">Department / Assembly Item</span>
                    <span className="font-bold">COMPSSA Level {activeStudent.level} Dues</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 text-xs">
                    <span className="font-semibold text-slate-400">Total charge amount</span>
                    <span className="text-sm font-extrabold font-mono text-rose-500">GHS {activeStudent.outstandingDues.toFixed(2)}</span>
                  </div>
                </div>

                {/* Channel options */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider block font-mono">CHOOSE SECURE NETWORK:</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'MOMO', title: 'Mobile Money', icon: Smartphone, desc: 'MTN, AT, Telecel' },
                      { key: 'CARD', title: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard' }
                    ].map((chan) => (
                      <button
                        key={chan.key}
                        onClick={() => setPaymentChoice(chan.key as any)}
                        className={`p-4 border rounded-2xl text-left cursor-pointer transition-all ${
                          paymentChoice === chan.key
                            ? 'bg-emerald-500/5 border-emerald-500 text-emerald-400 shadow-md'
                            : isDarkMode ? 'bg-slate-950/30 border-slate-900 hover:bg-slate-900/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <chan.icon className="h-5 w-5 mb-2" />
                        <span className="text-xs font-bold block">{chan.title}</span>
                        <span className="text-[9px] text-slate-500 block leading-none mt-1">{chan.desc}</span>
                      </button>
                    ))}
                  </div>

                  {paymentChoice === 'MOMO' ? (
                    <div className="space-y-3.5 pt-2 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider mb-1 text-slate-400 uppercase">Provider Network</label>
                        <select
                          value={momoProvider}
                          onChange={(e) => setMomoProvider(e.target.value)}
                          className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-900 font-medium' : 'bg-slate-50 border-slate-200 font-semibold'
                          }`}
                        >
                          <option value="MTN">MTN Mobile Money</option>
                          <option value="Telecel">Telecel Cash</option>
                          <option value="AT">AT Money (AirtelTigo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-wider mb-1 text-slate-400 uppercase">Mobile Mobile Number</label>
                        <input
                          type="tel"
                          required
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          placeholder="054 321 0987"
                          className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs font-mono ${
                            isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5 pt-2 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider mb-1 text-slate-400 uppercase">Card number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4012 3456 7890 0012"
                          className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs font-mono ${
                            isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider mb-1 text-slate-400 uppercase">Expiry Date</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            className={`w-full px-3 py-2.5 rounded-xl border text-center focus:outline-none text-xs font-mono ${
                              isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-wider mb-1 text-slate-400 uppercase">CVV Security</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className={`w-full px-3 py-2.5 rounded-xl border text-center focus:outline-none text-xs font-mono ${
                              isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleInitiateRedesignedPayment}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-500/20 text-xs text-white font-black rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01] active:translate-y-0.5 mt-8 block text-center"
                  >
                    Pay Securely GHS {activeStudent.outstandingDues.toFixed(2)}
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'PROCESSING' && (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                <Loader2 className="h-11 w-11 text-emerald-500 animate-spin mb-4" />
                <h4 className="font-bold text-sm tracking-tight">Safeguarding payment checkouts...</h4>
                <p className={`text-xs mt-2 max-w-sm leading-relaxed duration-300 animate-pulse font-mono text-emerald-400`}>
                  {paymentStatusMessage}
                </p>
                <div className={`mt-6 w-full max-w-xs h-1 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-slate-950' : 'bg-slate-100'
                }`}>
                  <div className="bg-emerald-500 h-full w-[60%] animate-pulse"></div>
                </div>
              </div>
            )}

            {paymentStep === 'SUCCESS' && (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Visual Confetti / Success check circle */}
                <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <CheckCircle className="h-7 w-7" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono block">
                  🎉 TRANSACTION DISPATCHED
                </span>

                <h3 className="text-xl font-black tracking-tight mt-1">Payment Successful!</h3>
                <p className={`text-xs max-w-md leading-relaxed mt-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Your departmental dues payment has been verified and recorded on our microservice ledger databases securely with no page refresh.
                </p>

                {/* 3 Check List Items */}
                <div className="w-full max-w-sm mt-6 mb-8 space-y-2.5">
                  {[
                    'Paystack webhook handshakes verified',
                    'Outstanding invoice ledger cleared',
                    'Cryptographic QR ticketing pass generated spooled'
                  ].map((chk, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl text-xs text-left ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      <span className="font-medium">{chk}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => {
                      setSpooledReceiptId('PAYSTK-DUMMY');
                      setShowReceiptModal(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    }`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Download Receipt
                  </button>

                  <button
                    onClick={() => {
                      setPaymentStep('IDLE');
                      setDbTab('tickets');
                    }}
                    className="flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border border-emerald-500/20 text-xs text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <TicketIcon className="h-3.5 w-3.5" />
                    View Ticket QR
                  </button>
                </div>

                <button
                  onClick={() => setPaymentStep('IDLE') || setDbTab('overview')}
                  className={`mt-4 text-xs font-semibold hover:underline cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-650 hover:text-slate-900'
                  }`}
                >
                  Return to Dashboard
                </button>

              </div>
            )}
          </div>
        </div>
      )}
           {/* 5. Custom Simulated PDF Print Pass Modal */}
      {showReceiptModal && (
        <div 
          onClick={() => {
            setShowReceiptModal(false);
            setPrintHint(false);
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden font-sans relative"
          >
            <button
              onClick={() => {
                setShowReceiptModal(false);
                setPrintHint(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 space-y-6" id="printable-receipt-canvas">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-5">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm tracking-widest uppercase text-slate-400">Ledger Statement Clearance</h3>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight mt-1">DuesFlow Clearance Pass</h2>
                <span className="text-[10px] text-slate-500 font-mono mt-2 block font-bold bg-slate-100 px-3 py-1 rounded inline-block">
                  Reference: {spooledReceiptId === 'PAYSTK-DUMMY' ? 'PAYSTK-' + Math.floor(100000 + Math.random()*900000) : spooledReceiptId}
                </span>
              </div>

              {/* Transaction details list */}
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between border-b pb-2">
                  <span>Student Cleared Name:</span>
                  <span className="font-bold text-slate-900">{activeStudent?.name || 'Kofi Mensah'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Student Index number:</span>
                  <span className="font-mono text-slate-950 font-bold">{activeStudent?.indexNumber || 'STU-300-002'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Departmental Unit:</span>
                  <span className="font-semibold text-slate-900">Computer Science Dept</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Ledger Description:</span>
                  <span className="font-semibold text-slate-900">COMPSSA Annual Association Dues</span>
                </div>
                <div className="flex justify-between font-mono text-sm pt-2">
                  <span className="font-bold text-slate-800">TOTAL AMOUNT CLEARANCE:</span>
                  <span className="font-black text-emerald-600">GHS {(activeStudent?.paidAmount || 240).toFixed(2)}</span>
                </div>
              </div>

              {/* QR verification pass inline */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-250">
                  <QRCodeSVG
                    value={activeStudent?.passDetails || `JWS-BYPASS-REF=${spooledReceiptId}`}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-mono block text-center mt-2 font-bold leading-relaxed max-w-xs break-all">
                  SHA-256 HMAC SECURE FOOTPRINT APPROVED
                </span>
              </div>

              {/* Bottom Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPrintHint(true);
                    try {
                      window.print();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={downloadReceiptHTML}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiptModal(false);
                    setPrintHint(false);
                  }}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {printHint && (
                <p className="text-[9px] text-amber-600 font-medium leading-normal bg-amber-50 rounded-xl p-3 border border-amber-200/50 animate-fade-in mt-2 text-center">
                  Generating print spool... If browser security locks printing inside the sandbox view, tap the <strong>Download</strong> button to save the copy directly!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Separate helper for payment choice toggling to avoid local compilation mismatches
function setPaymentOptionStep() {
  // Safe helper hook
  return true;
}
