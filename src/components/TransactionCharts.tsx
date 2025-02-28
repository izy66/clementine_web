import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Transaction } from '../types/transaction';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { motion } from 'framer-motion';

interface TransactionChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#4f46e5', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col gap-2 text-sm bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      {payload.map((entry: any, index: number) => (
        <motion.div
          key={`legend-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between min-w-[280px] p-2 rounded-lg hover:bg-white/80"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">
              {getCategoryEmoji(entry.value)} {entry.value}
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600">{entry.payload.percentage}%</span>
            <span className="font-semibold">
              ${entry.payload.amount.toFixed(2)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const TransactionCharts: React.FC<TransactionChartsProps> = ({ transactions }) => {
  console.log('TransactionCharts received transactions:', {
    count: transactions.length,
    sample: transactions.slice(0, 2)
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // Get unique year-months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set(
      transactions.map(t => t.date.slice(0, 7)) // Use yyyy-mm directly from the date string
    );
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Update excluded categories for monthly trend
  const EXCLUDED_CATEGORIES = ['Credit Card Payment', 'Transfer In', 'Transfer Out', 'Education']; // Added 'Education'

  // Add separate excluded categories for pie chart
  const PIE_CHART_EXCLUDED = [...EXCLUDED_CATEGORIES]; // Now both exclude Education

  // Function to create a key for matching transactions
  const getTransactionKey = (t: Transaction) => {
    return `${Math.abs(t.amount)}_${t.description.toLowerCase().trim()}`;
  };

  // Preprocess transactions to find and mark matched pairs
  const preprocessTransactions = (transactions: Transaction[]) => {
    // Only look for matches in AMEX transactions
    const amexTransactions = transactions.filter(t => t.source === 'AMEX');
    
    // Create maps for expenses and refunds
    const expenseMap = new Map<string, Transaction>();
    const refundMap = new Map<string, Transaction>();
    const matchedIds = new Set<string>();

    // Separate expenses and refunds
    amexTransactions.forEach(t => {
      const key = getTransactionKey(t);
      if (t.amount > 0) {
        expenseMap.set(key, t);
      } else {
        refundMap.set(key, t);
      }
    });

    // Find matches
    expenseMap.forEach((expense, key) => {
      const refund = refundMap.get(key);
      if (refund) {
        matchedIds.add(expense.id);
        matchedIds.add(refund.id);
        console.log('Matched pair:', { expense, refund });
      }
    });

    return matchedIds;
  };

  // Calculate spending by category for selected month
  const categoryData = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    const filtered = transactions.filter(t => 
      t.date.slice(0, 7) === selectedMonth && 
      !PIE_CHART_EXCLUDED.includes(t.category) && // Use PIE_CHART_EXCLUDED here
      !matchedIds.has(t.id)
    );
    
    const categorySpending = filtered.reduce((acc, t) => {
      // For AMEX: positive -> expense, negative -> refund
      if (t.source === 'AMEX') {
        acc[t.category] = (acc[t.category] || 0) + t.amount; // Include refunds
      }
      // For WS: handle based on category and amount
      else if (t.source === 'WS') {
        if (t.category === 'Income') {
          // Skip income category for pie chart
          return acc;
        } else {
          // For non-income categories:
          // negative -> expense, positive -> refund
          acc[t.category] = (acc[t.category] || 0) - t.amount; // Negate to match AMEX logic
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categorySpending)
      .reduce((a, b) => a + b, 0);

    const sortedData = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount: Math.abs(amount),
        percentage: Math.round((Math.abs(amount) / Math.abs(totalSpending)) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Combine small categories into "Others"
    if (sortedData.length > 6) {
      const topCategories = sortedData.slice(0, 5);
      const othersAmount = sortedData
        .slice(5)
        .reduce((sum, item) => sum + item.amount, 0);
      const othersPercentage = Math.round((othersAmount / totalSpending) * 100);

      return [
        ...topCategories,
        {
          category: 'Others',
          amount: othersAmount,
          percentage: othersPercentage
        }
      ];
    }

    return sortedData;
  }, [transactions, selectedMonth]);

  // Add this calculation
  const specialCategorySums = useMemo(() => {
    const education = transactions
      .filter(t => t.category === 'Education')
      .reduce((sum, t) => {
        if (t.source === 'AMEX') {
          return sum + t.amount; // Positive -> expense, negative -> refund
        } else if (t.source === 'WS' && t.amount < 0) {
          return sum + Math.abs(t.amount); // Only negative amounts are expenses
        }
        return sum;
      }, 0);

    const gifts = transactions
      .filter(t => 
        t.category === 'Income' && 
        t.source === 'WS' && 
        t.amount >= 5000
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      education: Math.abs(education),
      gifts
    };
  }, [transactions]);

  // Calculate monthly spending over time
  const monthlyData = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    const monthlyTotals = transactions
      .filter(t => 
        !EXCLUDED_CATEGORIES.includes(t.category) && 
        !matchedIds.has(t.id) &&
        // Exclude large gifts from monthly trend
        !(t.category === 'Income' && t.source === 'WS' && t.amount >= 5000)
      )
      .reduce((acc, t) => {
        const month = t.date.slice(0, 7);
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 };
        }

        // For AMEX: positive -> expense, negative -> refund
        if (t.source === 'AMEX') {
          acc[month].expense += t.amount;
        }
        // For WS: handle based on category and amount
        else if (t.source === 'WS') {
          if (t.category === 'Income') {
            if (t.amount > 0) {
              acc[month].income += t.amount;
            }
          } else {
            if (t.amount < 0) {
              acc[month].expense += Math.abs(t.amount);
            } else {
              acc[month].expense -= t.amount;
            }
          }
        }
        
        return acc;
      }, {} as Record<string, { income: number; expense: number }>);

    console.log('Monthly totals calculated:', monthlyTotals);

    return Object.entries(monthlyTotals)
      .map(([month, { income, expense }]) => ({
        month,
        income: Number(income.toFixed(2)),
        expense: Number(expense.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

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
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Special Categories Summary</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="text-gray-600">Education Expenses</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${specialCategorySums.education.toFixed(2)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span className="text-gray-600">Gifts Received</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${specialCategorySums.gifts.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mb-6 px-4 py-2 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>

        <div className="h-[400px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                cx="35%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)} (${
                  categoryData.find(item => item.amount === value)?.percentage
                }%)`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                content={<CustomLegend />}
                align="right"
                verticalAlign="middle"
                layout="vertical"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Monthly Spending Trend</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <ReferenceLine 
                y={1000} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
                label={{ 
                  value: 'Monthly Budget: $1,000',
                  position: 'right',
                  fill: '#ef4444',
                  opacity: 0.5
                }}
              />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonth}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '14px' }}
              />
              <YAxis 
                domain={[0, 3500]}
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(value) => `$${value}`}
                style={{ fontSize: '14px' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  console.log('Tooltip name:', name); // Debug log
                  // Match exactly with the Line dataKey
                  return [`$${Math.abs(value).toFixed(2)}`, name];
                }}
                labelFormatter={formatMonth}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="expense"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                name="Expenses"  // This is what shows in the tooltip
              />
              <Line 
                type="monotone" 
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                name="Income"  // This is what shows in the tooltip
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCharts; 