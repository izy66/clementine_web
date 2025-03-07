import React, { useState } from 'react';
import { Transaction } from '../types/transaction';
import Modal from './Modal';
import TransactionListView from './TransactionListView';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
  showCategory?: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  title,
  transactions,
  showCategory = true
}) => {
  const [sortOrder, setSortOrder] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortOrder === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortOrder === 'date') {
      return multiplier * (new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      return multiplier * (Math.abs(a.amount) - Math.abs(b.amount));
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pb-2">
        <div className="flex justify-between items-center px-2">
          <div className="text-sm text-gray-500">
            {transactions.length} transactions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort('date')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 border transition-colors ${
                sortOrder === 'date' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              Date
              <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 border transition-colors ${
                sortOrder === 'amount' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              Amount
              <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-100">
          <TransactionListView 
            transactions={sortedTransactions}
            showCategory={showCategory}
            compact={true}
            hideControls={true}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TransactionModal; 