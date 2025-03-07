import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { v4 as uuidv4 } from 'uuid';
import { getCategoryEmoji } from '../utils/categoryEmojis';

interface SplitTransactionFormProps {
  transaction: Transaction;
  onSubmit: (parts: Transaction[]) => Promise<void>;
}

const SplitTransactionForm: React.FC<SplitTransactionFormProps> = ({ 
  transaction, 
  onSubmit 
}) => {
  // Get all available categories from localStorage or use defaults
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      // Try to get categories from localStorage
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        setAvailableCategories(JSON.parse(storedCategories));
      } else {
        // Default categories if none in storage
        const defaultCategories = [
          'Food & Drinks', 'Shopping', 'Transportation', 'Entertainment',
          'Housing', 'Utilities', 'Healthcare', 'Education', 'Income',
          'Account Transfer', 'Others'
        ];
        setAvailableCategories(defaultCategories);
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const [part1, setPart1] = useState<{
    amount: string;
    category: string;
    description: string;
  }>({
    amount: (Math.abs(transaction.amount) / 2).toFixed(2),
    category: transaction.category,
    description: transaction.description
  });

  const [part2, setPart2] = useState<{
    amount: string;
    category: string;
    description: string;
  }>({
    amount: (Math.abs(transaction.amount) / 2).toFixed(2),
    category: transaction.category,
    description: transaction.description
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount1 = parseFloat(part1.amount);
    const amount2 = parseFloat(part2.amount);
    
    // Validate amounts
    if (isNaN(amount1) || isNaN(amount2)) {
      alert('Please enter valid amounts');
      return;
    }
    
    // Validate total
    const total = amount1 + amount2;
    if (Math.abs(total - Math.abs(transaction.amount)) > 0.01) {
      alert(`The sum of split amounts (${total.toFixed(2)}) must equal the original amount (${Math.abs(transaction.amount).toFixed(2)})`);
      return;
    }
    
    // Create the two new transactions
    const newPart1: Transaction = {
      ...transaction,
      id: uuidv4(),
      amount: transaction.amount < 0 ? -amount1 : amount1,
      category: part1.category,
      description: part1.description
    };
    
    const newPart2: Transaction = {
      ...transaction,
      id: uuidv4(),
      amount: transaction.amount < 0 ? -amount2 : amount2,
      category: part2.category,
      description: part2.description
    };
    
    await onSubmit([newPart1, newPart2]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <div className="font-medium">Original Transaction</div>
        <div className="flex justify-between mt-2">
          <div>{transaction.description}</div>
          <div className="font-semibold">
            ${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Part 1 */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">First Part</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={part1.amount}
              onChange={(e) => setPart1({...part1, amount: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={part1.category}
              onChange={(e) => setPart1({...part1, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryEmoji(category)} {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={part1.description}
              onChange={(e) => setPart1({...part1, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        {/* Part 2 */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Second Part</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={part2.amount}
              onChange={(e) => setPart2({...part2, amount: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={part2.category}
              onChange={(e) => setPart2({...part2, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryEmoji(category)} {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={part2.description}
              onChange={(e) => setPart2({...part2, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSubmit([])} // Cancel by submitting empty array
          className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Split Transaction
        </button>
      </div>
    </form>
  );
};

export default SplitTransactionForm; 