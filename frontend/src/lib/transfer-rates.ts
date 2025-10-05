/**
 * Transfer Rates API Integration
 * Handles credit card points transfer rates data
 */

import axios from 'axios';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface TransferRate {
  id: number;
  created_at: string;
  card_issuer: string;
  from_program: string;
  to_program: string;
  transfer_ratio: string;
  transfer_time: string;
  notes: string | null;
}

/**
 * Get all transfer rates
 */
export async function getAllTransferRates(): Promise<TransferRate[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/transfer-rates`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting transfer rates:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get transfer rates';
    throw new Error(errorMsg);
  }
}

/**
 * Get transfer rate by ID
 */
export async function getTransferRateById(id: number): Promise<TransferRate> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/transfer-rates/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting transfer rate by ID:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get transfer rate';
    throw new Error(errorMsg);
  }
}

/**
 * Get transfer rates by issuer
 */
export async function getTransferRatesByIssuer(issuer: string): Promise<TransferRate[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/transfer-rates/issuer/${issuer}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting transfer rates by issuer:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get transfer rates by issuer';
    throw new Error(errorMsg);
  }
}

/**
 * Get transfer rates by program
 */
export async function getTransferRatesByProgram(program: string): Promise<TransferRate[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/transfer-rates/program/${program}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting transfer rates by program:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get transfer rates by program';
    throw new Error(errorMsg);
  }
}

/**
 * Search transfer rates with filters
 */
export async function searchTransferRates(issuer?: string, program?: string): Promise<TransferRate[]> {
  try {
    const params = new URLSearchParams();
    if (issuer) params.append('issuer', issuer);
    if (program) params.append('program', program);
    
    const response = await axios.get(`${BACKEND_URL}/api/transfer-rates/search?${params.toString()}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error searching transfer rates:', error);
    const errorMsg = error.response?.data?.error || 'Failed to search transfer rates';
    throw new Error(errorMsg);
  }
}
