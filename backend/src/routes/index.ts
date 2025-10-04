import { Router } from 'express';
import mainRoutes from './main';
import healthRoutes from './health';
import databaseRoutes from './database';

const router = Router();

// Mount all route modules
router.use('/', mainRoutes);
router.use('/', healthRoutes);
router.use('/', databaseRoutes);

export default router;
