import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Transaction, TransactionFormData, TransactionType } from '../types/transaction';

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => Promise<void>;
  initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    merchant: initialData?.merchant || '',
    date: initialData?.date || new Date().toISOString().slice(0, 10),
    amount: initialData?.amount.toString() || '',
    type: (initialData?.type as TransactionType) || 'expense',
    description: initialData?.description || '',
    category: initialData?.category || ''
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create a Transaction from form data
    const transaction: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      merchant: formData.merchant,
      date: formData.date,
      amount: parseFloat(formData.amount),
      type: formData.type as TransactionType,
      description: formData.description,
      category: formData.category,
      source: 'AMEX' // Default source for manually added transactions
    };

    await onSubmit(transaction);
    
    // Reset form
    setFormData({
      merchant: '',
      date: '',
      amount: '',
      type: 'expense',
      description: '',
      category: ''
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="refund">Refund</option>
        </select>
      </div>
      <div>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          placeholder="Merchant"
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="w-full px-3 py-2 border rounded"
          required
          step="0.01"
        />
      </div>
      <div>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button 
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm; 