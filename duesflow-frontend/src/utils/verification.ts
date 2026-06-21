/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from '../types';

/**
 * Generates a deterministic, unique, non-sequential Verification UUID
 * for a student based on their unique index number.
 */
export function getStudentVerificationId(indexNumber: string): string {
  if (!indexNumber) return 'DFC-00000000-0000';
  
  // Custom hash logic to generate a stable, obscure hex code
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < indexNumber.length; i++) {
    const char = indexNumber.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash1 |= 0; // Convert to 32bit integer
    
    hash2 = ((hash2 << 7) - hash2) + char ^ 0x5a554a;
    hash2 |= 0;
  }
  
  const p1 = Math.abs(hash1).toString(16).toUpperCase().padStart(8, '0');
  const p2 = Math.abs(hash2).toString(16).toUpperCase().padStart(4, '0');
  
  return `DFC-${p1.substring(0, 8)}-${p2.substring(0, 4)}`;
}

/**
 * Generates a mock JWT verification token for receipt checks
 */
export function generateReceiptToken(ref: string, indexNumber: string, amount: number): string {
  const payload = {
    iss: 'duesflow.edu.gh',
    ref,
    sub: indexNumber,
    amt: amount,
    iat: Math.floor(Date.now() / 1000)
  };
  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `verify/DFC-${ref.replace('PAYSTK-', '')}.JWT.${base64Payload.substring(0, 16)}`;
}
