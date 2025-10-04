import { CreditCard } from '@/types';

export const mockCreditCards: CreditCard[] = [
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    logoUrl: 'https://logo.clearbit.com/chase.com',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
    annualFee: 95,
    signupBonus: '60,000 points after spending $4,000 in 3 months',
    primaryBenefit: '3x points on dining and travel',
    secondaryBenefits: [
      '2x points on all other travel',
      '25% more value when redeemed through Chase',
      'No foreign transaction fees',
      'Trip cancellation/interruption insurance'
    ],
    rewardsStructure: [
      { category: 'Dining', rate: '3x', description: 'Worldwide restaurants' },
      { category: 'Travel', rate: '3x', description: 'Hotels, flights, rental cars' },
      { category: 'Online Groceries', rate: '3x', description: 'Excludes Target, Walmart' },
      { category: 'Everything Else', rate: '1x' }
    ],
    creditScoreRequired: 'Good to Excellent (690-850)',
    fullDescription: 'The Chase Sapphire Preferred is perfect for travelers and food lovers. Earn bonus points on dining and travel purchases, plus get valuable travel protections.',
    applicationUrl: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred'
  },
  {
    id: 'amex-gold',
    name: 'American Express Gold Card',
    issuer: 'American Express',
    logoUrl: 'https://logo.clearbit.com/americanexpress.com',
    imageUrl: 'https://images.unsplash.com/photo-1604174447415-d9f0efcb0f62?w=800&h=500&fit=crop',
    annualFee: 250,
    signupBonus: '60,000 points after $6,000 in spend',
    primaryBenefit: '4x points at restaurants and supermarkets',
    secondaryBenefits: [
      '$120 Uber Cash annually',
      '$120 dining credit annually',
      '3x points on flights',
      'No foreign transaction fees'
    ],
    rewardsStructure: [
      { category: 'Restaurants', rate: '4x', description: 'Worldwide, including takeout and delivery' },
      { category: 'Supermarkets', rate: '4x', description: 'Up to $25,000 per year in purchases' },
      { category: 'Flights', rate: '3x', description: 'Booked directly with airlines' },
      { category: 'Everything Else', rate: '1x' }
    ],
    creditScoreRequired: 'Good to Excellent (670-850)',
    fullDescription: 'The Amex Gold Card is ideal for foodies and frequent diners. Maximize rewards on everyday spending with generous dining and grocery bonuses, plus valuable credits.',
    applicationUrl: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/'
  },
  {
    id: 'citi-custom-cash',
    name: 'Citi Custom Cash',
    issuer: 'Citi',
    logoUrl: 'https://logo.clearbit.com/citi.com',
    imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&h=500&fit=crop',
    annualFee: 0,
    signupBonus: '$200 cash back after $750 in purchases',
    primaryBenefit: '5% cash back on top spending category',
    secondaryBenefits: [
      'Automatic category selection',
      'Up to $500 per billing cycle',
      'No annual fee',
      '1% cash back on all other purchases'
    ],
    rewardsStructure: [
      { category: 'Top Category', rate: '5%', description: 'Gas, groceries, restaurants, travel, drugstores, or home improvement' },
      { category: 'Everything Else', rate: '1%' }
    ],
    creditScoreRequired: 'Good to Excellent (690-850)',
    fullDescription: 'The Citi Custom Cash card automatically earns 5% cash back in your top spending category each billing cycle, making it perfect for flexible rewards without category tracking.',
    applicationUrl: 'https://www.citi.com/credit-cards/citi-custom-cash-credit-card'
  },
  {
    id: 'capital-one-savor',
    name: 'Capital One SavorOne',
    issuer: 'Capital One',
    logoUrl: 'https://logo.clearbit.com/capitalone.com',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
    annualFee: 0,
    signupBonus: '$200 bonus after $500 in purchases',
    primaryBenefit: '3% on dining and entertainment',
    secondaryBenefits: [
      '3% on streaming services',
      '3% on grocery stores',
      'No annual fee',
      'No foreign transaction fees'
    ],
    rewardsStructure: [
      { category: 'Dining', rate: '3%', description: 'Restaurants, bars, and food delivery' },
      { category: 'Entertainment', rate: '3%', description: 'Movies, concerts, sporting events' },
      { category: 'Groceries', rate: '3%', description: 'Excludes superstores' },
      { category: 'Streaming', rate: '3%', description: 'Popular streaming services' },
      { category: 'Everything Else', rate: '1%' }
    ],
    creditScoreRequired: 'Good to Excellent (670-850)',
    fullDescription: 'The SavorOne card offers excellent rewards for dining and entertainment without an annual fee, perfect for enjoying life\'s experiences while earning cash back.',
    applicationUrl: 'https://www.capitalone.com/credit-cards/savorone/'
  },
  {
    id: 'discover-it-cash-back',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    logoUrl: 'https://logo.clearbit.com/discover.com',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=500&fit=crop',
    annualFee: 0,
    signupBonus: 'Cash back match for all cash back earned first year',
    primaryBenefit: '5% rotating categories',
    secondaryBenefits: [
      'Cash back match first year',
      'No annual fee',
      'Free FICO score',
      '0% intro APR for 15 months'
    ],
    rewardsStructure: [
      { category: 'Rotating Categories', rate: '5%', description: 'Up to $1,500 each quarter when activated' },
      { category: 'Everything Else', rate: '1%', description: 'Unlimited cash back' }
    ],
    creditScoreRequired: 'Good to Excellent (670-850)',
    fullDescription: 'The Discover it Cash Back card offers rotating 5% categories and an incredible first-year cash back match, essentially doubling all rewards in your first year.',
    applicationUrl: 'https://www.discover.com/credit-cards/cash-back/it-card.html'
  },
  {
    id: 'wells-fargo-active-cash',
    name: 'Wells Fargo Active Cash',
    issuer: 'Wells Fargo',
    logoUrl: 'https://logo.clearbit.com/wellsfargo.com',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=500&fit=crop',
    annualFee: 0,
    signupBonus: '$200 cash rewards after $500 in purchases',
    primaryBenefit: '2% cash back on all purchases',
    secondaryBenefits: [
      'Unlimited 2% on everything',
      'No annual fee',
      '0% intro APR for 15 months',
      'Cell phone protection'
    ],
    rewardsStructure: [
      { category: 'All Purchases', rate: '2%', description: 'Unlimited cash rewards' }
    ],
    creditScoreRequired: 'Good to Excellent (670-850)',
    fullDescription: 'The Wells Fargo Active Cash card offers a simple flat 2% cash back on all purchases with no annual fee, making it an excellent everyday spending card.',
    applicationUrl: 'https://www.wellsfargo.com/credit-cards/active-cash/'
  }
];

