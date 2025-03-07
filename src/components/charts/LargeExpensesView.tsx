import React, { useMemo, useState } from 'react';
import { Transaction } from '../../types/transaction';
import { preprocessTransactions } from '../../utils/transactionUtils';
import { LARGE_GIFT_THRESHOLD } from './ChartConstants';
import Modal from '../Modal';
import TransactionListView from '../TransactionListView';

interface LargeExpensesViewProps {
  transactions: Transaction[];
}

interface SummaryData {
  tuitionTotal: number;
  tuitionTransactions: Transaction[];
  largeGiftsTotal: number;
  giftTransactions: Transaction[];
}

const LargeExpensesView: React.FC<LargeExpensesViewProps> = ({ transactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'tuition' | 'gifts' | null>(null);

  // Calculate summaries
  const { tuitionTotal, largeGiftsTotal, tuitionTransactions, giftTransactions } = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    const summary: SummaryData = {
      tuitionTotal: 0,
      tuitionTransactions: [],
      largeGiftsTotal: 0,
      giftTransactions: []
    };
    
    transactions.forEach(t => {
      if (matchedIds.has(t.id)) return;

      // Track Tuition expenses
      if (t.category === 'Tuition') {
        summary.tuitionTotal += Math.abs(t.amount);
        summary.tuitionTransactions.push(t);
      }
      
      // Track large gifts (Income ≥ $3000)
      if (t.type === 'income' && t.amount >= LARGE_GIFT_THRESHOLD) {
        summary.largeGiftsTotal += t.amount;
        summary.giftTransactions.push(t);
      }
    });

    // Sort transactions by date
    summary.tuitionTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    summary.giftTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return summary;
  }, [transactions]);

  const handleCardClick = (type: 'tuition' | 'gifts') => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Large Expenses Summary</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => handleCardClick('tuition')}
        >
          <div className="text-sm text-blue-600 font-medium">Total Tuition</div>
          <div className="text-2xl font-bold text-blue-700">
            ${tuitionTotal.toFixed(2)}
          </div>
          <div className="text-xs text-blue-500 mt-1">
            Click to view {tuitionTransactions.length} transactions
          </div>
        </div>
        <div 
          className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => handleCardClick('gifts')}
        >
          <div className="text-sm text-green-600 font-medium">Total Large Gifts</div>
          <div className="text-2xl font-bold text-green-700">
            ${largeGiftsTotal.toFixed(2)}
          </div>
          <div className="text-xs text-green-500 mt-1">
            Click to view {giftTransactions.length} transactions
          </div>
        </div>
      </div>

      {/* Modal for transaction details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedType(null);
        }}
        title={selectedType === 'tuition' ? 'Tuition Transactions' : 'Large Gifts'}
      >
        <TransactionListView 
          transactions={selectedType === 'tuition' ? tuitionTransactions : giftTransactions}
          compact={true}
        />
      </Modal>
    </div>
  );
};

export default LargeExpensesView; 