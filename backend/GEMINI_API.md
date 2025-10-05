# Google Gemini AI API Integration

This backend now includes Google Gemini AI integration with test routes and configuration.

## Setup

1. **Get your Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Add your Gemini API key: `GEMINI_API_KEY=your_actual_api_key_here`

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Available Endpoints

### Health Check
- **GET** `/gemini-health`
  - Tests the Gemini AI connection
  - Returns connection status and a simple test response

### Status Check
- **GET** `/gemini/status`
  - Returns whether Gemini AI is properly initialized
  - Useful for checking if API key is configured

### Content Generation
- **POST** `/gemini/generate`
  - Generates content using Gemini AI
  - **Body:** `{ "prompt": "Your prompt here" }`
  - **Response:** Generated content and metadata

### Simple Test
- **GET** `/gemini/test`
  - Runs a simple test with a basic math question
  - Good for quick connection verification

## Example Usage

### Test the connection:
```bash
curl http://localhost:3000/gemini-health
```

### Generate content:
```bash
curl -X POST http://localhost:3000/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing in simple terms"}'
```

### Check status:
```bash
curl http://localhost:3000/gemini/status
```

## Configuration

The Gemini configuration is handled in `src/config/gemini.ts`:
- Uses the `gemini-pro` model by default
- Includes error handling and connection testing
- Provides singleton instance for consistent usage

## Error Handling

All endpoints include comprehensive error handling:
- Missing API key detection
- Connection failure handling
- Input validation
- Detailed error messages with timestamps

## Development Notes

- The Gemini AI client is initialized on server startup
- Connection is tested automatically when the server starts
- All responses include timestamps for debugging
- Console logging provides detailed information about connection status
