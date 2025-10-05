import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

/**
 * Get all transfer rates
 * GET /api/transfer-rates
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const transferRates = await database.getAllTransferRates();
    
    return res.json({
      success: true,
      data: transferRates,
      count: transferRates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting transfer rates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transfer rates',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get transfer rate by ID
 * GET /api/transfer-rates/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transferRateId = parseInt(req.params.id);
    
    if (isNaN(transferRateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transfer rate ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    const transferRate = await database.getTransferRateById(transferRateId);
    
    if (!transferRate) {
      return res.status(404).json({
        success: false,
        error: 'Transfer rate not found',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.json({
      success: true,
      data: transferRate,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting transfer rate by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transfer rate',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get transfer rates by issuer
 * GET /api/transfer-rates/issuer/:issuer
 */
router.get('/issuer/:issuer', async (req: Request, res: Response) => {
  try {
    const { issuer } = req.params;
    
    if (!issuer) {
      return res.status(400).json({
        success: false,
        error: 'Issuer parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const transferRates = await database.getTransferRatesByIssuer(issuer);
    
    return res.json({
      success: true,
      data: transferRates,
      count: transferRates.length,
      issuer: issuer,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting transfer rates by issuer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transfer rates by issuer',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get transfer rates by program
 * GET /api/transfer-rates/program/:program
 */
router.get('/program/:program', async (req: Request, res: Response) => {
  try {
    const { program } = req.params;
    
    if (!program) {
      return res.status(400).json({
        success: false,
        error: 'Program parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const transferRates = await database.getTransferRatesByProgram(program);
    
    return res.json({
      success: true,
      data: transferRates,
      count: transferRates.length,
      program: program,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting transfer rates by program:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transfer rates by program',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Search transfer rates with query parameters
 * GET /api/transfer-rates/search?issuer=&program=
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { issuer, program } = req.query;
    
    // Build dynamic query based on provided parameters
    let query = `
      SELECT id, created_at, card_issuer, from_program, to_program, 
             transfer_ratio, transfer_time, notes
      FROM transfer_rates
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (issuer) {
      query += ` AND card_issuer ILIKE $${paramIndex}`;
      params.push(`%${issuer}%`);
      paramIndex++;
    }

    if (program) {
      query += ` AND (from_program ILIKE $${paramIndex} OR to_program ILIKE $${paramIndex})`;
      params.push(`%${program}%`);
      paramIndex++;
    }

    query += ` ORDER BY card_issuer, from_program`;

    const result = await database.query(query, params);
    const transferRates = result.rows;
    
    return res.json({
      success: true,
      data: transferRates,
      count: transferRates.length,
      filters: {
        issuer: issuer || null,
        program: program || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error searching transfer rates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search transfer rates',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
