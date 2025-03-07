export const categoryEmojis: Record<string, string> = {
  'Account Transfer': '💸',
  'Auto Services': '🚗',
  'Digital Services': '🎵',
  'Donation': '🎗️',
  'Donations': '🎗️',
  'Education': '📚',
  'Entertainment': '🍿',
  'Fee Services': '💳',
  'Food & Drinks': '🥗',
  'Gas': '⛽',
  'Gym': '🏋️',
  'Health': '🏥',
  'Healthcare': '🏥',
  'Hotel': '🏨',
  'Housing': '🏠',
  'Income': '🤑',
  'Insurance': '🛡️',
  'Others': '📦',
  'Parking': '🅿️',
  'Pet': '🐱',
  'Shopping & Retail': '🛍️',
  'Transfer In': '💸',
  'Transfer Out': '💸',
  'Transportation': '🚗',
  'Travel': '✈️',
  'Tuition': '🎓',
  'Utilities': '⚡',
  // Add more categories as needed
};

export const getCategoryEmoji = (category: string): string => {
  return categoryEmojis[category] || '📦';
}; 