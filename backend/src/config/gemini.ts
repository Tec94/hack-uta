import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiConfig {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initializeGemini();
  }

  private initializeGemini(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use the stable exp model - gemini-flash-lite-latest is currently available
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
      console.log('✅ Gemini AI initialized successfully with model: gemini-2.0-flash-exp');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
    }
  }

  public async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.genAI || !this.model) {
      return {
        success: false,
        message: 'Gemini AI not initialized. Please check your GEMINI_API_KEY environment variable.'
      };
    }

    try {
      const prompt = "Hello! Please respond with a simple greeting to confirm the connection is working.";
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: 'Gemini AI connection successful',
        data: {
          response: text,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Gemini AI test failed:', error);
      return {
        success: false,
        message: `Gemini AI test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async generateContent(prompt: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.genAI || !this.model) {
      return {
        success: false,
        message: 'Gemini AI not initialized. Please check your GEMINI_API_KEY environment variable.'
      };
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: 'Content generated successfully',
        data: {
          response: text,
          prompt: prompt,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Gemini AI content generation failed:', error);
      return {
        success: false,
        message: `Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public isInitialized(): boolean {
    return this.genAI !== null && this.model !== null;
  }
}

// Export singleton instance
const geminiConfig = new GeminiConfig();
export default geminiConfig;
