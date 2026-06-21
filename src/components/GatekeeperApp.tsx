/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, DepartmentalEvent, AlertSeverity, Ticket, OrgSettings } from '../types';
import { 
  Camera, Wifi, WifiOff, RefreshCw, AlertTriangle, ShieldCheck, 
  Check, Play, ArrowRight, Smartphone, HeartHandshake, Eye, QrCode
} from 'lucide-react';

interface GatekeeperAppProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  events: DepartmentalEvent[];
  tickets?: Ticket[];
  setTickets?: React.Dispatch<React.SetStateAction<Ticket[]>>;
  addAuditLog: (action: string, oldValue?: string, newValue?: string, details?: string, user?: string, role?: string) => void;
  addSecurityAlert: (severity: AlertSeverity, source: string, details: string) => void;
  orgSettings?: OrgSettings;
}

export default function GatekeeperApp({
  students,
  setStudents,
  events,
  tickets = [],
  setTickets,
  addAuditLog,
  addSecurityAlert,
  orgSettings,
}: GatekeeperAppProps) {
  // Offline State indicator
  const [isOffline, setIsOffline] = useState(false);
  const [ticketCache, setTicketCache] = useState<string[]>([]); // Cache of paid index codes pre-saved
  const [offlineScannedLogs, setOfflineScannedLogs] = useState<{index: string, time: string}[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected event to check tickets
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '1');
  const [activeEvent, setActiveEvent] = useState<DepartmentalEvent | null>(events[0] || null);

  // Scan simulator output state
  const [scanResult, setScanResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    studentName?: string;
    indexNumber?: string;
    details?: string;
  }>({ status: 'IDLE', title: 'Awaiting Scan', message: 'Point camera viewfinder to ticket QR pass.' });

  // List of scanned tickets in the current active session
  const [verifiedAttendees, setVerifiedAttendees] = useState<string[]>([]);

  // Update active event when selector changes
  useEffect(() => {
    const ev = events.find(e => e.id === selectedEventId);
    if (ev) setActiveEvent(ev);
  }, [selectedEventId, events]);

  // Load ticket cache offline when offline flipped
  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);

    if (nextState) {
      // Synchronously download all paid students indices who are cleared
      const paidIndices = students.filter(s => s.status === 'PAID').map(s => s.indexNumber);
      setTicketCache(paidIndices);
      
      addAuditLog(
        'OFFLINE_MODE_ENGAGED',
        'Online',
        'Offline Cache Active',
        `Scanner downloaded ${paidIndices.length} validated student cryptographical checksum codes. Standalone validation engine initiated.`,
        'Gate Agent Alpha',
        'GATE_KEEPER'
      );
    } else {
      // Reconnected! Process offline syncing queue
      if (offlineScannedLogs.length > 0) {
        setIsSyncing(true);
        setTimeout(() => {
          setIsSyncing(false);
          
          addAuditLog(
            'OFFLINE_RECONCILIATION_SYNC',
            `${offlineScannedLogs.length} offline records`,
            'Synced with DB',
            `Reconciliation complete. Synchronized ${offlineScannedLogs.length} checkins with PostgreSQL. Re-validated signature logs successfully.`,
            'Gate Agent Alpha',
            'SYSTEM_WORKER'
          );

          // Check if any double entry fraud scenarios occurred during offline mode
          // i.e., same student ticket scanned multiple times in offline queues
          const scannedIndices = offlineScannedLogs.map(l => l.index);
          const duplicates = scannedIndices.filter((item, index) => scannedIndices.indexOf(item) !== index);

          duplicates.forEach(dupIndex => {
            const stu = students.find(s => s.indexNumber === dupIndex);
            addSecurityAlert(
              'CRITICAL',
              'Offline Fraud Collision',
              `Security Alert: Ticket ${dupIndex} (${stu?.name || 'Unknown'}) was validated locally on multiple gate-scanners simultaneously while network was disconnected.`
            );
          });

          setOfflineScannedLogs([]);
        }, 1500);
      }
    }
  };

  // Triggering visual scans simulation
  const handleSimulateScan = (scenario: string, customStudentIndex?: string) => {
    // Clear previous
    setScanResult({ status: 'IDLE', title: 'Processing...', message: 'Validating cryptographic signature hash...' });

    // Emulate scanner process latency
    setTimeout(() => {
      // Scenario 1: Valid Clearing Student scan
      if (scenario === 'VALID' && customStudentIndex) {
        const student = students.find(s => s.indexNumber === customStudentIndex);
        if (!student) return;

        // Check if already scanned in current session
        const isDuplicate = verifiedAttendees.includes(student.indexNumber);

        if (isDuplicate) {
          setScanResult({
            status: 'ERROR',
            title: 'DUPLICATE TICKET',
            message: 'Access Denied: Ticket was scanned and marked USED.',
            studentName: student.name,
            indexNumber: student.indexNumber,
            details: 'Rule: Unused status breached. Double scan logged to cloud auditer.'
          });

          addSecurityAlert(
            'WARNING',
            'Double Entrance Defeated',
            `Security Check Failed: Duplicate ticket attempt at Gate Scanner for Student index ${student.indexNumber} (${student.name}).`
          );
          
          addAuditLog(
            'TICKET_DOUBLE_SCAN_BLOCKED',
            'UNUSED',
            'USED',
            `Duplicate QR scans attempted by student index ${student.indexNumber}. Entry blocked.`,
            'Gate Agent Alpha',
            'GATE_KEEPER'
          );
          return;
        }

        if (student.status !== 'PAID') {
          setScanResult({
            status: 'ERROR',
            title: 'UNPAID LEDGER',
            message: 'Access Denied: Outstanding balances remain.',
            studentName: student.name,
            indexNumber: student.indexNumber,
            details: `Outstanding dues: GHS ${student.outstandingDues.toFixed(2)}. Unpaid students cannot enter events.`
          });

          addAuditLog(
            'TICKET_UNPAID_DENIED',
            undefined,
            undefined,
            `Access denied for unpaid student ${student.indexNumber}. Cleared dues requirement unmet.`,
            'Gate Agent Alpha',
            'GATE_KEEPER'
          );
          return;
        }

        // Paid & Not duplicate -> Success
        setVerifiedAttendees(prev => [...prev, student.indexNumber]);
        
        if (isOffline) {
          setOfflineScannedLogs(prev => [...prev, { index: student.indexNumber, time: new Date().toLocaleTimeString() }]);
        }

        // Increase attendee counts
        if (activeEvent) {
          activeEvent.attendeesCount = Math.min(activeEvent.attendeesCount + 1, activeEvent.maxAttendees);
        }

        setScanResult({
          status: 'SUCCESS',
          title: 'VERIFIED SUCCESS',
          message: 'ENTRY GRANTED: Clearance active.',
          studentName: student.name,
          indexNumber: student.indexNumber,
          details: `Level ${student.level} • Signature: HS256-OK • GHS 120.00 PAID`
        });

        addAuditLog(
          'TICKET_VERIFIED_CHECKIN',
          'UNUSED',
          'VERIFIED_IN',
          `Checked in student ${student.name} (${student.indexNumber}) at event "${activeEvent?.name}" successfully. ${isOffline ? '(OFFLINE CACHE RECORDED)' : '(ONLINE CLOUD PERSISTED)'}`,
          'Gate Agent Alpha',
          'GATE_KEEPER'
        );
      }

      // Scenario 2: Spoofed / Tamperate Signature
      else if (scenario === 'SPOOF') {
        setScanResult({
          status: 'ERROR',
          title: 'INVALID SIGNATURE',
          message: 'Security Threat: Decryption failure on QR code.',
          details: 'Decryption payload: HMAC signature mismatch. QR generation contains tampered credentials.'
        });

        addSecurityAlert(
          'CRITICAL',
          'Tampered Decryption QR',
          'Security Critical: A gate scanner captured an outdoor QR ticket with an invalid HMAC cryptographic hash. Possible counterfeit attempt.'
        );

        addAuditLog(
          'TICKET_TAMPERED_SPOOF_BLOCKED',
          undefined,
          undefined,
          'Intercepted counterfeited QR pass with spoofed HSM signature. Incident logged for security audit.',
          'Gate Agent Alpha',
          'GATE_KEEPER'
        );
      }

      // Scenario 3: Revoked Pass
      else if (scenario === 'REVOKED') {
        setScanResult({
          status: 'ERROR',
          title: 'REVOKED ACCESS',
          message: 'Access Denied: Ticket cancelled by President.',
          details: 'Ticket status: REVOKED (Cleared balance was refunded or disputed).'
        });

        addAuditLog(
          'TICKET_REVOKED_BLOCKED',
          undefined,
          undefined,
          'Access blocked for manually revoked ticket pass. Authentication check rejected.',
          'Gate Agent Alpha',
          'GATE_KEEPER'
        );
      }
    }, 600);
  };

  return (
    <div id="scanner-view-section" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-4">
      {/* Col 1: Smartphone mock */}
      <div id="phone-mock-stage" className="flex justify-center items-center">
        <div className="w-[316px] h-[640px] bg-slate-950 border-8 border-slate-900 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          
          {/* Top Speaker pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-905 rounded-full z-45 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          </div>

          {/* Phone Header panel */}
          <div className="pt-8 px-5 pb-3 bg-slate-900 border-b border-slate-850 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-mono select-none">
              <span className="font-semibold text-slate-200">DH-01</span>
              <span className="text-[10px] text-slate-500">• Gate</span>
            </div>

            {/* Network Indicator status */}
            <div className="flex items-center gap-1.5 select-none">
              {isOffline ? (
                <div className="flex items-center gap-1 font-semibold text-rose-400">
                  <WifiOff className="h-3 w-3" />
                  <span>OFFLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Wifi className="h-3 w-3" />
                  <span>ONLINE</span>
                </div>
              )}
            </div>
          </div>

          {/* Scanner view-finder layout */}
          <div className="flex-1 bg-slate-950 flex flex-col p-4 justify-between relative">
            
            {/* Custom overlay text for offline caching */}
            {isOffline && (
              <div className="bg-rose-950/80 text-rose-300 border border-rose-900/40 p-1.5 text-[10px] text-center font-semibold rounded-lg z-10 font-mono tracking-tight animate-pulse mb-2">
                Standalone SQLite Mode: {ticketCache.length} tickets cached
              </div>
            )}

            {/* Viewfinder simulation box */}
            <div className={`relative flex-1 rounded-2xl overflow-hidden flex flex-col items-center justify-center border transition-all ${
              scanResult.status === 'SUCCESS' 
                ? 'bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : scanResult.status === 'ERROR'
                ? 'bg-rose-950/20 border-rose-500/80 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                : 'bg-slate-900/30 border-slate-800'
            }`}>
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-600 rounded-tl-sm"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-600 rounded-tr-sm"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-600 rounded-bl-sm"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-600 rounded-br-sm"></div>

              {/* Scanning Active indicator line */}
              {scanResult.status === 'IDLE' && (
                <div className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-bounce w-5/6 mx-auto top-1/4 z-10"></div>
              )}

              {/* View finder logo icons */}
              <div className="z-1 text-center p-3">
                {scanResult.status === 'SUCCESS' ? (
                  <div className="text-emerald-400 animate-scale-up">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-full inline-block mb-2">
                      <Check className="h-6 w-6 stroke-[3px]" />
                    </div>
                    <span className="text-xs font-bold font-sans tracking-wide block uppercase">Ticket valid</span>
                    <span className="text-[10px] text-emerald-300/80 font-semibold font-mono block tracking-tight mt-1">{scanResult.studentName}</span>
                  </div>
                ) : scanResult.status === 'ERROR' ? (
                  <div className="text-rose-400 animate-scale-up">
                    <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-full inline-block mb-2">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold font-sans tracking-wide block uppercase">Access Rejected</span>
                    <span className="text-[10px] text-rose-300/80 font-mono block tracking-tight mt-1">{scanResult.title}</span>
                  </div>
                ) : (
                  <div className="text-slate-600 flex flex-col items-center">
                    <Camera className="h-8 w-8 mb-2 animate-pulse text-slate-500" />
                    <span className="text-[10px] font-sans font-medium tracking-wide">SCANNER ACTIVE</span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">Select simulated scenario on right</span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual scan logs ticker inside phone */}
            <div className="mt-3 bg-slate-900 border border-slate-850 p-3 rounded-xl min-h-[140px] flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-semibold tracking-wider block uppercase font-mono">Simulated Terminal Response:</span>
                <span className={`text-[12px] font-bold block mt-1 tracking-wide ${
                  scanResult.status === 'SUCCESS' ? 'text-emerald-400' : scanResult.status === 'ERROR' ? 'text-rose-400' : 'text-slate-200'
                }`}>{scanResult.title}</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">{scanResult.message}</p>
                {scanResult.details && (
                  <span className="text-[9px] text-slate-500 font-mono block mt-1.5 leading-normal border-t border-slate-800/60 pt-1.5">{scanResult.details}</span>
                )}
              </div>

              {scanResult.status !== 'IDLE' && (
                <button
                  id="phone-reset-viewfinder"
                  onClick={() => setScanResult({ status: 'IDLE', title: 'Awaiting Scan', message: 'Point camera viewfinder to ticket QR pass.' })}
                  className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-750/50 rounded-lg text-[10px] font-semibold mt-2 cursor-pointer"
                >
                  Clear scan view finder
                </button>
              )}
            </div>
          </div>

          {/* Bottom gesture pill bar */}
          <div className="py-2.5 bg-slate-950 flex items-center justify-center">
            <div className="w-24 h-1 bg-slate-850 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Col 2: Simulator dashboard guides */}
      <div id="scanner-controls-panel" className="flex flex-col gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <h2 className="text-md font-bold text-slate-100 flex items-center gap-1.5">
            <Smartphone className="h-5 w-5 text-blue-400" />
            Active Event Config
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure entry checks and choose a target event for checkout scans.</p>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="evt-select" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Event Gate</label>
              <select
                id="evt-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 focus:border-blue-500 rounded-lg text-xs font-semibold text-slate-200"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name} (Entrance Fee: GHS {e.fees.toFixed(2)})</option>
                ))}
              </select>
            </div>

            {/* Cache Mode Toggle */}
            <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Poor Internet Offline Mode</span>
                <span className="text-[10px] text-slate-500 font-normal block leading-tight mt-0.5">Scrapes SQL and verifies cryptographically local.</span>
              </div>
              
              <button
                id="offline-engine-toggle"
                onClick={handleToggleOffline}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOffline ? 'bg-amber-600' : 'bg-slate-805'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isOffline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isSyncing && (
              <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/30 text-cyan-400 rounded-xl flex items-center gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Re-syncing offline validation entries...</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Scan Trigger Options */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-md">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest border-b border-slate-850 pb-2 mb-3">Simulate Quick Scans</h3>
          
          <div className="flex flex-col gap-2.5">
            {/* Demo valid Paid Student Trigger */}
            <div className="space-y-1.5 p-2 bg-slate-900/30 border border-slate-850 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold block uppercase px-1">Validate Cleared Student:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="scan-demo-kofi"
                  onClick={() => handleSimulateScan('VALID', 'STU-300-002')}
                  className="p-2 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 border border-slate-800/50 rounded-lg text-left text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-200 block">Kofi Mensah</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Paid (STU-300-002)</span>
                </button>
                <button
                  id="scan-demo-ama"
                  onClick={() => handleSimulateScan('VALID', 'STU-400-001')}
                  className="p-2 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 border border-slate-800/50 rounded-lg text-left text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-200 block">Ama Serwaa</span>
                  <span className="text-[9px] text-amber-400 font-mono">Part-Paid (STU-400-001)</span>
                </button>
              </div>
            </div>

            {/* Unpaid Overdue student trigger scan */}
            <button
              id="scan-demo-evelyn"
              onClick={() => handleSimulateScan('VALID', 'STU-200-003')}
              className="w-full flex justify-between items-center p-3 bg-slate-900/40 hover:bg-slate-850 border border-slate-850 rounded-xl text-left cursor-pointer transition-all"
            >
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Evelyn Boateng <span className="text-rose-400 text-[10px] font-bold font-mono">(OVERDUE)</span></span>
                <span className="text-[10px] text-slate-500 font-normal">Index: STU-200-003 • Level 200</span>
              </div>
              <span className="text-[10px] text-blue-400 font-medium hover:text-blue-300 flex items-center gap-0.5">
                Scan Pass
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            {/* Revoked Ticket trigger scan */}
            <button
              id="scan-demo-revoked"
              onClick={() => handleSimulateScan('REVOKED')}
              className="w-full flex justify-between items-center p-3 bg-slate-900/40 hover:bg-slate-850 border border-slate-850 rounded-xl text-left cursor-pointer transition-all"
            >
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Revoked Event Ticket</span>
                <span className="text-[10px] text-slate-500 font-normal">Refunded payment ledger pass</span>
              </div>
              <span className="text-[10px] text-blue-400 font-medium hover:text-blue-300 flex items-center gap-0.5">
                Scan Pass
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>

            {/* Spoofed Hack ticket trigger scan */}
            <button
              id="scan-demo-spoofed"
              onClick={() => handleSimulateScan('SPOOF')}
              className="w-full flex justify-between items-center p-3 bg-slate-900/40 hover:bg-slate-850 border border-slate-850 rounded-xl text-left cursor-pointer transition-all border-l-2 border-l-rose-500/20"
            >
              <div>
                <span className="text-xs font-bold text-rose-300 block">Counterfeit QR QR Code Pass</span>
                <span className="text-[10px] text-slate-500 font-normal">Simulated spoofed public keys (HS256 Failure)</span>
              </div>
              <span className="text-[10px] text-rose-400 font-medium flex items-center gap-0.5">
                Threat Test
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
