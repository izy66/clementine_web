import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import TransactionForm from './TransactionForm';
import TransactionItem from './TransactionItem';
import Modal from './Modal';
import { motion } from 'framer-motion';

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
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
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
    return transactions.filter(t => {
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
          <button
            onClick={() => setIsAllTransactionsOpen(true)}
            className="bg-white text-gray-600 px-6 py-3 rounded-lg border hover:bg-gray-50 
              transition-colors shadow-sm hover:shadow flex items-center space-x-2 text-base"
          >
            <span>📋</span>
            <span>Show All</span>
          </button>
        </div>
      </div>

      {/* Filters */}
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

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y">
            {filteredTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onUpdate={onUpdateTransaction}
                onDelete={onDeleteTransaction}
              />
            ))}
          </div>
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

      {/* All Transactions Modal */}
      <Modal
        isOpen={isAllTransactionsOpen}
        onClose={() => setIsAllTransactionsOpen(false)}
        title="All Transactions"
      >
        <div className="mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm"
          >
            {months.map(month => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <ul className="space-y-4">
            {transactions
              .filter(t => t.date.startsWith(selectedMonth))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onUpdate={onUpdateTransaction}
                  onDelete={onDeleteTransaction}
                />
              ))}
          </ul>
        </div>
      </Modal>
    </motion.div>
  );
};

export default TransactionList; 