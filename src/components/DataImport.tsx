import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Transaction, TransactionType, TransactionSource } from '../types/transaction';
import { v4 as uuidv4 } from 'uuid';
import { LARGE_GIFT_THRESHOLD } from './charts/ChartConstants';
import { calcGeneratorDuration } from 'framer-motion';

interface DataImportProps {
  onImport: (transactions: Transaction[]) => Promise<void>;
}

interface CSVRow {
  Date: string;
  Description: string;
  Amount: string;
  Category: string;
  Source: string;
  [key: string]: string; // Allow other fields
}

const DataImport: React.FC<DataImportProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processTransaction = (row: CSVRow): Transaction | null => {
    try {
      // Check each required field individually
      if (!row.Date?.trim()) {
        console.warn('Missing Date:', row);
        return null;
      }
      if (!row.Amount?.trim()) {
        console.warn('Missing Amount:', row);
        return null;
      }
      if (!row.Category?.trim()) {
        console.warn('Missing Category:', row);
        return null;
      }

      // Skip transfers but log them
      if (row.Category === 'Transfers') {
        console.log('Skipping transfer:', row);
        return null;
      }

      const rawAmount = row.Amount.replace(/[^-0-9.]/g, '');
      
      const parsedAmount = parseFloat(rawAmount);
      if (isNaN(parsedAmount)) {
        console.warn('Invalid amount format:', row.Amount, '→', rawAmount);
        return null;
      }

      let amount: number;
      let type: TransactionType;

      amount = parsedAmount;
      // For other sources, use category to determine type
      type = row.Category === 'Income' ? 'income' : 
              row.Category === 'Transfers' ? 'transfer' : 'expense';

      let category = row.Category.trim() == 'Income' && amount > LARGE_GIFT_THRESHOLD ? 'Gifts' : row.Category.trim();

      const transaction: Transaction = {
        id: uuidv4(),
        date: row.Date.trim(),
        description: row.Description?.trim() || '',
        amount,
        category: category,
        merchant: row.Description?.trim().split(' ')[0] || 'Unknown',
        type,
        source: row.Source as TransactionSource || 'Unknown',
      };

      return transaction;

    } catch (error) {
      console.error('Error processing row:', row, error);
      return null;
    }
  };

  const processChunk = async (
    rows: CSVRow[], 
    chunkSize: number = 500
  ): Promise<Transaction[]> => {
    const chunks: Transaction[] = [];
    
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      
      // Process chunk asynchronously
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const processedChunk = chunk
        .map(processTransaction)
        .filter((t): t is Transaction => t !== null);
      
      chunks.push(...processedChunk);
    }
    
    return chunks;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const transactions = await processChunk(results.data);
          onImport(transactions);
        } catch (error) {
          console.error('Error processing CSV:', error);
          alert('Error processing CSV file. Please check the console for details.');
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the file format.');
        setIsProcessing(false);
      }
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className={`
          px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow 
          flex items-center space-x-2
          ${isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
      >
        <span>{isProcessing ? '⏳' : '📤'}</span>
        <span>{isProcessing ? 'Processing...' : 'Import CSV'}</span>
      </button>
    </>
  );
};

export default DataImport; 