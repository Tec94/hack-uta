import { Transaction } from '@/types';

export function generateMockTransactions(days: number = 30): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = ['dining', 'gas', 'groceries', 'travel', 'shopping', 'entertainment'];
  const merchants: Record<string, string[]> = {
    dining: ['Chipotle', 'Starbucks', 'McDonald\'s', 'Panera Bread', 'Local Restaurant', 'Pizza Place'],
    gas: ['Shell', 'Chevron', 'BP', 'ExxonMobil', '7-Eleven Gas'],
    groceries: ['Whole Foods', 'Trader Joe\'s', 'Safeway', 'Walmart Grocery', 'Target'],
    travel: ['United Airlines', 'Marriott Hotel', 'Hertz Rental', 'Uber', 'Airbnb'],
    shopping: ['Amazon', 'Best Buy', 'Apple Store', 'Nordstrom', 'Target'],
    entertainment: ['Netflix', 'Spotify', 'AMC Theatres', 'Concert Tickets', 'Gym Membership'],
  };

  const amountRanges: Record<string, [number, number]> = {
    dining: [8, 75],
    gas: [30, 80],
    groceries: [50, 200],
    travel: [100, 800],
    shopping: [20, 500],
    entertainment: [10, 150],
  };

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate 1-4 transactions per day
    const numTransactions = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < numTransactions; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const merchantList = merchants[category];
      const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
      const [min, max] = amountRanges[category];
      const amount = Math.random() * (max - min) + min;

      transactions.push({
        id: `tx-${i}-${j}-${Date.now()}`,
        amount: Math.round(amount * 100) / 100,
        date: date.toISOString().split('T')[0],
        merchant,
        category,
        account: 'Checking Account',
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateCategorySpending(transactions: Transaction[]): Record<string, number> {
  const spending: Record<string, number> = {
    dining: 0,
    gas: 0,
    groceries: 0,
    travel: 0,
    shopping: 0,
    entertainment: 0,
  };

  transactions.forEach(tx => {
    if (spending[tx.category] !== undefined) {
      spending[tx.category] += tx.amount;
    }
  });

  return spending;
}

