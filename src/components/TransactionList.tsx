import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import TransactionForm from './TransactionForm';
import Modal from './Modal';
import { motion } from 'framer-motion';
import TransactionListView from './TransactionListView';

interface TransactionListProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => Promise<void>;
  onUpdateTransaction: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { months, categories } = useMemo(() => {
    const monthSet = new Set(transactions.map(t => t.date.slice(0, 7)));
    const categorySet = new Set(transactions.map(t => t.category));

    return {
      months: Array.from(monthSet).sort().reverse(),
      categories: Array.from(categorySet).sort()
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const monthMatch = selectedMonth === 'all' || t.date.slice(0, 7) === selectedMonth;
        const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
        return monthMatch && categoryMatch;
      });
  }, [transactions, selectedMonth, selectedCategory]);

  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="space-x-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
              transition-colors shadow-sm hover:shadow flex items-center space-x-2 text-base"
          >
            <span>➕</span>
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
        >
          <option value="all">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-50"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <TransactionListView 
            transactions={filteredTransactions}
            showCategory={true}
            onUpdateTransaction={onUpdateTransaction}
            onDeleteTransaction={onDeleteTransaction}
            onSplitTransaction={async (original, parts) => {
              // First delete the original transaction
              await onDeleteTransaction(original.id);
              
              // Then add the new split transactions
              for (const part of parts) {
                await onAddTransaction(part);
              }
            }}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Transaction"
      >
        <TransactionForm 
          onSubmit={async (t) => {
            await onAddTransaction(t);
            setIsFormOpen(false);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default TransactionList; 