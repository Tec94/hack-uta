# AI Chatbot Assistant

## Overview
An intelligent chatbot assistant powered by Google's Gemini API that helps users optimize their credit card rewards and make smart financial decisions.

## Features

### 🎯 Core Capabilities
- **Card Recommendations**: Personalized suggestions based on user's spending patterns
- **Rewards Optimization**: Tips to maximize credit card rewards
- **Budget Analysis**: Insights into spending habits and budget allocation
- **Conversational AI**: Natural language understanding with context awareness

### 🎨 UI/UX Features
- **Floating Button**: Accessible from any authenticated page
- **Animated Chat Window**: Smooth transitions and animations using Framer Motion
- **Gradient Design**: Modern gradient styling matching the app's theme
- **Real-time Responses**: Powered by Gemini API with fallback responses
- **Conversation History**: Maintains context across messages
- **Loading States**: Visual feedback during AI processing

### 🔧 Technical Details

#### Components
- `ChatbotAssistant.tsx`: Main component with chat UI and state management
- `gemini.ts`: API integration and fallback logic

#### Integration
- Appears only for authenticated users
- Positioned above bottom navigation (z-index: 50)
- Responsive design for mobile and desktop

#### API Integration
- Uses Gemini 2.5 Flash model for intelligent responses
- Includes user budget context in prompts
- Maintains last 5 messages for conversation context
- Graceful fallback when API is unavailable

## Usage

The chatbot can help with:
- "What card should I use for dining?"
- "How can I maximize my rewards?"
- "Analyze my spending budget"
- "Recommend cards for my lifestyle"
- "How do credit card rewards work?"

## Environment Variables
Requires `VITE_GEMINI_API_KEY` to be set in your environment.

## Styling
- Gradient: Blue (600) to Purple (600)
- Position: Fixed bottom-right
- Size: 380px width, 400px chat height
- Mobile responsive with max-width constraints
