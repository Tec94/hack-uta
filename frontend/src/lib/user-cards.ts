/**
 * User Cards API Integration
 * Handles user's personal card collection operations
 */

import axios from 'axios';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export interface UserCard {
  id: number;
  created_at: string;
  user_id: string;
  card_cat_id: string;
  is_active: boolean;
  bank_name: string;
  card_name: string;
  network: string;
  category: string;
  reward_summary: any;
}

export interface AddCardRequest {
  user_id: string;
  card_cat_id: number;
  is_active?: boolean;
}

/**
 * Add a card to user's collection
 */
export async function addUserCard(request: AddCardRequest): Promise<UserCard> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/user-cards`, request);
    return response.data.data;
  } catch (error: any) {
    console.error('Error adding user card:', error);
    const errorMsg = error.response?.data?.error || 'Failed to add card to collection';
    throw new Error(errorMsg);
  }
}

/**
 * Get all cards for a specific user
 */
export async function getUserCards(userId: string): Promise<UserCard[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user-cards/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting user cards:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get user cards';
    throw new Error(errorMsg);
  }
}

/**
 * Get a specific user card by ID
 */
export async function getUserCardById(userId: string, cardId: number): Promise<UserCard> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user-cards/${userId}/card/${cardId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting user card by ID:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get user card';
    throw new Error(errorMsg);
  }
}

/**
 * Update user card status (activate/deactivate)
 */
export async function updateUserCardStatus(
  userId: string, 
  cardId: number, 
  isActive: boolean
): Promise<UserCard> {
  try {
    const response = await axios.patch(`${BACKEND_URL}/api/user-cards/${userId}/card/${cardId}`, {
      is_active: isActive
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating user card status:', error);
    const errorMsg = error.response?.data?.error || 'Failed to update card status';
    throw new Error(errorMsg);
  }
}

/**
 * Delete a user card
 */
export async function deleteUserCard(userId: string, cardId: string): Promise<void> {
  try {
    await axios.delete(`${BACKEND_URL}/api/user-cards/${userId}/card/${cardId}`);
  } catch (error: any) {
    console.error('Error deleting user card:', error);
    const errorMsg = error.response?.data?.error || 'Failed to delete card';
    throw new Error(errorMsg);
  }
}

/**
 * Get user's active cards only
 */
export async function getUserActiveCards(userId: string): Promise<UserCard[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user-cards/${userId}/active`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting active user cards:', error);
    const errorMsg = error.response?.data?.error || 'Failed to get active cards';
    throw new Error(errorMsg);
  }
}

/**
 * Add multiple cards to user's collection
 */
export async function addMultipleUserCards(userId: string, cardCatIds: number[]): Promise<UserCard[]> {
  try {
    const promises = cardCatIds.map(cardCatId => 
      addUserCard({ user_id: userId, card_cat_id: cardCatId, is_active: true })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Filter successful results
    const successfulCards = results
      .filter((result): result is PromiseFulfilledResult<UserCard> => result.status === 'fulfilled')
      .map(result => result.value);
    
    // Log any failures
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);
    
    if (failures.length > 0) {
      console.warn('Some cards failed to add:', failures);
    }
    
    return successfulCards;
  } catch (error) {
    console.error('Error adding multiple user cards:', error);
    throw error;
  }
}
