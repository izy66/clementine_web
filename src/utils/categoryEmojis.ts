export const categoryEmojis: Record<string, string> = {
  'Auto Services': '🚗',
  'Groceries': '🥬',
  'Supermarkets': '🥬',
  'Restaurants': '🍱',
  'Subscriptions': '🤑',
  'Shopping': '🛍️',
  'Transportation': '🚗',
  'Retail': '🛍️',
  'Pet': '🐱',
  'Gas': '⛽', 
  'Travel': '✈️',
  'Entertainment': '🍿',
  'Health': '🏥',
  'Education': '📚',
  'Utilities': '⚡',
  'Housing': '🏠',
  'Others': '📦',
  // Add more categories as needed
};

export const getCategoryEmoji = (category: string): string => {
  return categoryEmojis[category] || '📦';
}; 