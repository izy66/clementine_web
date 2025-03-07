import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TransactionChat from './components/TransactionChat';
import TransactionList from './components/TransactionList';
import TransactionCharts from './components/TransactionCharts';
import DataImport from './components/DataImport';
import { Transaction } from './types/transaction';
import { TransactionService } from './services/TransactionService';
import Papa from 'papaparse';
import CategoryManager from './components/CategoryManager';
import { categoryEmojis } from './utils/categoryEmojis';

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'insights' | 'history' | 'assistant' | 'categories'>('insights');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionService] = useState(() => new TransactionService());

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const loadedTransactions = await transactionService.getAllTransactions();
        setTransactions(loadedTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    loadTransactions();
  }, [transactionService]);

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.addTransaction(transaction);
      setTransactions(await transactionService.getAllTransactions());
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const handleImportData = async (importedTransactions: Transaction[]) => {
    try {
      console.log('Starting import of transactions:', {
        count: importedTransactions.length,
        sample: importedTransactions.slice(0, 2)
      });

      // Clear existing data first
      await transactionService.clearAllTransactions();
      
      // Add new transactions
      for (const transaction of importedTransactions) {
        await transactionService.addTransaction(transaction);
      }
      
      // Force refresh by loading all transactions again
      const updatedTransactions = await transactionService.getAllTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Failed to import transactions:', error);
    }
  };

  const handleDownloadCSV = () => {
    const csvData = transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Amount: t.amount,
      Category: t.category,
      Merchant: t.merchant,
      Type: t.type,
      Source: t.source,
      ID: t.id
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ['Date', 'Description', 'Amount', 'Category', 'Merchant', 'Type', 'Source', 'ID']
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.updateTransaction(transaction);
      setTransactions(await transactionService.getAllTransactions());
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions(await transactionService.getAllTransactions());
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleMergeCategories = async (sourceCategory: string, targetCategory: string) => {
    try {
      const allTransactions = await transactionService.getAllTransactions();
      
      // Update all transactions with source category to target category
      for (const transaction of allTransactions) {
        if (transaction.category === sourceCategory) {
          await transactionService.updateTransaction({
            ...transaction,
            category: targetCategory
          });
        }
      }
      
      // Refresh transactions
      const updatedTransactions = await transactionService.getAllTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error merging categories:', error);
    }
  };

  const handleAddCategory = async (category: string, emoji: string) => {
    try {
      // Update category emojis
      const updatedEmojis = {
        ...categoryEmojis,
        [category]: emoji
      };
      
      // Save to localStorage (you'll need to implement this)
      localStorage.setItem('categoryEmojis', JSON.stringify(updatedEmojis));
      
      // Refresh the app (or update state)
      window.location.reload();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'insights':
        return <TransactionCharts transactions={transactions} />;
      case 'history':
        return (
          <TransactionList
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'assistant':
        return <TransactionChat transactions={transactions} />;
      case 'categories':
        return (
          <CategoryManager
            transactions={transactions}
            onMergeCategories={handleMergeCategories}
            onAddCategory={handleAddCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        panels={[
          { id: 'insights', label: 'Insights', icon: '📊' },
          { id: 'history', label: 'History', icon: '📝' },
          { id: 'categories', label: 'Categories', icon: '🏷️' },
          { id: 'assistant', label: 'Assistant', icon: '🤖' }
        ]}
      />
      
      <div className="ml-64 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {activePanel === 'insights' && 'Insights'}
              {activePanel === 'history' && 'History'}
              {activePanel === 'assistant' && 'AI Assistant'}
              {activePanel === 'categories' && 'Category Management'}
            </h1>
            <div className="flex gap-4">
              <DataImport onImport={handleImportData} />
              <button
                onClick={handleDownloadCSV}
                className="bg-white text-gray-600 px-4 py-2 rounded-lg border hover:bg-gray-50 
                  transition-colors shadow-sm hover:shadow flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-6">
          <AnimatePresence mode="wait">
            {renderActivePanel()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App; 