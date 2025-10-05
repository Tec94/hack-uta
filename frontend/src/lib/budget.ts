/**
 * Budget API Integration
 * Handles user budget data persistence
 */

import axios from 'axios';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface BudgetData {
  id: number;
  created_at: string;
  user_id: string;
  income: number;
  budget: Record<string, number>;
}

export interface CreateBudgetRequest {
  user_id: string;
  income: number;
  budget: Record<string, number>;
}

/**
 * Create or update budget
 */
export async function saveBudget(data: CreateBudgetRequest): Promise<BudgetData> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/budget`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error saving budget:', error);
    const errorMsg = error.response?.data?.error || 'Failed to save budget';
    throw new Error(errorMsg);
  }
}

/**
 * Get budget by user ID
 */
export async function getBudget(userId: string): Promise<BudgetData | null> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/budget/${userId}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Budget not found is not an error
      return null;
    }
    console.error('Error getting budget:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get budget';
    throw new Error(errorMsg);
  }
}

/**
 * Update budget
 */
export async function updateBudget(userId: string, income: number, budget: Record<string, number>): Promise<BudgetData> {
  try {
    const response = await axios.put(`${BACKEND_URL}/api/budget/${userId}`, {
      income,
      budget
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating budget:', error);
    const errorMsg = error.response?.data?.error || 'Failed to update budget';
    throw new Error(errorMsg);
  }
}

/**
 * Delete budget
 */
export async function deleteBudget(userId: string): Promise<boolean> {
  try {
    await axios.delete(`${BACKEND_URL}/api/budget/${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    const errorMsg = error.response?.data?.error || 'Failed to delete budget';
    throw new Error(errorMsg);
  }
}

