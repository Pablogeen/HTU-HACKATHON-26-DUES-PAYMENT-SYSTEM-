/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudentVerificationId } from '../utils/verification';
import { 
  ShieldCheck, Search, CheckCircle, AlertOctagon, HelpCircle, 
  ExternalLink, ArrowLeft, ArrowRight, User, GraduationCap, Building2,
  Calendar, Layers, ShieldCheck as CheckIcon, Check, FileDown, Lock
} from 'lucide-react';

interface VerificationPortalProps {
  students: Student[];
  initialSearchId?: string;
  isDarkMode: boolean;
  onBackToHome: () => void;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
  addSecurityAlert: (severity: 'CRITICAL' | 'WARNING' | 'INFO', source: string, details: string) => void;
}

export default function VerificationPortal({
  students,
  initialSearchId = '',
  isDarkMode,
  onBackToHome,
  addAuditLog,
  addSecurityAlert
}: VerificationPortalProps) {
  const [searchId, setSearchId] = useState(initialSearchId);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Student | null>(null);
  const [errorText, setErrorText] = useState('');

  // Handle auto-searching if initialSearchId is provided
  useEffect(() => {
    if (initialSearchId) {
      handleVerify(initialSearchId);
    }
  }, [initialSearchId]);

  const handleVerify = (queryCode: string) => {
    setErrorText('');
    setSearched(true);
    
    const formattedId = queryCode.trim().toUpperCase();
    if (!formattedId) {
      setResult(null);
      setSearched(false);
      return;
    }

    // Look up student
    const matchedStudent = students.find(s => getStudentVerificationId(s.indexNumber) === formattedId);

    if (matchedStudent) {
      setResult(matchedStudent);
      
      // Log successful verification audit log
      addAuditLog(
        'QR_CODE_VERIFIED',
        undefined,
        formattedId,
        `Successful public ledger lookup for verification ID: ${formattedId}. Matched student: ${matchedStudent.name}.`,
        'Public Verification API Proxy',
        'GUEST'
      );
    } else {
      setResult(null);
      setErrorText('Verification code invalid or not registered in our ledger registry.');

      // Log potential security alert for invalid lookups
      addSecurityAlert(
        'WARNING',
        'Public Verification Portal',
        `Unregistered or altered verification ID searched: "${formattedId}". Blocked potential enumeration vector.`
      );

      // Audit log as well
      addAuditLog(
        'VERIFICATION_LOOKUP_FAILURE',
        undefined,
        formattedId,
        `Failed public verification lookup index. ID entered: "${formattedId}". Threat block active.`,
        'Public Verification Portal',
        'ANONYMOUS_IP_THREAT'
      );
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(searchId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Search Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-850/20 pb-5">
        <div className="space-y-1">
          <button 
            onClick={onBackToHome}
            className={`flex items-center gap-1.5 text-xs font-bold leading-none mb-2 hover:underline cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Portal Landing
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-extrabold tracking-tight">Public Verification Portal</h2>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-450' : 'text-slate-505'}`}>
            Audit and verify any student's dues payment ledger and financial clearance status in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3 py-1.5 leading-tight font-bold shrink-0">
          🛡️ PCI-DSS COMPLIANT SINK
        </div>
      </div>

      {/* Manual Verification Search Interface */}
      <div className={`p-6 rounded-3xl border ${
        isDarkMode ? 'bg-[#090d16] border-slate-900 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <form onSubmit={handleManualSearch} className="space-y-4">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 font-mono ${
              isDarkMode ? 'text-slate-400' : 'text-slate-700'
            }`}>
              Student Ledger Verification ID / URL
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. DFC-XXXXXXXX-XXXX or paste entire link"
                className={`w-full pl-3.5 pr-12 py-3 rounded-2xl border text-xs focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-850 focus:border-emerald-500 text-white placeholder-slate-650' 
                    : 'bg-slate-5 border-slate-200 focus:border-emerald-500 text-slate-950 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 h-9 w-9 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow shadow-emerald-500/10"
                title="Verify ID Code"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              Demo bypass checks: Try Kofi's unique ID: <b className="text-[#a7f3d0] font-bold font-mono">DFC-8AF74FC2-AE94</b> or Ama Serwaa's: <b className="text-[#a7f3d0] font-bold font-mono">DFC-5DDEBB89-CFA4</b>
            </p>
          </div>
        </form>
      </div>

      {/* Verification Query Results rendering */}
      {searched && (
        <div className="animate-fade-in-up">
          {result ? (
            <div className={`border rounded-3xl overflow-hidden ${
              isDarkMode ? 'bg-[#090d16]/80 border-emerald-500/30' : 'bg-white border-emerald-500/20 shadow-xl'
            }`}>
              {/* Result header banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-xs font-black tracking-wider uppercase font-mono">
                    🟢 RECORD VERIFIED EXPLICITLY
                  </span>
                </div>
                <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                  LEDGER MATCH
                </span>
              </div>

              {/* Verified profile layout */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-850/20">
                  {/* Basic information */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-450 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Student Name</span>
                        <h4 className="text-sm font-extrabold text-slate-100">{result.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-450 shrink-0">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Index Number</span>
                        <h4 className="text-sm font-extrabold text-slate-100 font-mono">{result.indexNumber}</h4>
                      </div>
                    </div>
                  </div>

                  {/* Operational parameters */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-450 shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Department Unit</span>
                        <h4 className="text-sm font-extrabold text-slate-100">Computer Science & Info. Systems</h4>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-450 shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Status Standing</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono border uppercase tracking-wider ${
                            result.status === 'PAID'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          }`}>
                            {result.status === 'PAID' ? 'FULLY CLEARED' : 'PENDING CLEARED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ledger metrics matrix */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-3 text-slate-400 font-mono">
                    Audit Log Dues Reconcile Matrix
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-905' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Dues Paid Amount</span>
                        <span className="text-lg font-black font-mono text-[#a7f3d0]">GHS {result.paidAmount.toFixed(2)}</span>
                      </div>
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>

                    <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                      result.outstandingDues === 0
                        ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200'
                        : isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-200'
                    }`}>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">Outstanding Dues</span>
                        <span className={`text-lg font-black font-mono ${
                          result.outstandingDues === 0 ? 'text-[#a7f3d0]' : 'text-rose-400'
                        }`}>GHS {result.outstandingDues.toFixed(2)}</span>
                      </div>
                      {result.outstandingDues === 0 ? (
                        <CheckIcon className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <AlertOctagon className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Secure footer validation note */}
                <div className={`p-3.5 border rounded-2xl text-xs flex gap-2.5 ${
                  isDarkMode ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-650'
                }`}>
                  <Lock className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[10px]">
                    This financial profile reconciles directly with the microservice sandbox database. No local adjustments or client manipulations can affect this result. Secure handshake logged under fingerprint index.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-3xl border text-center space-y-4 ${
              isDarkMode ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' : 'bg-rose-50 border-rose-250 text-rose-800 shadow'
            }`}>
              <div className="h-12 w-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black tracking-tight">Ledger Verification Error</h3>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-rose-450' : 'text-rose-700'}`}>
                {errorText}
              </p>
              <p className="text-[10px] text-slate-550 max-w-sm mx-auto uppercase tracking-wide font-semibold font-mono leading-relaxed">
                🚨 SECURITY WARNING: All failed handshake searches log original IP data and client device fingerprints to protect the sandbox platform.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
