import { CreditCard, Merchant, ApiCreditCard } from '@/types';

/**
 * AI-powered recommendation for location-based card suggestions using API cards
 */
export async function recommendCardsForLocation(
  merchant: Merchant,
  allApiCards: ApiCreditCard[],
  userCards: string[]
): Promise<{ cards: ApiCreditCard[], aiPowered: boolean, reason?: string }> {
  try {
    const response = await fetch('http://localhost:3000/api/insights/location-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant: {
          name: merchant.name,
          category: merchant.category,
          estimatedSpend: merchant.estimatedSpend || 30
        },
        availableCards: allApiCards,
        userCards: userCards,
        limit: 3
      }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.data.recommendedCardIds) {
      // Map card IDs back to card objects
      const recommendedCards = data.data.recommendedCardIds
        .map((id: string) => allApiCards.find(c => c.id === id))
        .filter((card: ApiCreditCard | undefined): card is ApiCreditCard => card !== undefined);
      
      return {
        cards: recommendedCards,
        aiPowered: data.data.aiPowered !== false,
        reason: data.data.reason
      };
    }
  } catch (error) {
    console.error('Error fetching AI location recommendations:', error);
  }

  // Fallback to algorithm-based recommendations
  return {
    cards: recommendCardsForLocationFallback(merchant, allApiCards, userCards),
    aiPowered: false
  };
}

/**
 * Fallback algorithm for location-based recommendations using API cards
 */
function recommendCardsForLocationFallback(
  merchant: Merchant,
  allApiCards: ApiCreditCard[],
  userCards: string[]
): ApiCreditCard[] {
  const category = merchant.category.toLowerCase();
  
  // Score each card based on reward rates for the merchant category
  const scoredCards = allApiCards.map(card => {
    let score = 0;
    const rewards = card.reward_summary;
    
    // Check reward rates for matching categories
    Object.entries(rewards).forEach(([rewardCat, rate]) => {
      const rCat = rewardCat.toLowerCase();
      
      // Direct category match
      if (rCat === category) {
        score += rate * 100;
      }
      // Fuzzy category matching
      else if (
        (category === 'dining' && (rCat.includes('dining') || rCat.includes('restaurant'))) ||
        (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
        (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel') || rCat.includes('transportation'))) ||
        (category === 'travel' && (rCat.includes('travel') || rCat.includes('hotel') || rCat.includes('flight'))) ||
        (category === 'shopping' && (rCat.includes('shopping') || rCat.includes('retail'))) ||
        (category === 'entertainment' && rCat.includes('entertainment')) ||
        (category === 'personal_care' && (rCat.includes('salon') || rCat.includes('spa') || rCat.includes('beauty'))) ||
        (category === 'auto_services' && (rCat.includes('auto') || rCat.includes('car'))) ||
        (category === 'healthcare' && (rCat.includes('health') || rCat.includes('medical') || rCat.includes('pharmacy')))
      ) {
        score += rate * 80;
      }
      // General category bonus
      else if (rate >= 0.02) {
        score += rate * 10;
      }
    });
    
    // Bonus for user's cards (they already trust these)
    if (userCards.includes(card.id)) {
      score += 5;
    }
    
    return { card, score };
  });
  
  // Sort by score and return top 3
  return scoredCards
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.card);
}

/**
 * Calculate potential earnings for API cards
 */
export function calculatePotentialEarningsApi(
  merchant: Merchant,
  card: ApiCreditCard
): string {
  const category = merchant.category.toLowerCase();
  const estimatedSpend = merchant.estimatedSpend || 30;
  const rewards = card.reward_summary;
  
  // Find matching reward category
  let bestRate = 0.01; // Default 1%
  
  Object.entries(rewards).forEach(([rewardCat, rate]) => {
    const rCat = rewardCat.toLowerCase();
    if (
      rCat === category ||
      (category === 'dining' && (rCat.includes('dining') || rCat.includes('restaurant'))) ||
      (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
      (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel') || rCat.includes('transportation'))) ||
      (category === 'travel' && (rCat.includes('travel') || rCat.includes('hotel'))) ||
      (category === 'shopping' && (rCat.includes('shopping') || rCat.includes('retail'))) ||
      (category === 'entertainment' && rCat.includes('entertainment'))
    ) {
      if (rate > bestRate) {
        bestRate = rate;
      }
    }
  });
  
  const earnings = (estimatedSpend * bestRate).toFixed(2);
  return `$${earnings} cash back (${(bestRate * 100).toFixed(1)}%)`;
}

/**
 * Get recommendation reason for API cards
 */
export function getRecommendationReasonApi(
  merchant: Merchant,
  card: ApiCreditCard
): string {
  const category = merchant.category.toLowerCase();
  const rewards = card.reward_summary;
  
  // Find best matching reward
  let bestRate = 0;
  let bestCategory = '';
  
  Object.entries(rewards).forEach(([rewardCat, rate]) => {
    const rCat = rewardCat.toLowerCase();
    if (
      rCat === category ||
      (category === 'dining' && (rCat.includes('dining') || rCat.includes('restaurant'))) ||
      (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
      (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel'))) ||
      (category === 'travel' && rCat.includes('travel')) ||
      (category === 'shopping' && rCat.includes('shopping'))
    ) {
      if (rate > bestRate) {
        bestRate = rate;
        bestCategory = rewardCat;
      }
    }
  });
  
  if (bestRate > 0) {
    return `Earn ${(bestRate * 100).toFixed(1)}% back on ${bestCategory.replace(/_/g, ' ')}`;
  }
  
  return `Good rewards for ${category}`;
}

/**
 * Recommends the best credit cards for a specific merchant based on category (LEGACY)
 */
export function recommendCardsForMerchant(
  merchant: Merchant,
  allCards: CreditCard[]
): CreditCard[] {
  const category = merchant.category.toLowerCase();
  
  // Score each card based on how well it matches the merchant's category
  const scoredCards = allCards.map(card => {
    let score = 0;
    const benefits = ((card.primaryBenefit || '') + ' ' + (card.secondaryBenefits || []).join(' ')).toLowerCase();
    const rewards = (card.rewardsStructure || []).map(r => 
      (r.category + ' ' + (r.description || '')).toLowerCase()
    ).join(' ');
    
    const searchText = benefits + ' ' + rewards;
    
    // Category-specific scoring
    switch (category) {
      case 'dining':
        if (searchText.includes('dining') || searchText.includes('restaurant')) score += 10;
        if (searchText.includes('food') || searchText.includes('delivery')) score += 5;
        break;
      
      case 'gas':
        if (searchText.includes('gas') || searchText.includes('fuel')) score += 10;
        if (searchText.includes('travel')) score += 3;
        break;
      
      case 'groceries':
        if (searchText.includes('grocer') || searchText.includes('supermarket')) score += 10;
        if (searchText.includes('food')) score += 3;
        break;
      
      case 'travel':
        if (searchText.includes('travel') || searchText.includes('flight') || searchText.includes('hotel')) score += 10;
        if (searchText.includes('lodging') || searchText.includes('airline')) score += 8;
        break;
      
      case 'shopping':
        if (searchText.includes('shopping') || searchText.includes('retail')) score += 10;
        if (searchText.includes('store') || searchText.includes('purchase')) score += 5;
        break;
      
      case 'entertainment':
        if (searchText.includes('entertainment') || searchText.includes('streaming')) score += 10;
        if (searchText.includes('movie') || searchText.includes('concert')) score += 5;
        break;
      
      case 'personal_care':
        if (searchText.includes('salon') || searchText.includes('spa') || searchText.includes('beauty')) score += 10;
        if (searchText.includes('wellness') || searchText.includes('personal')) score += 5;
        break;
      
      case 'auto_services':
        if (searchText.includes('auto') || searchText.includes('car')) score += 10;
        if (searchText.includes('repair') || searchText.includes('maintenance')) score += 5;
        break;
      
      case 'healthcare':
        if (searchText.includes('health') || searchText.includes('medical') || searchText.includes('pharmacy')) score += 10;
        if (searchText.includes('doctor') || searchText.includes('hospital')) score += 5;
        break;
    }
    
    // Bonus for no annual fee
    if (card.annualFee === 0) score += 2;
    
    // Extract multiplier from rewards structure
    const categoryReward = (card.rewardsStructure || []).find(r => {
      const rCat = r.category.toLowerCase();
      return rCat.includes(category) || 
             (category === 'dining' && (rCat.includes('restaurant') || rCat.includes('dining'))) ||
             (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
             (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel'))) ||
             (category === 'personal_care' && (rCat.includes('salon') || rCat.includes('spa') || rCat.includes('beauty'))) ||
             (category === 'auto_services' && (rCat.includes('auto') || rCat.includes('car'))) ||
             (category === 'healthcare' && (rCat.includes('health') || rCat.includes('medical') || rCat.includes('pharmacy')));
    });
    
    if (categoryReward) {
      // Extract multiplier (e.g., "3x" -> 3, "5%" -> 5)
      const match = categoryReward.rate.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const multiplier = parseFloat(match[1]);
        score += multiplier * 2;
      }
    }
    
    return { card, score };
  });
  
  // Sort by score and return top 3
  return scoredCards
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.card);
}

/**
 * Calculate potential earnings for a merchant visit
 */
export function calculatePotentialEarnings(
  merchant: Merchant,
  card: CreditCard
): string {
  const category = merchant.category.toLowerCase();
  const estimatedSpend = merchant.estimatedSpend || 30;
  
  // Find matching reward category
  const categoryReward = (card.rewardsStructure || []).find(r => {
    const rCat = r.category.toLowerCase();
    return rCat.includes(category) || 
           (category === 'dining' && (rCat.includes('restaurant') || rCat.includes('dining'))) ||
           (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
           (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel'))) ||
           (category === 'personal_care' && (rCat.includes('salon') || rCat.includes('spa') || rCat.includes('beauty'))) ||
           (category === 'auto_services' && (rCat.includes('auto') || rCat.includes('car'))) ||
           (category === 'healthcare' && (rCat.includes('health') || rCat.includes('medical') || rCat.includes('pharmacy')));
  });
  
  let multiplier = 1;
  if (categoryReward) {
    const match = categoryReward.rate.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      multiplier = parseFloat(match[1]);
    }
  }
  
  const earnings = (estimatedSpend * multiplier / 100).toFixed(2);
  
  if (categoryReward?.rate.includes('x')) {
    return `${(estimatedSpend * multiplier).toFixed(0)} points`;
  } else {
    return `$${earnings} cash back`;
  }
}

/**
 * Get a descriptive reason why a card is good for a merchant
 */
export function getRecommendationReason(
  merchant: Merchant,
  card: CreditCard
): string {
  const category = merchant.category.toLowerCase();
  
  // Find matching reward category
  const categoryReward = (card.rewardsStructure || []).find(r => {
    const rCat = r.category.toLowerCase();
    return rCat.includes(category) || 
           (category === 'dining' && (rCat.includes('restaurant') || rCat.includes('dining'))) ||
           (category === 'groceries' && (rCat.includes('grocer') || rCat.includes('supermarket'))) ||
           (category === 'gas' && (rCat.includes('gas') || rCat.includes('fuel'))) ||
           (category === 'personal_care' && (rCat.includes('salon') || rCat.includes('spa') || rCat.includes('beauty'))) ||
           (category === 'auto_services' && (rCat.includes('auto') || rCat.includes('car'))) ||
           (category === 'healthcare' && (rCat.includes('health') || rCat.includes('medical') || rCat.includes('pharmacy')));
  });
  
  if (categoryReward) {
    return `Earn ${categoryReward.rate} on ${category}`;
  }
  
  // Fallback reasons
  const benefits = (card.primaryBenefit || '').toLowerCase();
  if (benefits.includes(category)) {
    return card.primaryBenefit || 'Great card for this category';
  }
  
  return `Great rewards on everyday spending`;
}

