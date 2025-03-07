// Create a utilities file for transaction processing functions
import { Transaction } from '../types/transaction';
import { memoize } from 'lodash';

// Function to create a key for matching transactions
export const getTransactionKey = (t: Transaction) => {
  return `${Math.abs(t.amount)}_${t.description.toLowerCase().trim()}`;
};

// Function to preprocess transactions and find matches
export const preprocessTransactions = memoize((transactions: Transaction[]) => {
  const amexTransactions = transactions.filter(t => t.source === 'AMEX' || t.source === 'WS');
  
  // Create maps for expenses and refunds
  const expenseMap = new Map<string, Transaction>();
  const refundMap = new Map<string, Transaction>();
  const matchedIds = new Set<string>();

  // Separate expenses and refunds
  amexTransactions.forEach(t => {
    const key = getTransactionKey(t);
    if (t.amount > 0) {
      expenseMap.set(key, t);
    } else {
      refundMap.set(key, t);
    }
  });

  // Find matches
  expenseMap.forEach((expense, key) => {
    const refund = refundMap.get(key);
    if (refund) {
      matchedIds.add(expense.id);
      matchedIds.add(refund.id);
      console.log('Matched pair:', { expense, refund });
    }
  });

  return matchedIds;
});

// Fix the cache clear function
export const clearPreprocessCache = () => {
  // Use type assertion to tell TypeScript that cache exists and has clear method
  const cache = (preprocessTransactions as any).cache;
  if (cache && typeof cache.clear === 'function') {
    cache.clear();
  }
};

// Format month for display
export const formatMonth = (dateStr: string) => {
  const [year, month] = dateStr.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Get available months from transactions
export const getAvailableMonths = (transactions: Transaction[]) => {
  const months = new Set(
    transactions.map(t => t.date.slice(0, 7))
  );
  
  // If no months available, add current month
  if (months.size === 0) {
    months.add(getCurrentMonth());
  }
  
  return Array.from(months).sort().reverse();
};

// Get current month
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
}; 