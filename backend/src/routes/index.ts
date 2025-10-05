import { Router } from 'express';
import mainRoutes from './main';
import healthRoutes from './health';
import databaseRoutes from './database';
import plaidRoutes from './plaid';
import geminiRoutes from './gemini';
import cardsRoutes from './cards';

const router = Router();

// Mount all route modules
router.use('/', mainRoutes);
router.use('/', healthRoutes);
router.use('/', databaseRoutes);
router.use('/api/plaid', plaidRoutes);
router.use('/api/cards', cardsRoutes);
router.use('/', geminiRoutes);

export default router;
