import { Router, Request, Response } from 'express';
import geminiConfig from '../config/gemini';

const router = Router();

/**
 * Generate AI insights for credit card recommendations
 * POST /api/insights/cards
 */
router.post('/cards', async (req: Request, res: Response) => {
  try {
    const { budget, userCards, totalCards } = req.body;

    // Validate input
    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Budget data is required',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate total spending and find top categories
    const budgetEntries = Object.entries(budget).sort((a: any, b: any) => b[1] - a[1]);
    const totalSpending = Object.values(budget).reduce((sum: number, val: any) => sum + val, 0);
    const topCategory = budgetEntries[0]?.[0] || 'general';
    const topSpending = budgetEntries[0]?.[1] || 0;
    const secondCategory = budgetEntries[1]?.[0] || '';
    const secondSpending = budgetEntries[1]?.[1] || 0;

    // Build context for Gemini
    const categoryBreakdown = budgetEntries
      .map((entry: any) => `${entry[0]}: $${entry[1]}`)
      .join(', ');

    const prompt = `You are a credit card rewards expert. Based on the following user spending data, provide personalized insights and recommendations.

User Spending Pattern:
- Total Monthly Spending: $${totalSpending}
- Top Category: ${topCategory} ($${topSpending}/month)
- Second Category: ${secondCategory} ($${secondSpending}/month)
- Full Breakdown: ${categoryBreakdown}
- User currently has ${userCards || 0} cards
- Total cards available: ${totalCards || 0}

Please provide:
1. A brief, friendly insight (2-3 sentences) about their spending pattern and how they can maximize rewards
2. Estimate their potential annual earnings if they optimize their card usage (be realistic based on typical 2-5% rewards)
3. A confidence score (0-100) for how well the recommended cards match their spending

Format your response as JSON with these exact fields:
{
  "insight": "string - 2-3 sentences about their spending and recommendations",
  "potentialEarnings": number - estimated annual earnings in dollars,
  "matchScore": number - confidence score 0-100,
  "topRecommendation": "string - brief advice on their top category"
}

Keep the insight conversational and encouraging. Focus on their top 2 spending categories.`;

    const result = await geminiConfig.generateContent(prompt);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate insights',
        details: result.message,
        timestamp: new Date().toISOString()
      });
    }

    // Parse Gemini response
    let insights;
    try {
      // Try to extract JSON from the response
      const responseText = result.data.response;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        insights = {
          insight: responseText.substring(0, 300),
          potentialEarnings: Math.round(totalSpending * 0.03 * 12),
          matchScore: 85,
          topRecommendation: `Focus on maximizing rewards in ${topCategory}`
        };
      }
    } catch (parseError) {
      // Fallback insights if parsing fails
      insights = {
        insight: `Based on your spending pattern with a focus on ${topCategory} ($${topSpending}/month), you have great opportunities to maximize rewards. Cards with strong ${topCategory} rewards could significantly boost your earnings.`,
        potentialEarnings: Math.round(totalSpending * 0.03 * 12),
        matchScore: 85,
        topRecommendation: `Look for cards offering 3-5% back on ${topCategory} purchases`
      };
    }

    return res.json({
      success: true,
      data: insights,
      metadata: {
        totalSpending,
        topCategory,
        userCards: userCards || 0,
        totalCards: totalCards || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating card insights:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Generate AI-powered card recommendations
 * POST /api/insights/recommend-cards
 */
router.post('/recommend-cards', async (req: Request, res: Response) => {
  try {
    const { budget, availableCards, userCards, limit = 5, actualSpending } = req.body;

    // Validate input
    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Budget data is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!availableCards || !Array.isArray(availableCards)) {
      return res.status(400).json({
        success: false,
        error: 'Available cards data is required',
        timestamp: new Date().toISOString()
      });
    }

    // Use actual spending if available, otherwise fall back to budget
    const spendingData = actualSpending || budget;
    const hasActualSpending = actualSpending && typeof actualSpending === 'object';

    // Calculate spending analysis
    const budgetEntries = Object.entries(budget).sort((a: any, b: any) => b[1] - a[1]);
    const spendingEntries = Object.entries(spendingData).sort((a: any, b: any) => b[1] - a[1]);
    const totalSpending = Object.values(spendingData).reduce((sum: number, val: any) => sum + val, 0);
    const totalBudget = Object.values(budget).reduce((sum: number, val: any) => sum + val, 0);
    const topCategories = spendingEntries.slice(0, 3).map((entry: any) => ({
      category: entry[0],
      amount: entry[1],
      percentage: ((entry[1] / totalSpending) * 100).toFixed(1)
    }));

    // Build card catalog for AI
    const cardCatalog = availableCards.map((card: any) => ({
      id: card.id,
      name: card.card_name,
      bank: card.bank_name,
      category: card.category,
      network: card.network,
      rewards: Object.entries(card.reward_summary)
        .map(([cat, rate]: [string, any]) => `${cat}: ${(rate * 100).toFixed(1)}%`)
        .join(', ')
    }));

    const prompt = `You are an expert credit card rewards optimizer. Analyze the user's spending and recommend the best credit cards.

${hasActualSpending ? 'User Actual Spending Pattern (from transaction history, last 30 days):' : 'User Planned Budget (Monthly):'}
${topCategories.map(c => `- ${c.category}: $${c.amount} (${c.percentage}%)`).join('\n')}
Total ${hasActualSpending ? 'Spending' : 'Budget'}: $${totalSpending}

${hasActualSpending ? `
Planned Budget vs Actual Spending:
${Object.entries(budget).map(([cat, budgetAmt]: [string, any]) => {
  const spent = spendingData[cat] || 0;
  const variance = spent - budgetAmt;
  const variancePercent = budgetAmt > 0 ? ((variance / budgetAmt) * 100).toFixed(1) : '0.0';
  return `- ${cat}: Budget $${budgetAmt} → Actual $${spent} (${variance >= 0 ? '+' : ''}${variancePercent}%)`;
}).join('\n')}

NOTE: User has linked their bank account. Use their ACTUAL SPENDING PATTERNS from transaction history to recommend cards, not their planned budget. This is more accurate for what they will actually use.
` : ''}

Available Credit Cards:
${cardCatalog.slice(0, 20).map((card: any, idx: number) => 
  `${idx + 1}. ${card.name} by ${card.bank} [${card.category}]
   Rewards: ${card.rewards}`
).join('\n\n')}

Task: Recommend the top ${limit} credit cards that best match this user's ${hasActualSpending ? 'ACTUAL spending behavior from their bank transactions' : 'planned budget'}. Consider:
1. ${hasActualSpending ? 'ACTUAL spending patterns from their transaction history (prioritize these over budget)' : 'Planned budget allocations'}
2. Reward rates that align with their top ${hasActualSpending ? 'spending' : 'budget'} categories
3. Overall value and versatility
4. Category-specific strengths
${hasActualSpending ? '5. Where they are overspending vs budget (these categories have the most optimization potential)' : ''}

Respond with ONLY a JSON array of card IDs in order of recommendation (best first):
["card_id_1", "card_id_2", "card_id_3", ...]

Return exactly ${limit} card IDs from the list above.`;

    const result = await geminiConfig.generateContent(prompt);

    if (!result.success) {
      // Fallback to simple algorithm
      const fallbackRecommendations = availableCards
        .slice(0, limit)
        .map((card: any) => card.id);
      
      return res.json({
        success: true,
        data: {
          recommendedCardIds: fallbackRecommendations,
          reasoning: 'Using fallback recommendations',
          aiPowered: false
        },
        timestamp: new Date().toISOString()
      });
    }

    // Parse AI response
    let recommendedCardIds: string[] = [];
    try {
      const responseText = result.data.response;
      // Try to extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
        recommendedCardIds = JSON.parse(jsonMatch[0]);
      } else {
        // Try to extract card IDs from text
        const idMatches = responseText.match(/["'](\d+)["']/g);
        if (idMatches) {
          recommendedCardIds = idMatches
            .map((match: string) => match.replace(/["']/g, ''))
            .slice(0, limit);
        }
      }

      // Validate IDs exist in available cards
      const validIds = recommendedCardIds.filter((id: string) => 
        availableCards.some((card: any) => card.id === id)
      );

      // If we don't have enough valid IDs, fill with fallback
      if (validIds.length < limit) {
        const usedIds = new Set(validIds);
        const fallbackIds = availableCards
          .filter((card: any) => !usedIds.has(card.id))
          .slice(0, limit - validIds.length)
          .map((card: any) => card.id);
        
        recommendedCardIds = [...validIds, ...fallbackIds];
      } else {
        recommendedCardIds = validIds.slice(0, limit);
      }

    } catch (parseError) {
      console.error('Error parsing AI recommendations:', parseError);
      // Fallback to simple algorithm
      recommendedCardIds = availableCards
        .slice(0, limit)
        .map((card: any) => card.id);
    }

    return res.json({
      success: true,
      data: {
        recommendedCardIds: recommendedCardIds,
        reasoning: hasActualSpending 
          ? 'AI-powered recommendations based on your actual transaction history' 
          : 'AI-powered recommendations based on your planned budget',
        aiPowered: true,
        usedActualSpending: hasActualSpending,
        metadata: {
          totalSpending,
          totalBudget,
          topCategories: topCategories.map((c: any) => c.category),
          analyzedCards: cardCatalog.length,
          dataSource: hasActualSpending ? 'transaction_history' : 'planned_budget'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating card recommendations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Generate AI-powered budget insights and recommendations
 * POST /api/insights/budget
 */
router.post('/budget', async (req: Request, res: Response) => {
  try {
    const { budget, monthlyIncome } = req.body;

    // Validate input
    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Budget data is required',
        timestamp: new Date().toISOString()
      });
    }

    // Calculate budget statistics
    const budgetEntries = Object.entries(budget).sort((a: any, b: any) => b[1] - a[1]);
    const totalSpending = Object.values(budget).reduce((sum: number, val: any) => sum + val, 0);
    const hasIncome = monthlyIncome && monthlyIncome > 0;
    
    const topCategories = budgetEntries.slice(0, 3).map((entry: any) => ({
      category: entry[0],
      amount: entry[1],
      percentage: ((entry[1] / totalSpending) * 100).toFixed(1)
    }));

    // Build detailed breakdown for AI
    const categoryBreakdown = budgetEntries
      .map((entry: any) => `${entry[0]}: $${entry[1]} (${((entry[1] / totalSpending) * 100).toFixed(1)}%)`)
      .join('\n');

    const incomeContext = hasIncome
      ? `Monthly Income: $${monthlyIncome}\nRemaining: $${monthlyIncome - totalSpending}\nSavings Rate: ${(((monthlyIncome - totalSpending) / monthlyIncome) * 100).toFixed(1)}%`
      : 'Income not provided';

    const prompt = `You are a personal finance advisor specializing in budget optimization. Analyze this user's budget and provide actionable insights.

Monthly Budget:
${categoryBreakdown}
Total Spending: $${totalSpending}
${incomeContext}

Top Spending Categories:
${topCategories.map((c: any) => `- ${c.category}: $${c.amount} (${c.percentage}%)`).join('\n')}

Task: Provide personalized budget insights and recommendations. Format your response as JSON:
{
  "summary": "2-3 sentence overview of their budget health",
  "strengths": ["2-3 positive aspects of their budget"],
  "improvements": ["2-3 specific actionable suggestions"],
  "categoryInsights": {
    "${topCategories[0]?.category || 'dining'}": "Specific insight about their top spending category",
    "${topCategories[1]?.category || 'groceries'}": "Specific insight about their second category"
  },
  "savingsOpportunity": number (estimated monthly savings potential in dollars),
  "healthScore": number (0-100 score of budget health)
}

Be encouraging but realistic. Focus on practical, achievable improvements. If they have good spending habits, acknowledge them.`;

    const result = await geminiConfig.generateContent(prompt);

    if (!result.success) {
      // Fallback insights
      return res.json({
        success: true,
        data: {
          summary: `Your monthly spending is $${totalSpending}, with ${topCategories[0]?.category} as your top category at ${topCategories[0]?.percentage}%.`,
          strengths: [
            'You have a clear view of your spending across categories',
            'You\'re tracking your expenses regularly'
          ],
          improvements: [
            `Consider reviewing your ${topCategories[0]?.category} spending for optimization opportunities`,
            'Set specific savings goals for each category'
          ],
          categoryInsights: {
            [topCategories[0]?.category || 'general']: `This is your highest spending area at $${topCategories[0]?.amount}.`,
            [topCategories[1]?.category || 'general']: `This accounts for ${topCategories[1]?.percentage}% of your budget.`
          },
          savingsOpportunity: Math.round(totalSpending * 0.15),
          healthScore: hasIncome ? Math.min(95, Math.max(50, 100 - (totalSpending / monthlyIncome * 100))) : 75,
          aiPowered: false
        },
        timestamp: new Date().toISOString()
      });
    }

    // Parse AI response
    let insights;
    try {
      const responseText = result.data.response;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
        insights.aiPowered = true;
      } else {
        // Fallback
        insights = {
          summary: responseText.substring(0, 200),
          strengths: ['You have a structured budget', 'You\'re tracking expenses'],
          improvements: ['Review high spending categories', 'Set savings goals'],
          categoryInsights: {},
          savingsOpportunity: Math.round(totalSpending * 0.15),
          healthScore: 75,
          aiPowered: false
        };
      }
    } catch (parseError) {
      // Fallback
      insights = {
        summary: `Your budget totals $${totalSpending} monthly with focus on ${topCategories[0]?.category}.`,
        strengths: ['Clear spending tracking', 'Organized budget categories'],
        improvements: [`Optimize ${topCategories[0]?.category} spending`, 'Increase savings rate'],
        categoryInsights: {
          [topCategories[0]?.category || 'general']: `Represents ${topCategories[0]?.percentage}% of spending`
        },
        savingsOpportunity: Math.round(totalSpending * 0.15),
        healthScore: 70,
        aiPowered: false
      };
    }

    return res.json({
      success: true,
      data: insights,
      metadata: {
        totalSpending,
        topCategories: topCategories.map((c: any) => c.category),
        hasIncome
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating budget insights:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
