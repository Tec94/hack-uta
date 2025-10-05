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
    const { budget, monthlyIncome, actualSpending } = req.body;

    // Validate input
    if (!budget || typeof budget !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Budget data is required',
        timestamp: new Date().toISOString()
      });
    }

    // Determine if we have actual spending data from transactions
    const hasActualSpending = actualSpending && typeof actualSpending === 'object' && 
                              Object.values(actualSpending).some((val: any) => val > 0);

    // Use actual spending if available, otherwise use budget
    const spendingData = hasActualSpending ? actualSpending : budget;
    const totalActualSpending = Object.values(spendingData).reduce((sum: number, val: any) => sum + val, 0);
    const totalBudget = Object.values(budget).reduce((sum: number, val: any) => sum + val, 0);
    const hasIncome = monthlyIncome && monthlyIncome > 0;

    // Calculate statistics based on actual spending or budget
    const spendingEntries = Object.entries(spendingData).sort((a: any, b: any) => b[1] - a[1]);
    const topCategories = spendingEntries.slice(0, 3).map((entry: any) => ({
      category: entry[0],
      amount: entry[1],
      percentage: ((entry[1] / totalActualSpending) * 100).toFixed(1)
    }));

    // Build budget breakdown for AI
    const budgetBreakdown = Object.entries(budget)
      .map((entry: any) => `${entry[0]}: $${entry[1]}`)
      .join('\n');

    // Build actual spending breakdown if available
    const actualSpendingBreakdown = hasActualSpending
      ? Object.entries(actualSpending)
          .map((entry: any) => `${entry[0]}: $${entry[1]}`)
          .join('\n')
      : '';

    // Calculate variance by category if we have actual spending
    const varianceBreakdown = hasActualSpending
      ? Object.entries(budget)
          .map((entry: any) => {
            const category = entry[0];
            const budgeted = entry[1];
            const spent = actualSpending[category] || 0;
            const variance = spent - budgeted;
            const variancePercent = budgeted > 0 ? ((variance / budgeted) * 100).toFixed(1) : '0.0';
            return `${category}: Budgeted $${budgeted} → Spent $${spent} (${variance >= 0 ? '+' : ''}${variancePercent}%)`;
          })
          .join('\n')
      : '';

    const incomeContext = hasIncome
      ? `Monthly Income: $${monthlyIncome}\nRemaining after ${hasActualSpending ? 'spending' : 'budget'}: $${monthlyIncome - totalActualSpending}\nSavings Rate: ${(((monthlyIncome - totalActualSpending) / monthlyIncome) * 100).toFixed(1)}%`
      : 'Income not provided';

    const prompt = `You are a personal finance advisor specializing in budget optimization. Analyze this user's ${hasActualSpending ? 'actual spending from bank transactions' : 'planned budget'} and provide actionable insights.

${hasActualSpending ? `
Planned Budget (Monthly):
${budgetBreakdown}
Total Budget: $${totalBudget}

Actual Spending (Current Month from Bank Transactions):
${actualSpendingBreakdown}
Total Actual Spending: $${totalActualSpending}

Budget vs. Actual Variance:
${varianceBreakdown}
Overall: ${totalActualSpending > totalBudget ? 'OVER' : 'UNDER'} budget by $${Math.abs(totalActualSpending - totalBudget).toFixed(2)} (${((Math.abs(totalActualSpending - totalBudget) / totalBudget) * 100).toFixed(1)}%)

${incomeContext}

NOTE: User has linked their bank account. Use their ACTUAL SPENDING from transactions to provide insights, not their planned budget. Focus on where they're overspending vs. budget.
` : `
Monthly Budget (Planned):
${budgetBreakdown}
Total Budget: $${totalBudget}
${incomeContext}
`}

Top Spending Categories (${hasActualSpending ? 'Actual' : 'Planned'}):
${topCategories.map((c: any) => `- ${c.category}: $${c.amount} (${c.percentage}%)`).join('\n')}

Task: Provide comprehensive, personalized budget insights and recommendations. Analyze spending patterns, financial health, and provide actionable advice. Format your response as JSON:
{
  "summary": "3-4 sentence detailed overview of their budget health, highlighting key patterns and overall financial position",
  "strengths": [
    "3-4 specific positive aspects of their budget/spending habits with supporting details",
    "Mention good financial practices they're already following"
  ],
  "improvements": [
    "4-5 specific, actionable suggestions for improvement",
    "Prioritize by potential impact (highest savings/benefit first)",
    "Include concrete strategies, not just generic advice"
  ],
  "categoryInsights": {
    "${topCategories[0]?.category || 'dining'}": "Detailed insight about their top spending category - analyze if spending is reasonable, compare to typical spending in this category, suggest specific optimization strategies",
    "${topCategories[1]?.category || 'groceries'}": "Detailed insight about their second category - provide context about typical spending and actionable tips",
    "${topCategories[2]?.category || 'gas'}": "Insight about their third category - identify patterns or potential savings"
  },
  "spendingPatterns": [
    "2-3 observations about overall spending behavior and patterns",
    "Note any concerning trends or positive habits"
  ],
  "savingsOpportunity": number (estimated realistic monthly savings potential in dollars based on analysis),
  "healthScore": number (0-100 score of budget health),
  "priorityActions": [
    "Top 2-3 immediate actions they should take this month to improve their financial situation"
  ],
  "longTermAdvice": "1-2 sentences about long-term financial strategy and goals they should consider"
}

${hasActualSpending ? 'IMPORTANT: Since this is ACTUAL SPENDING from bank transactions, focus on real behavior patterns, overspending areas, and practical ways to reduce spending in categories where they\'re over budget. Be specific about which categories need the most attention.' : 'Since this is a planned budget, focus on whether the allocations are realistic and balanced. Suggest adjustments if certain categories seem too high or low compared to typical spending.'}

Be encouraging but realistic. Provide actionable, specific advice with numbers and percentages where possible. Help them understand not just WHAT to change, but HOW and WHY.`;

    const result = await geminiConfig.generateContent(prompt);

    if (!result.success) {
      // Enhanced fallback insights
      const variance = hasActualSpending ? totalActualSpending - totalBudget : 0;
      const variancePercent = totalBudget > 0 ? Math.abs(variance / totalBudget * 100) : 0;
      
      const summaryText = hasActualSpending
        ? `Your actual spending is $${totalActualSpending} vs. budgeted $${totalBudget}, which is ${variance > 0 ? 'over' : 'under'} budget by $${Math.abs(variance).toFixed(2)} (${variancePercent.toFixed(1)}%). Your top spending category is ${topCategories[0]?.category} at ${topCategories[0]?.percentage}% of total spending. ${hasIncome ? `With a monthly income of $${monthlyIncome}, you're ${variance > 0 ? 'exceeding' : 'staying within'} your planned budget.` : ''}`
        : `Your monthly budget totals $${totalActualSpending}, with ${topCategories[0]?.category} as your largest category at ${topCategories[0]?.percentage}%. ${hasIncome ? `Based on your income of $${monthlyIncome}, this represents ${(totalActualSpending / monthlyIncome * 100).toFixed(1)}% of your monthly income.` : ''}`;

      const topThreeCategories = topCategories.slice(0, 3);
      const categoryInsightsObj: any = {};
      
      topThreeCategories.forEach((cat: any, index: number) => {
        if (hasActualSpending) {
          const budgeted = budget[cat.category] || 0;
          const catVariance = cat.amount - budgeted;
          categoryInsightsObj[cat.category] = catVariance > 0
            ? `Spending $${cat.amount} (${catVariance > 0 ? '+' : ''}${catVariance.toFixed(0)} over budget). Consider reducing by 10-15% to save ~$${Math.round(cat.amount * 0.125)}/month.`
            : `Spending $${cat.amount}, which is ${Math.abs(catVariance).toFixed(0)} under budget. Good control in this category.`;
        } else {
          categoryInsightsObj[cat.category] = `Allocated $${cat.amount}/month (${cat.percentage}% of budget). ${index === 0 ? 'Your largest expense category - review for optimization opportunities.' : 'Consider if this allocation matches your actual needs.'}`;
        }
      });

      return res.json({
        success: true,
        data: {
          summary: summaryText,
          strengths: [
            hasActualSpending ? 'Tracking actual spending with bank transaction data' : 'Structured budget plan across multiple categories',
            'Monitoring expenses across ' + Object.keys(budget).length + ' different spending categories',
            hasIncome && (totalActualSpending / monthlyIncome) < 0.8 ? 'Maintaining a healthy savings rate' : 'Clear visibility into spending patterns',
            topCategories.length >= 3 ? 'Diversified spending across multiple categories' : 'Focused spending approach'
          ],
          improvements: [
            hasActualSpending && variance > 0 
              ? `Reduce ${topCategories[0]?.category} spending by ${Math.round(variancePercent * 0.3)}% to get back on track (~$${Math.round(topCategories[0]?.amount * variancePercent * 0.003)} savings)`
              : `Review ${topCategories[0]?.category} expenses - your largest category with potential for 10-15% reduction`,
            hasIncome && (totalActualSpending / monthlyIncome) > 0.9 
              ? 'Increase your savings rate - aim to save at least 10-20% of income'
              : 'Set up automatic transfers to savings account on payday',
            'Track daily expenses for 30 days to identify hidden spending leaks',
            'Create separate budget line items for irregular expenses',
            hasActualSpending && variance > 0 ? 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings' : 'Review budget monthly and adjust based on actual spending patterns'
          ],
          categoryInsights: categoryInsightsObj,
          spendingPatterns: [
            `Top 3 categories (${topThreeCategories.map((c: any) => c.category).join(', ')}) account for ${topThreeCategories.reduce((sum: number, c: any) => sum + parseFloat(c.percentage), 0).toFixed(1)}% of ${hasActualSpending ? 'spending' : 'budget'}`,
            hasActualSpending && variance > 0 
              ? `Overspending detected - primarily in ${topCategories[0]?.category}. Focus on this category first for maximum impact`
              : hasActualSpending 
                ? 'Spending is well-controlled and aligned with budget'
                : 'Budget appears balanced across categories',
            hasIncome ? `Current spending represents ${(totalActualSpending / monthlyIncome * 100).toFixed(1)}% of monthly income` : 'Consider adding income information for more personalized insights'
          ],
          savingsOpportunity: Math.round(totalActualSpending * 0.15),
          healthScore: hasIncome ? Math.round(Math.min(95, Math.max(50, 100 - (totalActualSpending / monthlyIncome * 100)))) : 75,
          priorityActions: [
            hasActualSpending && variance > 0 
              ? `Immediately reduce ${topCategories[0]?.category} spending by $${Math.round(Math.abs(variance) * 0.5)} this month`
              : `Review ${topCategories[0]?.category} for potential 10% reduction (~$${Math.round(topCategories[0]?.amount * 0.1)} savings)`,
            'Set up spending alerts on your credit/debit cards',
            hasIncome && (totalActualSpending / monthlyIncome) > 0.85 ? 'Find one subscription or recurring expense to cancel' : 'Automate savings transfers on payday'
          ],
          longTermAdvice: hasIncome 
            ? `Build an emergency fund of $${Math.round(totalActualSpending * 3)} (3 months expenses). Then focus on increasing savings rate to 20% of income for long-term financial security.`
            : 'Focus on building an emergency fund equal to 3-6 months of expenses, then work toward debt reduction and investment goals.',
          aiPowered: false,
          usedActualSpending: hasActualSpending
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
        // Ensure healthScore is a rounded whole number
        if (insights.healthScore) {
          insights.healthScore = Math.round(insights.healthScore);
        }
        // Ensure savingsOpportunity is rounded
        if (insights.savingsOpportunity) {
          insights.savingsOpportunity = Math.round(insights.savingsOpportunity);
        }
        insights.aiPowered = true;
        insights.usedActualSpending = hasActualSpending;
      } else {
        // Fallback with enhanced structure
        insights = {
          summary: responseText.substring(0, 300),
          strengths: [
            'You have a structured budget',
            'You\'re tracking expenses across categories',
            hasActualSpending ? 'Using bank data for accurate tracking' : 'Planning ahead with budget'
          ],
          improvements: [
            'Review high spending categories for optimization',
            'Set specific savings goals',
            'Track expenses daily',
            'Consider the 50/30/20 budgeting rule'
          ],
          categoryInsights: topCategories.reduce((acc: any, cat: any) => {
            acc[cat.category] = `${cat.percentage}% of your ${hasActualSpending ? 'spending' : 'budget'} ($${cat.amount})`;
            return acc;
          }, {}),
          spendingPatterns: [
            `Focus on ${topCategories[0]?.category} - your largest expense category`,
            hasActualSpending ? 'Track actual spending vs budget' : 'Monitor how closely you follow this budget'
          ],
          priorityActions: [
            `Review ${topCategories[0]?.category} spending`,
            'Set up spending alerts'
          ],
          longTermAdvice: 'Build emergency fund and increase savings rate over time',
          savingsOpportunity: Math.round(totalActualSpending * 0.15),
          healthScore: 75,
          aiPowered: false,
          usedActualSpending: hasActualSpending
        };
      }
    } catch (parseError) {
      // Fallback with basic structure
      insights = {
        summary: `Your ${hasActualSpending ? 'spending' : 'budget'} totals $${totalActualSpending} monthly with focus on ${topCategories[0]?.category}.`,
        strengths: [
          'Clear spending tracking',
          'Organized budget categories',
          'Monitoring multiple expense types'
        ],
        improvements: [
          `Optimize ${topCategories[0]?.category} spending`,
          'Increase savings rate',
          'Review monthly expenses',
          'Set up automatic savings'
        ],
        categoryInsights: {
          [topCategories[0]?.category || 'general']: `Represents ${topCategories[0]?.percentage}% of ${hasActualSpending ? 'spending' : 'budget'}`,
          [topCategories[1]?.category || 'general']: `Second largest category at ${topCategories[1]?.percentage}%`
        },
        spendingPatterns: [
          `Top category is ${topCategories[0]?.category} at ${topCategories[0]?.percentage}%`,
          hasActualSpending ? 'Actual spending being tracked' : 'Budget plan in place'
        ],
        priorityActions: [
          `Focus on ${topCategories[0]?.category} category`,
          'Set monthly savings target'
        ],
        longTermAdvice: 'Build 3-6 months emergency fund, then focus on long-term savings and investments',
        savingsOpportunity: Math.round(totalActualSpending * 0.15),
        healthScore: 70,
        aiPowered: false,
        usedActualSpending: hasActualSpending
      };
    }

    return res.json({
      success: true,
      data: insights,
      metadata: {
        totalBudget,
        totalActualSpending,
        variance: hasActualSpending ? totalActualSpending - totalBudget : 0,
        topCategories: topCategories.map((c: any) => c.category),
        hasIncome,
        hasActualSpending,
        dataSource: hasActualSpending ? 'transactions' : 'budget'
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

/**
 * Generate AI-powered location-based card recommendations
 * POST /api/insights/location-cards
 */
router.post('/location-cards', async (req: Request, res: Response) => {
  try {
    const { merchant, availableCards, userCards, limit = 3 } = req.body;

    if (!merchant || !availableCards || !Array.isArray(availableCards)) {
      return res.status(400).json({
        success: false,
        error: 'Merchant and available cards data are required',
        timestamp: new Date().toISOString()
      });
    }

    const merchantName = merchant.name || 'this location';
    const merchantCategory = merchant.category || 'general';
    const estimatedSpend = merchant.estimatedSpend || 30;

    // Build card catalog with rewards info
    const cardCatalog = availableCards.slice(0, 30).map((card: any, idx: number) => {
      const topRewards = Object.entries(card.reward_summary)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map((entry: any) => `${entry[0]}: ${(entry[1] * 100).toFixed(1)}%`)
        .join(', ');
      
      return `${idx + 1}. ${card.card_name} by ${card.bank_name} (${card.network})
   Best rewards: ${topRewards}
   Card ID: ${card.id}`;
    });

    const userCardsInfo = userCards && userCards.length > 0
      ? `\nUser currently has ${userCards.length} card(s). Consider prioritizing these if they have good rewards for this category.`
      : '';

    const prompt = `You are a credit card rewards expert helping users maximize rewards at specific locations.

Location Details:
- Merchant: ${merchantName}
- Category: ${merchantCategory}
- Estimated Spend: $${estimatedSpend}
${userCardsInfo}

Available Credit Cards:
${cardCatalog.join('\n\n')}

Task: Recommend the TOP ${limit} credit cards that will give the BEST rewards for this specific merchant category (${merchantCategory}).

Consider:
1. Cards with highest reward rates for "${merchantCategory}" category
2. Network acceptance (Visa/Mastercard widely accepted, Amex sometimes limited)
3. Overall value for this purchase amount ($${estimatedSpend})
4. Category-specific strengths

Respond with ONLY a JSON object:
{
  "recommendedCardIds": ["card_id_1", "card_id_2", "card_id_3"],
  "reason": "1-2 sentence explanation why these cards are best for ${merchantCategory} at ${merchantName}"
}

Return exactly ${limit} card IDs from the list above, ordered by best to worst for this specific merchant.`;

    const result = await geminiConfig.generateContent(prompt);

    if (!result.success) {
      // Fallback: simple algorithm-based recommendation
      const scoredCards = availableCards.map((card: any) => {
        let score = 0;
        const rewards = card.reward_summary || {};
        
        Object.entries(rewards).forEach(([category, rate]: [string, any]) => {
          const cat = category.toLowerCase();
          if (
            cat === merchantCategory.toLowerCase() ||
            (merchantCategory.toLowerCase() === 'dining' && (cat.includes('dining') || cat.includes('restaurant'))) ||
            (merchantCategory.toLowerCase() === 'gas' && (cat.includes('gas') || cat.includes('fuel'))) ||
            (merchantCategory.toLowerCase() === 'groceries' && (cat.includes('grocer') || cat.includes('supermarket'))) ||
            (merchantCategory.toLowerCase() === 'travel' && (cat.includes('travel') || cat.includes('hotel')))
          ) {
            score += rate * 100;
          }
        });
        
        if (userCards && userCards.includes(card.id)) {
          score += 2;
        }
        
        return { id: card.id, score };
      });

      const topCards = scoredCards
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(c => c.id);

      return res.json({
        success: true,
        data: {
          recommendedCardIds: topCards,
          reason: `Selected based on reward rates for ${merchantCategory} category`,
          aiPowered: false
        },
        timestamp: new Date().toISOString()
      });
    }

    // Parse AI response
    try {
      const responseText = result.data.response;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        
        if (recommendations.recommendedCardIds && Array.isArray(recommendations.recommendedCardIds)) {
          return res.json({
            success: true,
            data: {
              recommendedCardIds: recommendations.recommendedCardIds.slice(0, limit),
              reason: recommendations.reason || `Best cards for ${merchantCategory}`,
              aiPowered: true
            },
            metadata: {
              merchant: merchantName,
              category: merchantCategory,
              estimatedSpend: estimatedSpend
            },
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Fallback if parsing fails
      throw new Error('Invalid AI response format');
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback: return top cards by algorithm
      const scoredCards = availableCards.map((card: any) => {
        let score = 0;
        const rewards = card.reward_summary || {};
        
        Object.entries(rewards).forEach(([category, rate]: [string, any]) => {
          const cat = category.toLowerCase();
          if (cat.includes(merchantCategory.toLowerCase())) {
            score += rate * 100;
          }
        });
        
        return { id: card.id, score };
      });

      const topCards = scoredCards
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(c => c.id);

      return res.json({
        success: true,
        data: {
          recommendedCardIds: topCards,
          reason: `Top cards for ${merchantCategory} spending`,
          aiPowered: false
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Error generating location-based recommendations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
