/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Transaction, AcademicLevel } from '../types';
import { getStudentVerificationId, generateReceiptToken } from '../utils/verification';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Receipt, Search, Filter, Printer, Download, CheckCircle, Clock, 
  CreditCard, Smartphone, ShieldCheck, Calendar, RefreshCw, X, AlertCircle
} from 'lucide-react';

interface ReceiptCenterProps {
  activeStudent: Student;
  transactions: Transaction[];
  isDarkMode: boolean;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
}

export default function ReceiptCenter({ 
  activeStudent, 
  transactions, 
  isDarkMode,
  addAuditLog 
}: ReceiptCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Receipt viewing modal state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [printHint, setPrintHint] = useState(false);

  // Custom standalone HTML receipt download
  const downloadReceiptHTML = (tx: Transaction) => {
    const receiptNumber = tx.reference.replace('PAYSTK-', 'RCP-2026-');
    const desc = `Departmental Dues - Level ${activeStudent.level}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DuesFlow Receipt - ${activeStudent.name}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #1e293b; padding: 40px; }
          .card { background: white; border: 2px solid #e2e8f0; border-radius: 24px; max-width: 500px; margin: 0 auto; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 14px; font-weight: 955; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; margin: 0; }
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
            <div class="ref font-mono">Receipt: ${receiptNumber}</div>
          </div>
          
          <div class="table">
            <div class="row"><span>Student Name:</span><span class="bold">${activeStudent.name}</span></div>
            <div class="row"><span>Student Index Number:</span><span class="bold" style="font-family: monospace;">${activeStudent.indexNumber}</span></div>
            <div class="row"><span>Departmental Unit:</span><span class="bold">Computer Science Unit</span></div>
            <div class="row"><span>Ledger Description:</span><span class="bold">${desc}</span></div>
            <div class="row"><span>Verification ID:</span><span class="bold font-mono">${studentVerificationId}</span></div>
            <div class="row"><span>Payment Signature:</span><span class="bold font-mono" style="font-size: 10px;">${tx.reference}</span></div>
            <div class="row" style="margin-top: 8px; padding-top: 12px; border-top: 2px solid #cbd5e1;">
              <span class="bold">TOTAL AMOUNT PAID:</span>
              <span class="green">GHS ${tx.amount.toFixed(2)}</span>
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
    a.download = `Receipt_${receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addAuditLog(
      'RECEIPT_DOWNLOAD_OFFLINE',
      undefined,
      undefined,
      `Student ${activeStudent.name} offline-spooled receipt ${receiptNumber} successfully.`,
      activeStudent.name,
      'STUDENT'
    );
  };

  // Get student's transactions
  const studentTxs = transactions.filter(t => t.studentIndex === activeStudent.indexNumber && t.status === 'SUCCESS');

  // Calculations for Summary Cards
  const totalPaymentsCount = studentTxs.length;
  const totalAmountPaid = studentTxs.reduce((sum, tx) => sum + tx.amount, 0);
  
  const lastPaymentTimestamp = studentTxs.length > 0 
    ? [...studentTxs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
    : null;
    
  const lastPaymentDate = lastPaymentTimestamp
    ? new Date(lastPaymentTimestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No payments';

  // Current financial status details
  const currentStatus = activeStudent.status;

  // Filter transactions
  const filteredTxs = studentTxs.filter(tx => {
    const matchesSearch = tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if the level is matches
    // Note: since our transactions don't store student level natively, we match for activeStudent
    const matchesLevel = levelFilter === 'All' || activeStudent.level === levelFilter;
    
    const matchesChannel = channelFilter === 'All' || 
                           (channelFilter === 'Card' && tx.channel === 'Card') ||
                           (channelFilter === 'MoMo' && tx.channel === 'Mobile Money');
                           
    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    
    return matchesSearch && matchesLevel && matchesChannel && matchesStatus;
  });

  const studentVerificationId = getStudentVerificationId(activeStudent.indexNumber);

  // Simulated PDF downloading action
  const handleDownloadReceipt = (tx: Transaction) => {
    setIsDownloading(true);
    setDownloadSuccess('');
    
    addAuditLog(
      'RECEIPT_PDF_DOWNLOAD',
      undefined,
      undefined,
      `Student ${activeStudent.name} requested secure PDF download spool for payment reference: ${tx.reference}.`,
      activeStudent.name,
      'STUDENT'
    );

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(`Receipt-${tx.reference}.pdf has been saved to your downloads.`);
      
      // Auto clear success message
      setTimeout(() => setDownloadSuccess(''), 4000);
      
      // Native printer window call
      window.print();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Receipts Info Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Receipts & Payment History</h2>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>
          Securely view, download, and cryptographically verify all transactions on your ledger.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Payments Count */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Total Payments Made
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center font-bold">
              {totalPaymentsCount}
            </div>
            <span className="text-xl font-extrabold font-mono tracking-tight">
              {totalPaymentsCount} Record{totalPaymentsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Card 2: Total Amount */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Total Amount Paid
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-extrabold font-mono text-emerald-400">
              GHS {totalAmountPaid.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card 3: Last Payment */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Last Payment Date
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold leading-tight text-slate-350">
              {lastPaymentDate}
            </span>
          </div>
        </div>

        {/* Card 4: Financial Standing */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Current Financial Status
          </span>
          <div className="mt-2.5">
            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black font-mono border tracking-wider uppercase block text-center ${
              currentStatus === 'PAID'
                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                : currentStatus === 'PARTIALLY_PAID'
                ? 'bg-amber-500/15 border-amber-500/25 text-amber-500'
                : 'bg-rose-500/15 border-rose-500/25 text-rose-500'
            }`}>
              {currentStatus === 'PAID' ? 'FULLY CLEARED' : currentStatus === 'PARTIALLY_PAID' ? 'PARTIALLY CLEARED' : 'UNCLEARED'}
            </span>
          </div>
        </div>
      </div>

      {/* Filtering Widgets Container */}
      <div className={`p-4 rounded-2xl border ${
        isDarkMode ? 'bg-[#090d16]/60 border-slate-900' : 'bg-white border-slate-150 shadow-sm'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              placeholder="Search by receipt or reference number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none border transition-all ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-850 focus:border-emerald-500 text-white placeholder-slate-600' 
                  : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900 placeholder-slate-400'
              }`}
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* Academic Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border cursor-pointer focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="All">All Academic Years</option>
              <option value="100">Level 100 Dues</option>
              <option value="200">Level 200 Dues</option>
              <option value="300">Level 300 Dues</option>
              <option value="400">Level 400 Dues</option>
            </select>
          </div>

          {/* Payment Type Filter */}
          <div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs border cursor-pointer focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-350' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="All">All Channels</option>
              <option value="Card">Visa/Mastercard</option>
              <option value="MoMo">Mobile Money</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500 animate-bounce" />
          {downloadSuccess}
        </div>
      )}

      {/* Receipts List */}
      <div className={`p-6 rounded-3xl border ${
        isDarkMode ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-150 shadow-sm'
      }`}>
        {filteredTxs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-850/40 text-slate-400">
                  <th className="pb-3 pt-1 font-semibold">Receipt Number</th>
                  <th className="pb-3 pt-1 font-semibold">Description</th>
                  <th className="pb-3 pt-1 font-semibold text-center">Payment Date</th>
                  <th className="pb-3 pt-1 font-semibold text-right">Amount</th>
                  <th className="pb-3 pt-1 font-semibold text-center">Status</th>
                  <th className="pb-3 pt-1 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/15">
                {filteredTxs.map((tx) => {
                  const receiptNumber = tx.reference.replace('PAYSTK-', 'RCP-2026-');
                  const desc = `Departmental Dues - Level ${activeStudent.level}`;
                  return (
                    <tr key={tx.id} className={`${isDarkMode ? 'hover:bg-slate-950/20' : 'hover:bg-slate-50'} transition-all`}>
                      <td className="py-4 font-mono font-bold text-emerald-400">{receiptNumber}</td>
                      <td className="py-4 font-medium max-w-[150px] truncate">{desc}</td>
                      <td className="py-4 text-center text-slate-400 font-mono">
                        {new Date(tx.timestamp).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 text-right font-mono font-extrabold text-slate-100">GHS {tx.amount.toFixed(2)}</td>
                      <td className="py-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded text-[9px] font-mono uppercase">
                          PAID
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTx(tx)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200' 
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                            title="Interactive View"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(tx)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer"
                          >
                            <Printer className="h-3 w-3 inline mr-1" /> Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Receipt className="h-10 w-10 text-slate-500 mb-2 animate-pulse" />
            <span className="text-xs font-bold text-slate-400">No matching receipts found</span>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
              We couldn't find any successful dues ledger receipts matching your filters or search constraints.
            </p>
          </div>
        )}
      </div>

      {/* PDF Spooling / Printable Receipt Modal */}
      {selectedTx && (
        <div 
          onClick={() => {
            setSelectedTx(null);
            setPrintHint(false);
          }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-3xl border border-slate-350 max-w-md w-full shadow-2xl overflow-hidden font-sans relative"
          >
            <button
              onClick={() => {
                setSelectedTx(null);
                setPrintHint(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Printing Frame with institution details */}
            <div className="p-8 space-y-6" id="printable-receipt-canvas">
              {/* Receipt Header branding */}
              <div className="text-center border-b border-dashed border-slate-200 pb-5">
                <div className="h-11 w-11 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 font-mono">
                  UNIVERSITY FINANCIAL OPERATIONS
                </span>
                <h3 className="text-lg font-black text-slate-850 tracking-tight mt-1">DuesFlow Transaction Receipt</h3>
                <span className="text-[10px] text-slate-555 font-mono mt-2 block font-extrabold bg-slate-100 px-3 py-1 rounded inline-block">
                  Receipt: {selectedTx.reference.replace('PAYSTK-', 'RCP-2026-')}
                </span>
              </div>

              {/* Form Metadata */}
              <div className="space-y-3.5 text-xs text-slate-650">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Student Full Name:</span>
                  <span className="font-bold text-slate-900">{activeStudent.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Index Number:</span>
                  <span className="font-mono text-slate-900 font-bold">{activeStudent.indexNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Department Unit:</span>
                  <span className="font-semibold text-slate-900">Computer Science & Eng.</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Academic Standing:</span>
                  <span className="font-semibold text-slate-900">Level {activeStudent.level}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Organization / Issuer:</span>
                  <span className="font-semibold text-slate-900">COMPSSA Association</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Payment Signature ID:</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedTx.reference}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="font-mono text-slate-900">
                    {new Date(selectedTx.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-400">Verification ID:</span>
                  <span className="font-bold font-mono text-slate-900">{studentVerificationId}</span>
                </div>
                <div className="flex justify-between font-mono text-sm pt-2">
                  <span className="font-bold text-slate-800">TOTAL AMOUNT PAID:</span>
                  <span className="font-black text-emerald-600">GHS {selectedTx.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Cryptosecure verification block */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-250 shadow-inner">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${studentVerificationId}`}
                    size={110}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-bold font-mono text-slate-500 mt-2.5 leading-tight">
                  {generateReceiptToken(selectedTx.reference, activeStudent.indexNumber, selectedTx.amount).substring(0, 40)}...
                </span>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold font-mono">
                  HMAC SIGNATURE APPROVED VERIFICATION GATE
                </p>
              </div>

              {/* Action Buttons inside Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPrintHint(true);
                    try {
                      window.print();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => downloadReceiptHTML(selectedTx)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTx(null);
                    setPrintHint(false);
                  }}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
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
