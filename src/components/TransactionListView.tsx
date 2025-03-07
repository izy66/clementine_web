import React, { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types/transaction';
import { motion } from 'framer-motion';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import SplitTransactionForm from './SplitTransactionForm';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface TransactionListViewProps {
  transactions: Transaction[];
  showCategory?: boolean;
  compact?: boolean;
  title?: string;
  hideControls?: boolean;
  onUpdateTransaction?: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onSplitTransaction?: (original: Transaction, parts: Transaction[]) => Promise<void>;
}

const TransactionListView: React.FC<TransactionListViewProps> = ({ 
  transactions, 
  showCategory = true,
  compact = false,
  title,
  hideControls = false,
  onUpdateTransaction,
  onDeleteTransaction,
  onSplitTransaction
}) => {
  const [sortOrder, setSortOrder] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [splittingTransaction, setSplittingTransaction] = useState<Transaction | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (sortOrder === 'date') {
        return multiplier * (new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        return multiplier * (Math.abs(a.amount) - Math.abs(b.amount));
      }
    });
  }, [transactions, sortOrder, sortDirection]);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortOrder === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="w-full px-2">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      {!hideControls && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            {sortedTransactions.length} transactions
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => toggleSort('date')}
              className={`px-4 py-2 text-sm rounded-md flex items-center gap-1 border transition-colors ${
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
              className={`px-4 py-2 text-sm rounded-md flex items-center gap-1 border transition-colors ${
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
      )}

      <div ref={parentRef} className="h-[500px] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const transaction = sortedTransactions[virtualRow.index];
            return (
              <div
                key={transaction.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <motion.div 
                  className="py-3 px-3 bg-white hover:bg-gray-50 border-b border-gray-100 m-1 rounded-md shadow-sm h-[90%] flex flex-col justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="text-lg">{getCategoryEmoji(transaction.category)}</span>
                      <div className="font-medium truncate">{transaction.description}</div>
                    </div>
                    
                    <div className={`font-semibold whitespace-nowrap ${
                      transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    
                    {onUpdateTransaction && onDeleteTransaction && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-gray-400 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        {onSplitTransaction && (
                          <button
                            onClick={() => setSplittingTransaction(transaction)}
                            className="text-gray-400 hover:text-purple-600 text-sm"
                          >
                            Split
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {editingTransaction && onUpdateTransaction && (
        <Modal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          title="Edit Transaction"
        >
          <TransactionForm
            initialData={editingTransaction}
            onSubmit={async (updated) => {
              await onUpdateTransaction({
                ...updated,
                id: editingTransaction.id
              });
              setEditingTransaction(null);
            }}
          />
        </Modal>
      )}

      {splittingTransaction && onSplitTransaction && (
        <Modal
          isOpen={!!splittingTransaction}
          onClose={() => setSplittingTransaction(null)}
          title="Split Transaction"
        >
          <SplitTransactionForm
            transaction={splittingTransaction}
            onSubmit={async (parts) => {
              await onSplitTransaction(splittingTransaction, parts);
              setSplittingTransaction(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransactionListView; 