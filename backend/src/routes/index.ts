import { Router } from 'express';
import mainRoutes from './main';
import healthRoutes from './health';
import databaseRoutes from './database';
import plaidRoutes from './plaid';
import placesRoutes from './places';
import geminiRoutes from './gemini';
import cardsRoutes from './cards';
import userCardsRoutes from './user-cards';
import insightsRoutes from './insights';
import transferRatesRoutes from './transfer-rates';
import budgetRoutes from './budget';

const router = Router();

// Mount all route modules
router.use('/', mainRoutes);
router.use('/', healthRoutes);
router.use('/', databaseRoutes);
router.use('/api/plaid', plaidRoutes);
router.use('/api/places', placesRoutes);
router.use('/api/cards', cardsRoutes);
router.use('/api/user-cards', userCardsRoutes);
router.use('/api/insights', insightsRoutes);
router.use('/api/transfer-rates', transferRatesRoutes);
router.use('/api/budget', budgetRoutes);
router.use('/', geminiRoutes);

export default router;
