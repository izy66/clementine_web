import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionFormData } from '../types/transaction';

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: Transaction) => Promise<void>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSubmit }) => {
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

  const [formData, setFormData] = useState<TransactionFormData>({
    merchant: initialData?.merchant || '',
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    amount: initialData ? Math.abs(initialData.amount).toString() : '',
    type: initialData?.type || 'expense',
    description: initialData?.description || '',
    category: initialData?.category || 'Others'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Determine the final amount based on type
    let finalAmount = amount;
    if (formData.type === 'expense') {
      finalAmount = -amount; // Expenses are negative
    }
    
    const transaction: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      merchant: formData.merchant,
      date: formData.date,
      amount: finalAmount,
      type: formData.type as TransactionType,
      description: formData.description,
      category: formData.category,
      source: initialData?.source || 'AMEX' // Default source
    };
    
    await onSubmit(transaction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
          <option value="gift">Gift</option>
          <option value="tuition">Tuition</option>
          {/* Removed Refund type */}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Merchant
        </label>
        <input
          type="text"
          value={formData.merchant}
          onChange={(e) => setFormData({...formData, merchant: e.target.value})}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm; 