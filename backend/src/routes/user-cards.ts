import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

/**
 * Add a new card to user's collection
 * POST /api/user-cards
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, card_cat_id, is_active } = req.body;
    
    // Validate required fields
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!card_cat_id) {
      return res.status(400).json({
        success: false,
        error: 'card_cat_id is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate card_cat_id is a number
    const cardCatId = parseInt(card_cat_id);
    if (isNaN(cardCatId)) {
      return res.status(400).json({
        success: false,
        error: 'card_cat_id must be a valid number',
        timestamp: new Date().toISOString()
      });
    }

    // Check if the card catalog entry exists
    const catalogCard = await database.getCardById(cardCatId);
    if (!catalogCard) {
      return res.status(404).json({
        success: false,
        error: 'Card catalog entry not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already has this card
    const cardExists = await database.checkUserCardExists(user_id, cardCatId);
    if (cardExists) {
      return res.status(409).json({
        success: false,
        error: 'User already has this card',
        timestamp: new Date().toISOString()
      });
    }

    // Add the card to user's collection
    const isActive = is_active !== undefined ? Boolean(is_active) : true;
    const userCard = await database.addUserCard(user_id, cardCatId, isActive);
    
    return res.status(201).json({
      success: true,
      message: 'Card added successfully to user collection',
      data: userCard,
      card_info: catalogCard,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error adding user card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add card to user collection',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get all cards for a specific user
 * GET /api/user-cards/:user_id
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

    const userCards = await database.getUserCards(user_id);
    
    return res.json({
      success: true,
      data: userCards,
      count: userCards.length,
      user_id: user_id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting user cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user cards',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get a specific user card by ID
 * GET /api/user-cards/:user_id/card/:card_id
 */
router.get('/:user_id/card/:card_id', async (req: Request, res: Response) => {
  try {
    const { user_id, card_id } = req.params;
    
    if (!user_id || !card_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and card_id are required',
        timestamp: new Date().toISOString()
      });
    }

    const cardId = parseInt(card_id);
    if (isNaN(cardId)) {
      return res.status(400).json({
        success: false,
        error: 'card_id must be a valid number',
        timestamp: new Date().toISOString()
      });
    }

    const userCard = await database.getUserCardById(cardId, user_id);
    
    if (!userCard) {
      return res.status(404).json({
        success: false,
        error: 'User card not found',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      data: userCard,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting user card by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user card',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Update user card status (activate/deactivate)
 * PATCH /api/user-cards/:user_id/card/:card_id
 */
router.patch('/:user_id/card/:card_id', async (req: Request, res: Response) => {
  try {
    const { user_id, card_id } = req.params;
    const { is_active } = req.body;
    
    if (!user_id || !card_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and card_id are required',
        timestamp: new Date().toISOString()
      });
    }

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'is_active field is required',
        timestamp: new Date().toISOString()
      });
    }

    const cardId = parseInt(card_id);
    if (isNaN(cardId)) {
      return res.status(400).json({
        success: false,
        error: 'card_id must be a valid number',
        timestamp: new Date().toISOString()
      });
    }

    const isActive = Boolean(is_active);
    const updatedCard = await database.updateUserCardStatus(cardId, user_id, isActive);
    
    if (!updatedCard) {
      return res.status(404).json({
        success: false,
        error: 'User card not found',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      message: `Card ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCard,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating user card status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user card status',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Delete a user card
 * DELETE /api/user-cards/:user_id/card/:card_id
 */
router.delete('/:user_id/card/:card_id', async (req: Request, res: Response) => {
  try {
    const { user_id, card_id } = req.params;
    
    if (!user_id || !card_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and card_id are required',
        timestamp: new Date().toISOString()
      });
    }

    const cardId = parseInt(card_id);
    if (isNaN(cardId)) {
      return res.status(400).json({
        success: false,
        error: 'card_id must be a valid number',
        timestamp: new Date().toISOString()
      });
    }

    const deleted = await database.deleteUserCard(cardId, user_id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User card not found',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      message: 'Card removed successfully from user collection',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error deleting user card:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user card',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get user's active cards only
 * GET /api/user-cards/:user_id/active
 */
router.get('/:user_id/active', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
        timestamp: new Date().toISOString()
      });
    }

    const allUserCards = await database.getUserCards(user_id);
    const activeCards = allUserCards.filter(card => card.is_active);
    
    return res.json({
      success: true,
      data: activeCards,
      count: activeCards.length,
      user_id: user_id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting active user cards:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve active user cards',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
