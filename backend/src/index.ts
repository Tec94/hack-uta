import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import database from './config/database';
import routes from './routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database health: http://localhost:${PORT}/db-health`);
  console.log(`🧪 Database test: http://localhost:${PORT}/db-test`);
  console.log(`🤖 Gemini health: http://localhost:${PORT}/gemini-health`);
  console.log(`🧠 Gemini test: http://localhost:${PORT}/gemini/test`);
  console.log(`💳 Cards catalog: http://localhost:${PORT}/api/cards`);
  console.log(`👤 User cards: http://localhost:${PORT}/api/user-cards`);
  console.log(`🔄 Transfer rates: http://localhost:${PORT}/api/transfer-rates`);
  console.log(`✨ AI Insights: http://localhost:${PORT}/api/insights/cards`);
  console.log(`🎯 AI Recommendations: http://localhost:${PORT}/api/insights/recommend-cards`);
  console.log(`💰 AI Budget Insights: http://localhost:${PORT}/api/insights/budget`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/`);
  
  // Test database connection on startup
  try {
    await database.testConnection();
  } catch (error) {
    console.error('⚠️  Database connection failed on startup:', error);
  }
});

export default app;
