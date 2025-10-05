import { Router, Request, Response } from 'express';
import geminiConfig from '../config/gemini';

const router = Router();

// Test Gemini AI connection
router.get('/gemini-health', async (req: Request, res: Response) => {
  try {
    const result = await geminiConfig.testConnection();
    
    if (result.success) {
      res.status(200).json({
        status: 'healthy',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Gemini health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during Gemini health check',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Generate content using Gemini AI
router.post('/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt cannot be empty',
        timestamp: new Date().toISOString()
      });
    }

    const result = await geminiConfig.generateContent(prompt);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Gemini content generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during content generation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get Gemini AI status
router.get('/gemini/status', (req: Request, res: Response) => {
  try {
    const isInitialized = geminiConfig.isInitialized();
    
    res.status(200).json({
      initialized: isInitialized,
      message: isInitialized 
        ? 'Gemini AI is properly initialized and ready to use'
        : 'Gemini AI is not initialized. Please check your GEMINI_API_KEY environment variable.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during status check',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test route with a simple prompt
router.get('/gemini/test', async (req: Request, res: Response) => {
  try {
    const testPrompt = "What is 2+2? Please respond with just the number.";
    const result = await geminiConfig.generateContent(testPrompt);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Gemini AI test completed successfully',
        testPrompt: testPrompt,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
        testPrompt: testPrompt,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Gemini test',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
