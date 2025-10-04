import { Router, Request, Response } from 'express';

const router = Router();

// Main welcome route
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Express TypeScript API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
