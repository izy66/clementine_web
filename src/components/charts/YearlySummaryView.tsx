import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types/transaction';
import { preprocessTransactions } from '../../utils/transactionUtils';
import { 
  YEAR_SUMMARY_COLUMNS, MAX_BAR_WIDTH_PERCENT, INCOME_BAR_COLOR, 
  EXPENSE_BAR_COLOR, NET_POSITIVE_COLOR, NET_NEGATIVE_COLOR,
  EXCLUDED_CATEGORIES_LIST, LARGE_GIFT_THRESHOLD
} from './ChartConstants';
import Modal from '../Modal';
import TransactionListView from '../TransactionListView';
import TransactionModal from '../TransactionModal';

interface YearlySummaryViewProps {
  transactions: Transaction[];
}

const YearlySummaryView: React.FC<YearlySummaryViewProps> = ({ transactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'net' | null>(null);
  const [yearlyTransactions, setYearlyTransactions] = useState<Transaction[]>([]);

  // Calculate yearly summary data
  const yearlyData = useMemo(() => {
    const matchedIds = preprocessTransactions(transactions);
    
    // Group transactions by year
    const yearlyTotals: Record<string, { income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      // Skip excluded categories and matched transactions
      if (EXCLUDED_CATEGORIES_LIST.includes(t.category) || matchedIds.has(t.id)) {
        return;
      }
      
      // Skip large gifts from yearly summary
      if (t.type === 'income' && t.amount >= LARGE_GIFT_THRESHOLD) {
        console.log(`Excluding large gift from yearly summary: ${t.description} (${t.amount})`);
        return;
      }
            
      const year = t.date.slice(0, 4);
      
      if (!yearlyTotals[year]) {
        yearlyTotals[year] = { income: 0, expense: 0 };
      }
      
      // Categorize based on transaction type
      if (t.type === 'income') {
        // For income type, add positive amounts
        if (t.amount > 0) {
          yearlyTotals[year].income += t.amount;
        }
      } 
      else if (t.type === 'expense') {
        yearlyTotals[year].expense -= t.amount;
      }
    });
    
    const result = Object.entries(yearlyTotals)
      .map(([year, data]) => ({
        year,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => b.year.localeCompare(a.year));
    
    // Calculate maximum values for scaling the bars
    const maxIncome = Math.max(...result.map(d => d.income), 1);
    const maxExpense = Math.max(...result.map(d => d.expense), 1);
    const maxAbsNet = Math.max(...result.map(d => Math.abs(d.net)), 1);
    
    // Add percentage values for the bars
    return result.map(item => ({
      ...item,
      incomePercent: (item.income / maxIncome) * MAX_BAR_WIDTH_PERCENT,
      expensePercent: (item.expense / maxExpense) * MAX_BAR_WIDTH_PERCENT,
      netPercent: (Math.abs(item.net) / maxAbsNet) * MAX_BAR_WIDTH_PERCENT
    }));
  }, [transactions]);

  // Handle click on yearly data
  const handleYearlyDataClick = (year: string, type: 'income' | 'expense' | 'net') => {
    const matchedIds = preprocessTransactions(transactions);
    
    let filteredTransactions: Transaction[] = [];
    let title = '';
    
    if (type === 'income') {
      filteredTransactions = transactions.filter(t => 
        t.date.slice(0, 4) === year && 
        t.type === 'income' && 
        t.amount > 0 &&
        t.amount < LARGE_GIFT_THRESHOLD && // Exclude large gifts
        !matchedIds.has(t.id)
      );
      title = `Income for ${year}`;
    } 
    else if (type === 'expense') {
      filteredTransactions = transactions.filter(t => 
        t.date.slice(0, 4) === year && 
        t.type === 'expense' && 
        !EXCLUDED_CATEGORIES_LIST.includes(t.category) &&
        !matchedIds.has(t.id)
      );
      title = `Expenses for ${year}`;
    }
    else if (type === 'net') {
      // For net, show both income and expenses
      filteredTransactions = transactions.filter(t => 
        t.date.slice(0, 4) === year && 
        (t.type === 'income' || t.type === 'expense') &&
        !(t.type === 'income' && t.amount >= LARGE_GIFT_THRESHOLD) && // Exclude large gifts
        !EXCLUDED_CATEGORIES_LIST.includes(t.category) &&
        !matchedIds.has(t.id)
      );
      title = `All Transactions for ${year}`;
    }
    
    setYearlyTransactions(filteredTransactions);
    setSelectedYear(year);
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Yearly Summary</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {YEAR_SUMMARY_COLUMNS.map(column => (
                <th 
                  key={column}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {yearlyData.map(data => (
              <tr key={data.year} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.year}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium relative cursor-pointer hover:bg-green-50"
                  onClick={() => handleYearlyDataClick(data.year, 'income')}
                >
                  <div 
                    className="absolute inset-0 h-full" 
                    style={{
                      width: `${data.incomePercent}%`,
                      backgroundColor: INCOME_BAR_COLOR,
                      zIndex: 0
                    }}
                  />
                  <span className="relative z-10">${data.income.toFixed(2)}</span>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium relative cursor-pointer hover:bg-red-50"
                  onClick={() => handleYearlyDataClick(data.year, 'expense')}
                >
                  <div 
                    className="absolute inset-0 h-full" 
                    style={{
                      width: `${data.expensePercent}%`,
                      backgroundColor: EXPENSE_BAR_COLOR,
                      zIndex: 0
                    }}
                  />
                  <span className="relative z-10">${data.expense.toFixed(2)}</span>
                </td>
                <td 
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative cursor-pointer ${
                    data.net >= 0 ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                  }`}
                  onClick={() => handleYearlyDataClick(data.year, 'net')}
                >
                  <div 
                    className="absolute inset-0 h-full" 
                    style={{
                      width: `${data.netPercent}%`,
                      backgroundColor: data.net >= 0 ? NET_POSITIVE_COLOR : NET_NEGATIVE_COLOR,
                      zIndex: 0
                    }}
                  />
                  <span className="relative z-10">${data.net.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium relative">
                <div 
                  className="absolute inset-0 h-full" 
                  style={{
                    width: `${MAX_BAR_WIDTH_PERCENT}%`,
                    backgroundColor: INCOME_BAR_COLOR,
                    zIndex: 0
                  }}
                />
                <span className="relative z-10">
                  ${yearlyData.reduce((sum, data) => sum + data.income, 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium relative">
                <div 
                  className="absolute inset-0 h-full" 
                  style={{
                    width: `${MAX_BAR_WIDTH_PERCENT}%`,
                    backgroundColor: EXPENSE_BAR_COLOR,
                    zIndex: 0
                  }}
                />
                <span className="relative z-10">
                  ${yearlyData.reduce((sum, data) => sum + data.expense, 0).toFixed(2)}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative ${
                yearlyData.reduce((sum, data) => sum + data.net, 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                <div 
                  className="absolute inset-0 h-full" 
                  style={{
                    width: `${MAX_BAR_WIDTH_PERCENT}%`,
                    backgroundColor: yearlyData.reduce((sum, data) => sum + data.net, 0) >= 0 
                      ? NET_POSITIVE_COLOR 
                      : NET_NEGATIVE_COLOR,
                    zIndex: 0
                  }}
                />
                <span className="relative z-10">
                  ${yearlyData.reduce((sum, data) => sum + data.net, 0).toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedYear(null);
          setSelectedType(null);
        }}
        title={`${selectedType === 'income' ? 'Income' : selectedType === 'expense' ? 'Expenses' : 'All Transactions'} for ${selectedYear}`}
        transactions={yearlyTransactions}
      />
    </div>
  );
};

export default YearlySummaryView; 