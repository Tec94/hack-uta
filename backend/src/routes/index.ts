import { Router } from 'express';
import mainRoutes from './main';
import healthRoutes from './health';
import databaseRoutes from './database';
import plaidRoutes from './plaid';
import geminiRoutes from './gemini';

const router = Router();

// Mount all route modules
router.use('/', mainRoutes);
router.use('/', healthRoutes);
router.use('/', databaseRoutes);
router.use('/api/plaid', plaidRoutes);
router.use('/', geminiRoutes);

export default router;
