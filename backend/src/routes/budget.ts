import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

/**
 * Create or update budget
 * POST /api/budget
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, income, budget } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    if (income === undefined || income === null) {
      return res.status(400).json({ 
        success: false,
        error: 'income is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({ 
        success: false,
        error: 'budget object is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await database.updateBudget(user_id, income, budget);
    
    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating/updating budget:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create/update budget',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get budget by user ID
 * GET /api/budget/:user_id
 */
router.get('/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    const budget = await database.getBudgetByUserId(user_id);
    
    if (!budget) {
      return res.status(404).json({ 
        success: false,
        error: 'Budget not found for this user',
        has_budget: false,
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      data: budget,
      has_budget: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting budget:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get budget',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Update budget
 * PUT /api/budget/:user_id
 */
router.put('/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { income, budget } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    if (income === undefined || income === null) {
      return res.status(400).json({ 
        success: false,
        error: 'income is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({ 
        success: false,
        error: 'budget object is required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await database.updateBudget(user_id, income, budget);
    
    return res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating budget:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update budget',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Delete budget
 * DELETE /api/budget/:user_id
 */
router.delete('/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await database.deleteBudget(user_id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Budget not found for this user',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      message: 'Budget deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete budget',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

