import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreditCard, UserBudget, Merchant } from '@/types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getLocationBasedRecommendation(
  merchant: Merchant,
  userCards: CreditCard[],
  budget: UserBudget
): Promise<string> {
  if (!genAI) {
    return getFallbackLocationRecommendation(merchant, userCards);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a credit card rewards optimization expert. A user is currently at ${merchant.name}, which is a ${merchant.category} establishment.

User's current credit cards:
${userCards.map(card => `- ${card.name}: ${card.primaryBenefit}`).join('\n')}

User's monthly spending budgets:
- Dining: $${budget.dining}
- Gas: $${budget.gas}
- Groceries: $${budget.groceries}
- Travel: $${budget.travel}
- Shopping: $${budget.shopping}
- Entertainment: $${budget.entertainment}

The user is about to make a purchase of approximately $${merchant.estimatedSpend || 50}.

Which card should they use for maximum rewards? Provide a clear, concise recommendation (2-3 sentences) with the expected rewards value.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackLocationRecommendation(merchant, userCards);
  }
}

export async function getProfileBasedRecommendations(
  budget: UserBudget,
  currentCards: string[]
): Promise<string> {
  if (!genAI) {
    return getFallbackProfileRecommendation(budget);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a credit card rewards optimization expert. Analyze this user's spending profile and recommend the top 3 credit cards they should consider applying for.

Monthly spending budgets:
- Dining: $${budget.dining}
- Gas: $${budget.gas}
- Groceries: $${budget.groceries}
- Travel: $${budget.travel}
- Shopping: $${budget.shopping}
- Entertainment: $${budget.entertainment}

Current cards owned: ${currentCards.join(', ') || 'None'}

Provide 3 specific card recommendations with reasoning and expected annual value. Be concise and actionable.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackProfileRecommendation(budget);
  }
}

function getFallbackLocationRecommendation(merchant: Merchant, userCards: CreditCard[]): string {
  const categoryMap: Record<string, string> = {
    dining: 'dining',
    gas: 'gas',
    groceries: 'groceries',
    travel: 'travel',
    shopping: 'shopping',
    entertainment: 'entertainment',
  };

  const relevantCategory = categoryMap[merchant.category] || 'general';
  
  if (userCards.length === 0) {
    return `For purchases at ${merchant.name}, consider applying for a card with strong ${relevantCategory} rewards. You could earn 3-5% back on this $${merchant.estimatedSpend || 50} purchase.`;
  }

  const bestCard = userCards[0]; // Simplified - in production, would analyze rewards structure
  const estimatedRewards = ((merchant.estimatedSpend || 50) * 0.03).toFixed(2);

  return `For your purchase at ${merchant.name}, use your ${bestCard.name}. With ${bestCard.primaryBenefit}, you'll earn approximately $${estimatedRewards} in rewards on this transaction.`;
}

function getFallbackProfileRecommendation(budget: UserBudget): string {
  const topCategories = Object.entries(budget)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => `${category} ($${amount})`);

  return `Based on your spending profile with highest categories being ${topCategories.join(', ')}, consider cards with strong rewards in these areas. Look for cards offering 3-5% back in your top spending categories to maximize annual rewards value.`;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getChatbotResponse(
  userMessage: string,
  budget: UserBudget | null,
  conversationHistory: ChatMessage[]
): Promise<string> {
  if (!genAI) {
    return getFallbackChatbotResponse(userMessage, budget);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context from conversation history (last 5 messages)
    const recentHistory = conversationHistory.slice(-5);
    const historyContext = recentHistory
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const budgetContext = budget
      ? `
User's Monthly Budget:
- Dining: $${budget.dining}
- Gas: $${budget.gas}
- Groceries: $${budget.groceries}
- Travel: $${budget.travel}
- Shopping: $${budget.shopping}
- Entertainment: $${budget.entertainment}
Total: $${Object.values(budget).reduce((sum, val) => sum + val, 0)}
`
      : 'User has not set up a budget yet.';

    const prompt = `
You are a helpful and friendly credit card rewards optimization assistant. You help users maximize their credit card rewards, understand their spending patterns, and make smart financial decisions.

${budgetContext}

Recent conversation:
${historyContext}

User's current question: ${userMessage}

Provide a helpful, concise, and friendly response (2-4 sentences). If the user asks about card recommendations, consider their budget. If they ask about rewards optimization, provide actionable advice. Keep responses conversational and easy to understand.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackChatbotResponse(userMessage, budget);
  }
}

function getFallbackChatbotResponse(userMessage: string, budget: UserBudget | null): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('recommend') || lowerMessage.includes('card') || lowerMessage.includes('best')) {
    if (!budget) {
      return "I'd love to recommend cards for you! To give you the best recommendations, please set up your monthly budget first. This helps me understand your spending patterns.";
    }
    const topCategory = Object.entries(budget).sort((a, b) => b[1] - a[1])[0];
    return `Based on your spending, you spend the most on ${topCategory[0]} ($${topCategory[1]}/month). I recommend looking for cards with strong rewards in this category, typically offering 3-5% cash back or points.`;
  }

  if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
    if (!budget) {
      return "You haven't set up your budget yet. Setting up a budget helps me provide personalized card recommendations and track your rewards potential!";
    }
    const total = Object.values(budget).reduce((sum, val) => sum + val, 0);
    return `Your total monthly budget is $${total}. Your top spending categories are ${Object.entries(budget)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat} ($${amt})`)
      .join(', ')}. Would you like recommendations to maximize rewards in these areas?`;
  }

  if (lowerMessage.includes('reward') || lowerMessage.includes('points') || lowerMessage.includes('cash back')) {
    return "Credit card rewards typically range from 1-5% depending on the category. Focus on cards that match your highest spending categories for maximum value. Would you like specific recommendations?";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return "I can help you with card recommendations, rewards optimization, budget analysis, and spending insights. Just ask me anything about maximizing your credit card rewards!";
  }

  return "That's a great question! I'm here to help you optimize your credit card rewards. Feel free to ask me about card recommendations, rewards strategies, or your spending patterns.";
}

