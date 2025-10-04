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

