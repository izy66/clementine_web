import React, { useState } from 'react';
import { Transaction } from '../types/transaction';
import { getCategoryEmoji } from '../utils/categoryEmojis';

interface TransactionItemProps {
  transaction: Transaction;
  onUpdate: (updated: Transaction) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  const handleSave = async () => {
    await onUpdate(editedTransaction);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    await onDelete(transaction.id);
  };

  if (isEditing) {
    return (
      <li className="p-4 bg-white rounded-lg shadow">
        <div className="space-y-2">
          <input
            type="text"
            value={editedTransaction.merchant}
            onChange={e => setEditedTransaction({
              ...editedTransaction,
              merchant: e.target.value
            })}
            className="w-full px-2 py-1 border rounded"
            placeholder="Merchant"
          />
          <input
            type="number"
            value={editedTransaction.amount}
            onChange={e => setEditedTransaction({
              ...editedTransaction,
              amount: parseFloat(e.target.value)
            })}
            className="w-full px-2 py-1 border rounded"
            step="0.01"
          />
          <input
            type="text"
            value={editedTransaction.category}
            onChange={e => setEditedTransaction({
              ...editedTransaction,
              category: e.target.value
            })}
            className="w-full px-2 py-1 border rounded"
            placeholder="Category"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getCategoryEmoji(transaction.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {transaction.description}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-lg font-semibold ${
          transaction.type === 'income' || 
          (transaction.type === 'expense' && transaction.amount > 0) ? 
          'text-green-600' : 'text-red-600'
        }`}>
          ${Math.abs(transaction.amount).toFixed(2)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit()}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete()}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem; 