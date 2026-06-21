/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Transaction } from '../types';
import { getStudentVerificationId } from '../utils/verification';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Building2, ShieldCheck, Printer, CheckCircle, Clock, X, 
  Award, Layers, Check, AlertCircle, TrendingUp, HelpCircle,
  Download, Wallet
} from 'lucide-react';

interface ClearanceCenterProps {
  activeStudent: Student;
  transactions: Transaction[];
  isDarkMode: boolean;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
  onInitiatePayment: () => void;
}

export default function ClearanceCenter({ 
  activeStudent, 
  transactions, 
  isDarkMode,
  addAuditLog,
  onInitiatePayment
}: ClearanceCenterProps) {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isProcessingCert, setIsProcessingCert] = useState(false);

  const studentVerificationId = getStudentVerificationId(activeStudent.indexNumber);

  // Financial standing variables
  const isFullyCleared = activeStudent.outstandingDues === 0 && activeStudent.status === 'PAID';
  
  const totalAmountPaid = activeStudent.paidAmount;
  const totalOutstanding = activeStudent.outstandingDues;
  const totalExpected = totalAmountPaid + totalOutstanding;
  const completionPercentage = totalExpected > 0 ? (totalAmountPaid / totalExpected) * 100 : 0;

  // Find last payment date
  const studentTxs = transactions.filter(t => t.studentIndex === activeStudent.indexNumber && t.status === 'SUCCESS');
  const lastPaymentTimestamp = studentTxs.length > 0 
    ? [...studentTxs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
    : null;
  const lastPaymentDate = lastPaymentTimestamp
    ? new Date(lastPaymentTimestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No payments yet';

  // Dynamic Dues breakdown simulator based on the student's level and payment history
  const getDuesBreakdown = () => {
    const levelsList = ['100', '200', '300', '400'] as const;
    const currentLvlInt = parseInt(activeStudent.level);
    
    return levelsList.map(lvl => {
      const lvlInt = parseInt(lvl);
      const duesCost = 120; // 120 per level
      
      let status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID' = 'PENDING';
      let allocatedPaid = 0;
      
      if (lvlInt < currentLvlInt) {
        // Lower levels already paid
        status = 'PAID';
        allocatedPaid = duesCost;
      } else if (lvlInt === currentLvlInt) {
        // Active level dues calculation
        if (totalOutstanding === 0) {
          status = 'PAID';
          allocatedPaid = duesCost;
        } else if (totalAmountPaid > (currentLvlInt - 1) * duesCost) {
          status = 'PARTIALLY_PAID';
          allocatedPaid = totalAmountPaid - (currentLvlInt - 1) * duesCost;
        } else {
          status = 'PENDING';
          allocatedPaid = 0;
        }
      } else {
        // High levels not in scope yet
        status = 'PENDING';
        allocatedPaid = 0;
      }

      return {
        name: `Level ${lvl} Departmental Dues`,
        expected: duesCost,
        paid: allocatedPaid,
        outstanding: Math.max(0, duesCost - allocatedPaid),
        status,
        isRequired: lvlInt <= currentLvlInt
      };
    });
  };

  const duesBreakdown = getDuesBreakdown();

  const downloadCertificateHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DuesFlow Clearance Certificate - ${activeStudent.name}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1e293b; padding: 40px; }
          .card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11px; font-weight: 900; letter-spacing: 0.1em; color: #475569; text-transform: uppercase; margin-top: 4px; }
          .meta { display: flex; justify-content: center; gap: 20px; font-size: 10px; color: #64748b; margin-top: 10px; font-family: monospace; }
          .wording { font-style: italic; text-align: center; font-size: 13px; color: #475569; line-height: 1.6; margin: 24px 0; }
          .table { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; padding: 20px; margin-bottom: 24px; }
          .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 8px 0; font-size: 12px; }
          .row:last-child { border-bottom: none; }
          .bold { font-weight: 800; }
          .green { color: #16a34a; font-weight: 800; }
          .signatures { display: flex; justify-content: space-between; margin-top: 30px; font-size: 11px; text-align: center; }
          .signature-box { border-top: 1px solid #94a3b8; width: 45%; padding-top: 8px; }
          .badge { font-size: 9px; color: #16a34a; font-weight: bold; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2 class="title">University Division of Academic Affairs</h2>
            <div class="subtitle">OFFICIAL STUDENT FINANCIAL CLEARANCE CERTIFICATE</div>
            <div class="meta">
              <span>Doc Hash Id: <b>${studentVerificationId}</b></span>
              <span>Date: <b>${new Date().toLocaleDateString()}</b></span>
            </div>
          </div>
          <p class="wording">This document certifies that the university registry has conducted a full ledger reconcile for the student listed below and confirms clearance has been issued.</p>
          
          <div class="table">
            <div class="row"><span>Student Cleared Name:</span><span class="bold">${activeStudent.name}</span></div>
            <div class="row"><span>Student Index Number:</span><span class="bold" style="font-family: monospace;">${activeStudent.indexNumber}</span></div>
            <div class="row"><span>Academic Level Group:</span><span class="bold">Level ${activeStudent.level}</span></div>
            <div class="row"><span>Departmental Division:</span><span class="bold">Computer Science & Info. Systems</span></div>
            <div class="row"><span>Account Standing:</span><span class="green">PAID & FULLY CLEARED</span></div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <strong style="color: #0f172a;">DR. ISAAC ODURO</strong><br>
              <span>Head of Department</span><br>
              <span class="badge">✓ SECURE DIGITAL KEY</span>
            </div>
            <div class="signature-box">
              <strong style="color: #0f172a;">EBENEZER BOATENG</strong><br>
              <span>Financial Secretary</span><br>
              <span class="badge">✓ SECURE DIGITAL KEY</span>
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
    a.download = `Clearance_Certificate_${activeStudent.indexNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateCertificate = () => {
    setIsProcessingCert(true);
    
    addAuditLog(
      'CLEARANCE_CERTIFICATE_GENERATION',
      undefined,
      undefined,
      `Student ${activeStudent.name} requested cryptographic clearance certificate spool. Clearance Verification check triggered.`,
      activeStudent.name,
      'STUDENT'
    );

    setTimeout(() => {
      setIsProcessingCert(false);
      setShowCertificateModal(true);
    }, 1150);
  };

  return (
    <div className="space-y-6">
      {/* Receipts Info Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Financial Clearance Center</h2>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>
          A single source of truth for your legal financial standing, department dues, and graduation readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Status Panel - span 5 */}
        <div className="lg:col-span-4 space-y-6">
          {/* Clearance Status Card */}
          <div className={`p-6 rounded-3xl border text-center ${
            isDarkMode ? 'bg-[#090d16] border-slate-900 shadow-xl' : 'bg-white border-slate-150 shadow-sm'
          }`}>
            <span className={`text-[10px] font-bold block uppercase tracking-wider ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Student Standing Status
            </span>
            
            <div className="my-5">
              <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-3">
                {isFullyCleared ? (
                  <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/25 animate-pulse">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="h-14 w-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/25 animate-pulse">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <h3 className={`text-2xl font-black font-mono tracking-tight ${
                isFullyCleared ? 'text-emerald-400' : 'text-rose-500'
              }`}>
                {isFullyCleared ? 'CLEARED' : 'NOT CLEARED'}
              </h3>
              
              <p className={`text-[11px] leading-relaxed mt-2 ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>
                {isFullyCleared 
                  ? 'All departmental and executive association obligations have been fulfilled.' 
                  : `Account restricted. Settle outstanding fees to achieve clearance.`
                }
              </p>
            </div>

            {/* Micro stats details with active payment trigger */}
            {!isFullyCleared && (
              <div className="space-y-4 mb-4">
                <div className={`p-3.5 border rounded-2xl text-left text-xs ${
                  isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-150'
                }`}>
                  <span className="font-bold text-rose-500 block">Outstanding Balance:</span>
                  <span className="text-lg font-mono font-extrabold text-rose-500">GHS {totalOutstanding.toFixed(2)}</span>
                  <p className={`text-[10px] mt-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Outstanding level dues limit access to event passes and graduation financial clearance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onInitiatePayment}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:translate-y-0.5"
                >
                  <Wallet className="h-4 w-4 shrink-0" />
                  Pay Dues Now GHS {totalOutstanding.toFixed(2)}
                </button>
              </div>
            )}

            {/* Dynamic Certificate button */}
            <button
              onClick={handleGenerateCertificate}
              disabled={isProcessingCert}
              className={`w-full py-3 bg-gradient-to-r ${
                isFullyCleared 
                  ? 'from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400' 
                  : 'from-slate-700 to-slate-650 cursor-not-allowed opacity-75'
              } text-[11px] text-white font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/5 flex items-center justify-center gap-1.5 cursor-pointer`}
              title={isFullyCleared ? 'Generate Certificate PDF' : 'Dues must be paid in full to retrieve clearance'}
            >
              {isProcessingCert ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Award className="h-4 w-4" />
              )}
              {isFullyCleared ? 'Generate Clearance Certificate' : 'Certificate Locked (Pay Overdue)'}
            </button>
          </div>

          {/* Verification Badge info */}
          <div className={`p-5 rounded-3xl border ${
            isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Verifiable Ledger Reference
            </h4>
            <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>
              Your financial account identity is cryptographically signed. Use this unique key on the public portal.
            </p>
            <div className={`p-2.5 rounded-xl text-center border mt-3 font-mono font-bold text-xs select-all ${
              isDarkMode ? 'bg-slate-950 border-slate-850 text-emerald-400' : 'bg-slate-50 border-slate-200 text-teal-600'
            }`}>
              {studentVerificationId}
            </div>
          </div>
        </div>

        {/* Financial Summary & Breakdown - span 7 */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#090d16] border-slate-900 shadow-xl' : 'bg-white border-slate-150 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold border-b border-slate-850/30 pb-3 mb-4">
              Clearance Ledger Metrics Summary
            </h3>

            {/* Metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className={`p-3.5 border rounded-2xl ${
                isDarkMode ? 'bg-slate-950/40 border-slate-905' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] block font-bold text-slate-500 uppercase tracking-wider`}>Expected Dues</span>
                <span className="text-lg font-extrabold font-mono text-slate-200 mt-1 block">GHS {totalExpected.toFixed(2)}</span>
              </div>
              <div className={`p-3.5 border rounded-2xl ${
                isDarkMode ? 'bg-slate-950/40 border-slate-905' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] block font-bold text-slate-500 uppercase tracking-wider`}>Total Paid</span>
                <span className="text-lg font-extrabold font-mono text-emerald-400 mt-1 block">GHS {totalAmountPaid.toFixed(2)}</span>
              </div>
              <div className={`p-3.5 border rounded-2xl ${
                isDarkMode ? 'bg-slate-950/40 border-slate-905' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] block font-bold text-slate-500 uppercase tracking-wider`}>Outstanding Amount</span>
                <span className="text-lg font-extrabold font-mono text-rose-500 mt-1 block">GHS {totalOutstanding.toFixed(2)}</span>
              </div>
            </div>

            {/* Progress Completion indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] font-mono">Dues Obligation Completion %</span>
                <span className="font-bold text-emerald-400 font-mono">{completionPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full w-full bg-slate-950 border border-slate-850/40 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Level Dues breakdown matrix */}
          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-[#090d16] border-slate-900 shadow-xl' : 'bg-white border-slate-150 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold border-b border-slate-850/30 pb-3 mb-4">
              Dues Item Enrollment Breakdown
            </h3>

            <div className="space-y-3.5">
              {duesBreakdown.map((item, idx) => (
                <div key={idx} className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  item.status === 'PAID'
                    ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-150'
                    : item.status === 'PARTIALLY_PAID'
                    ? isDarkMode ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-150'
                    : isDarkMode ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-150'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold flex items-center gap-2">
                      {item.name}
                      {!item.isRequired && (
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-500 text-[8px] font-mono rounded">OPTIONAL</span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Expected: GHS {item.expected.toFixed(2)} • Paid: GHS {item.paid.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-[10px] font-bold font-mono text-slate-500">
                      Balance: GHS {item.outstanding.toFixed(2)}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                      item.status === 'PAID'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : item.status === 'PARTIALLY_PAID'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      {item.status === 'PAID' ? 'PAID' : item.status === 'PARTIALLY_PAID' ? 'PARTIALLY PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cryptosecure Clearance Certificate PDF Modal */}
      {showCertificateModal && isFullyCleared && (
        <div 
          onClick={() => setShowCertificateModal(false)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden font-sans relative"
          >
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-850 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Document wrapper */}
            <div className="p-8 space-y-6" id="printable-certificate-canvas">
              {/* Institution Seal heading */}
              <div className="text-center border-b-2 border-slate-900 pb-5">
                <div className="h-12 w-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-indigo-200">
                  <Award className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase text-slate-900">
                  University Division of Academic Affairs
                </h2>
                <h4 className="text-[10px] font-black tracking-widest text-[#0f172a] uppercase font-mono mt-1">
                  OFFICIAL STUDENT FINANCIAL CLEARANCE CERTIFICATE
                </h4>
                <div className="mt-2.5 flex justify-center text-[10px] font-mono text-slate-500 gap-4">
                  <span>Document Hash ID: <b className="text-slate-800">{studentVerificationId}</b></span>
                  <span>Issue Date: <b className="text-slate-800">{new Date().toLocaleDateString()}</b></span>
                </div>
              </div>

              {/* Certificate wording */}
              <p className="text-xs leading-relaxed text-slate-700 text-center italic max-w-sm mx-auto pt-2">
                This document certifies that the university registry has conducted a full ledger reconcile for the student listed below and confirms clearance has been issued.
              </p>

              {/* Certificate Meta details */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-650 space-y-3 font-medium">
                <div className="flex justify-between border-b pb-1">
                  <span>Student Cleared Name:</span>
                  <span className="font-extrabold text-slate-900">{activeStudent.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Student Index number:</span>
                  <span className="font-mono text-slate-900 font-extrabold">{activeStudent.indexNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Academic Level Group:</span>
                  <span className="font-semibold text-slate-900">Level {activeStudent.level}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Departemental division:</span>
                  <span className="font-bold text-slate-900">Computer Science & Info. Systems</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Account Standing:</span>
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> PAID & FULLY CLEARED
                  </span>
                </div>
              </div>

              {/* QR Code and signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                {/* QR code */}
                <div className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl bg-white">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${studentVerificationId}`}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="text-[8px] text-slate-500 font-mono block mt-2 tracking-widest text-center">
                    SCAN TO VERIFY CREDENTIAL
                  </span>
                </div>

                {/* Digital Signature Placeholders */}
                <div className="space-y-4 text-[10px] text-slate-500">
                  <div className="border-t border-slate-400 pt-1.5 text-center mt-6">
                    <span className="font-bold text-slate-900 block font-mono">DR. ISAAC ODURO</span>
                    <span>Head of Department</span>
                    <span className="text-[8px] text-emerald-600 font-mono block font-bold leading-none mt-1">✓ SECURE DIGITAL KEY</span>
                  </div>

                  <div className="border-t border-slate-400 pt-1.5 text-center mt-6">
                    <span className="font-bold text-slate-900 block font-mono">EBENEZER BOATENG</span>
                    <span>Financial Secretary</span>
                    <span className="text-[8px] text-emerald-600 font-mono block font-bold leading-none mt-1">✓ SECURE DIGITAL KEY</span>
                  </div>
                </div>
              </div>

              {/* Action indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={downloadCertificateHTML}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
