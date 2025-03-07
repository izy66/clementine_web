import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { Transaction } from '../types/transaction';

interface CategoryManagerProps {
  transactions: Transaction[];
  onMergeCategories: (source: string, target: string) => Promise<void>;
  onAddCategory: (category: string, emoji: string) => Promise<void>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  transactions, 
  onMergeCategories,
  onAddCategory 
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newEmoji, setNewEmoji] = useState('📦');
  const [sourceCategory, setSourceCategory] = useState('');
  const [targetCategory, setTargetCategory] = useState('');

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const categorySet = new Set(transactions.map(t => t.category));
    return Array.from(categorySet).sort();
  }, [transactions]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category);
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const count = categoryTransactions.length;
      
      return {
        category,
        count,
        totalAmount,
        emoji: getCategoryEmoji(category)
      };
    }).sort((a, b) => b.count - a.count);
  }, [categories, transactions]);

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      await onAddCategory(newCategory.trim(), newEmoji);
      setNewCategory('');
    }
  };

  const handleMergeCategories = async () => {
    if (sourceCategory && targetCategory && sourceCategory !== targetCategory) {
      await onMergeCategories(sourceCategory, targetCategory);
      setSourceCategory('');
      setTargetCategory('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">Category Management</h2>
      
      {/* Add New Category */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder="Emoji"
            className="w-20 px-4 py-2 border rounded-lg text-center text-xl"
            maxLength={2}
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Merge Categories */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Merge Categories</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Category
              </label>
              <select
                value={sourceCategory}
                onChange={(e) => setSourceCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={`source-${category}`} value={category}>
                    {getCategoryEmoji(category)} {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Category
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={`target-${category}`} value={category}>
                    {getCategoryEmoji(category)} {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleMergeCategories}
            disabled={!sourceCategory || !targetCategory || sourceCategory === targetCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Merge Categories
          </button>
        </div>
      </div>
      
      {/* Category List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">All Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map(stat => (
            <div 
              key={stat.category}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{stat.emoji}</span>
                <span className="font-medium">{stat.category}</span>
              </div>
              <div className="text-gray-600 text-sm">
                {stat.count} transactions · ${stat.totalAmount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryManager; 