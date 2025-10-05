import { CreditCard, Merchant } from '@/types';

/**
 * Recommends the best credit cards for a specific merchant based on category
 */
export function recommendCardsForMerchant(
  merchant: Merchant,
  allCards: CreditCard[]
): CreditCard[] {
  const category = merchant.category.toLowerCase();
  
  // Score each card based on how well it matches the merchant's category
  const scoredCards = allCards.map(card => {
    let score = 0;
    const benefits = (card.primaryBenefit + ' ' + card.secondaryBenefits.join(' ')).toLowerCase();
    const rewards = card.rewardsStructure.map(r => 
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
    const categoryReward = card.rewardsStructure.find(r => {
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
  const categoryReward = card.rewardsStructure.find(r => {
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
  const categoryReward = card.rewardsStructure.find(r => {
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
  const benefits = card.primaryBenefit.toLowerCase();
  if (benefits.includes(category)) {
    return card.primaryBenefit;
  }
  
  return `Great rewards on everyday spending`;
}

