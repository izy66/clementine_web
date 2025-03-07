import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';
import { Transaction } from '../../types/transaction';
import { preprocessTransactions, formatMonth } from '../../utils/transactionUtils';
import { 
  MONTHLY_CHART_MAX_Y, 
  LARGE_GIFT_THRESHOLD, 
  EXCLUDED_CATEGORIES_LIST 
} from './ChartConstants';
import TransactionModal from '../TransactionModal';

interface MonthlyTrendViewProps {
  transactions: Transaction[];
}

interface MonthlyData {
  month: string;
  net: number;
}

const MonthlyTrendView: React.FC<MonthlyTrendViewProps> = ({ transactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);

  // Calculate monthly data for the trend chart
  const monthlyData = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    // Group transactions by month
    const monthlyTotals: Record<string, { net: number }> = {};
    
    transactions.forEach(t => {
      // Skip excluded categories, matched transactions, tuition, and large gifts
      if (EXCLUDED_CATEGORIES_LIST.includes(t.category) || 
          matchedIds.has(t.id) ||
          t.category === 'Tuition' ||
          (t.type === 'income' && t.amount >= LARGE_GIFT_THRESHOLD)) {
        return;
      }
      
      const month = t.date.slice(0, 7);
      
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { net: 0 };
      }
      
      monthlyTotals[month].net += t.amount;
    });
    
    return Object.entries(monthlyTotals)
      .map(([month, data]): MonthlyData => ({
        month,
        net: data.net
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const handleBarClick = (data: MonthlyData) => {
    const matchedIds = preprocessTransactions(transactions);
    
    const filteredTransactions = transactions.filter(t => {
      if (EXCLUDED_CATEGORIES_LIST.includes(t.category) || 
          matchedIds.has(t.id) ||
          t.category === 'Tuition' ||
          (t.type === 'income' && t.amount >= LARGE_GIFT_THRESHOLD)) {
        return false;
      }
      return t.date.slice(0, 7) === data.month;
    });

    setSelectedMonth(data.month);
    setMonthlyTransactions(filteredTransactions);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Monthly Net Income/Expense</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '14px' }}
            />
            <YAxis 
              domain={[-MONTHLY_CHART_MAX_Y, MONTHLY_CHART_MAX_Y]}
              axisLine={false}
              tickLine={false}
              width={80}
              tickFormatter={(value) => `$${Math.abs(value)}`}
              style={{ fontSize: '14px' }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${Math.abs(value).toFixed(2)}`, 'Net']}
              labelFormatter={formatMonth}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                padding: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="net"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={handleBarClick}
            >
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.net >= 0 ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMonth(null);
        }}
        title={`Transactions for ${selectedMonth ? formatMonth(selectedMonth) : ''}`}
        transactions={monthlyTransactions}
      />
    </div>
  );
};

export default MonthlyTrendView; 