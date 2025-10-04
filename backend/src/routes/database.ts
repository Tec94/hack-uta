import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

// Example database query route
router.get('/db-test', async (req: Request, res: Response) => {
  try {
    const result = await database.query('SELECT version() as version, current_database() as database_name');
    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
