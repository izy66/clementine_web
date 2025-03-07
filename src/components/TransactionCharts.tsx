import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import { Transaction } from '../types/transaction';

interface TransactionChartsProps {
  transactions: Transaction[];
}

const LargeExpensesView = lazy(() => import('./charts/LargeExpensesView'));
const PieChartView = lazy(() => import('./charts/PieChartView'));
const MonthlyTrendView = lazy(() => import('./charts/MonthlyTrendView'));
const YearlySummaryView = lazy(() => import('./charts/YearlySummaryView'));

const TransactionCharts: React.FC<TransactionChartsProps> = ({ transactions }) => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Suspense fallback={<div>Loading charts...</div>}>
          <ErrorBoundary>
            <LargeExpensesView transactions={transactions} />
          </ErrorBoundary>

          <ErrorBoundary>
            <PieChartView transactions={transactions} />
          </ErrorBoundary>

          <ErrorBoundary>
            <MonthlyTrendView transactions={transactions} />
          </ErrorBoundary>

          <ErrorBoundary>
            <YearlySummaryView transactions={transactions} />
          </ErrorBoundary>
        </Suspense>
      </motion.div>
    </div>
  );
};

export default TransactionCharts;