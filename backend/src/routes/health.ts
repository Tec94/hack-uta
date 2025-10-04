import { Router, Request, Response } from 'express';
import database from '../config/database';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Database health check route
router.get('/db-health', async (req: Request, res: Response) => {
  try {
    const isConnected = await database.testConnection();
    const poolStats = database.getPoolStats();
    
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      database: isConnected ? 'Connected' : 'Disconnected',
      pool: poolStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
