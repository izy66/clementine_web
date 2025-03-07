import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../types/transaction';
import { getCategoryEmoji } from '../../utils/categoryEmojis';
import { motion } from 'framer-motion';
import Modal from '../Modal';
import TransactionListView from '../TransactionListView';
import { preprocessTransactions, formatMonth } from '../../utils/transactionUtils';
import { 
  COLORS, PIE_CHART_CX_PERCENT, PIE_CHART_CY_PERCENT, 
  PIE_CHART_INNER_RADIUS, PIE_CHART_OUTER_RADIUS, 
  PIE_CHART_PADDING_ANGLE, TOP_CATEGORIES_COUNT,
  PIE_CHART_EXCLUDED_LIST
} from './ChartConstants';

interface PieChartViewProps {
  transactions: Transaction[];
}

const CustomLegend = ({ payload = [], onCategoryClick }: { 
  payload?: any[]; 
  onCategoryClick: (category: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 text-sm bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      {payload.map((entry: any, index: number) => (
        <motion.div
          key={`legend-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between min-w-[280px] p-2 rounded-lg hover:bg-white/80 cursor-pointer"
          onClick={() => onCategoryClick(entry.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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

const PieChartView: React.FC<PieChartViewProps> = ({ transactions }) => {
  // Get available months for the dropdown using proper date sorting
  const availableMonths = useMemo(() => {
    // Extract all unique months from transactions
    const months = Array.from(new Set(
      transactions.map(t => t.date.slice(0, 7))
    ));
    
    // Sort months using actual date objects for correct chronological ordering
    const sortedMonths = months.sort((a, b) => {
      const dateA = new Date(a + '-01T00:00:00');
      const dateB = new Date(b + '-01T00:00:00');
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });
    
    // Limit to 24 most recent months
    return sortedMonths.slice(0, 24);
  }, [transactions]);

  // Initialize with most recent month
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '');
  
  // Update selected month if available months change and current selection isn't valid
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);

  // Calculate category data for the selected month
  const categoryData = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    // Filter transactions for selected month
    const monthlyTransactions = transactions.filter(t => 
      t.date.slice(0, 7) === selectedMonth
    );

    // Group transactions by category
    const categoryTotals: Record<string, number> = {};
    let totalAmount = 0;
    
    monthlyTransactions.forEach(t => {
      if (PIE_CHART_EXCLUDED_LIST.includes(t.category) || matchedIds.has(t.id)) {
        return;
      }
      
      if (t.type !== 'expense') {
        return;
      }
      
      const amount = -t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      totalAmount += amount;
    });
    
    let sortedData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / totalAmount) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);

    // Combine small categories into "Others"
    if (sortedData.length > TOP_CATEGORIES_COUNT) {
      const topCategories = sortedData.slice(0, TOP_CATEGORIES_COUNT);
      const othersAmount = sortedData
        .slice(TOP_CATEGORIES_COUNT)
        .reduce((sum, item) => sum + item.amount, 0);
      
      sortedData = [
        ...topCategories,
        {
          category: 'Others',
          amount: othersAmount,
          percentage: ((othersAmount / totalAmount) * 100).toFixed(1)
        }
      ];
    }

    return sortedData;
  }, [transactions, selectedMonth]);

  // Update categoryTransactions when selection changes
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryTransactions([]);
      return;
    }

    const matchedIds = preprocessTransactions(transactions);
    
    const filtered = selectedCategory === 'Others'
      ? transactions.filter(t => {
          const topCategories = categoryData
            .filter(item => item.category !== 'Others')
            .map(item => item.category);
          
          return t.date.slice(0, 7) === selectedMonth &&
            !PIE_CHART_EXCLUDED_LIST.includes(t.category) &&
            !matchedIds.has(t.id) &&
            !topCategories.includes(t.category) &&
            t.type === 'expense';
        })
      : transactions.filter(t => 
          t.date.slice(0, 7) === selectedMonth &&
          t.category === selectedCategory &&
          !matchedIds.has(t.id)
        );

    setCategoryTransactions(filtered);
  }, [transactions, selectedCategory, selectedMonth, categoryData]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Monthly Category Breakdown</h2>
        
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonth(month)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="h-[400px] flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx={PIE_CHART_CX_PERCENT}
              cy={PIE_CHART_CY_PERCENT}
              innerRadius={PIE_CHART_INNER_RADIUS}
              outerRadius={PIE_CHART_OUTER_RADIUS}
              paddingAngle={PIE_CHART_PADDING_ANGLE}
              dataKey="amount"
              nameKey="category"
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  cursor="pointer"
                  onClick={() => handleCategoryClick(entry.category)}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Legend 
              content={<CustomLegend onCategoryClick={handleCategoryClick} />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory('');
        }}
        title={
          selectedCategory === 'Others' 
            ? '📦 Other Categories Transactions' 
            : selectedCategory 
              ? `${getCategoryEmoji(selectedCategory)} ${selectedCategory} Transactions` 
              : 'Transactions'
        }
      >
        <TransactionListView 
          transactions={categoryTransactions}
          showCategory={selectedCategory === 'Others'}
          compact={true}
        />
      </Modal>
    </div>
  );
};

export default PieChartView; 