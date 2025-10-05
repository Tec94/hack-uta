import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

/**
 * Get all cards from catalog
 * GET /api/cards
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const cards = await database.getAllCards();
    
    return res.json({
      success: true,
      data: cards,
      count: cards.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting all cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cards from catalog',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get card by ID
 * GET /api/cards/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.id);
    
    if (isNaN(cardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    const card = await database.getCardById(cardId);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      data: card,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting card by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve card',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get cards by category
 * GET /api/cards/category/:category
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const cards = await database.getCardsByCategory(category);
    
    return res.json({
      success: true,
      data: cards,
      count: cards.length,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting cards by category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cards by category',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get cards by bank name
 * GET /api/cards/bank/:bankName
 */
router.get('/bank/:bankName', async (req: Request, res: Response) => {
  try {
    const { bankName } = req.params;
    
    if (!bankName) {
      return res.status(400).json({
        success: false,
        error: 'Bank name parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const cards = await database.getCardsByBank(bankName);
    
    return res.json({
      success: true,
      data: cards,
      count: cards.length,
      bank_name: bankName,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting cards by bank:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve cards by bank',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Search cards with query parameters
 * GET /api/cards/search?category=&bank=&network=
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { category, bank, network } = req.query;
    
    // Build dynamic query based on provided parameters
    let query = `
      SELECT id, created_at, bank_name, card_name, network, category, reward_summary
      FROM card_catalog
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (bank) {
      query += ` AND bank_name ILIKE $${paramIndex}`;
      params.push(`%${bank}%`);
      paramIndex++;
    }

    if (network) {
      query += ` AND network = $${paramIndex}`;
      params.push(network);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await database.query(query, params);
    const cards = result.rows;
    
    return res.json({
      success: true,
      data: cards,
      count: cards.length,
      filters: {
        category: category || null,
        bank: bank || null,
        network: network || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error searching cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search cards',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
