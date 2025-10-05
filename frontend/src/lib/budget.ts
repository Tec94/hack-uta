const API_URL = 'http://localhost:3000/api/budget'

export interface BudgetData {
  user_id: string
  income: number
  budget: Record<string, number>
}

export interface BudgetResponse {
  success: boolean
  data?: {
    id: number
    user_id: string
    income: number
    budget: Record<string, number>
    created_at: string
    updated_at: string
  }
  has_budget?: boolean
  error?: string
  timestamp: string
}

/**
 * Save or update budget for a user
 */
export async function saveBudget(data: BudgetData): Promise<BudgetResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to save budget')
  }

  return result
}

/**
 * Get budget for a user
 */
export async function getBudget(userId: string): Promise<BudgetResponse['data'] | null> {
  const response = await fetch(`${API_URL}/${userId}`)

  const result = await response.json()

  if (!response.ok) {
    if (response.status === 404) {
      return null // Budget not found
    }
    throw new Error(result.error || 'Failed to get budget')
  }

  return result.data
}

/**
 * Update budget for a user
 */
export async function updateBudget(
  userId: string,
  income: number,
  budget: Record<string, number>
): Promise<BudgetResponse> {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ income, budget }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update budget')
  }

  return result
}

/**
 * Delete budget for a user
 */
export async function deleteBudget(userId: string): Promise<BudgetResponse> {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete budget')
  }

  return result
}

