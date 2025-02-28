import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Transaction, TransactionType, TransactionSource } from '../types/transaction';

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
      // Log the raw row first
      console.log('Processing row:', row);

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
      if (row.Category === 'Transfer in' || row.Category === 'Transfer out') {
        console.log('Skipping transfer:', row);
        return null;
      }

      // Log amount parsing
      const rawAmount = row.Amount.replace(/[^-0-9.]/g, '');
      console.log('Parsing amount:', row.Amount, '→', rawAmount);
      
      const parsedAmount = parseFloat(rawAmount);
      if (isNaN(parsedAmount)) {
        console.warn('Invalid amount format:', row.Amount, '→', rawAmount);
        return null;
      }

      // Log source determination
      const rawSource = row.Source?.trim() || 'AMEX';
      console.log('Source determination:', row.Source, '→', rawSource);
      
      const source = rawSource === 'AMEX' || rawSource === 'WS' 
        ? rawSource as TransactionSource 
        : 'AMEX';

      let type: TransactionType;
      let amount: number;

      // Log transaction type determination
      if (source === 'AMEX') {
        amount = parsedAmount;
        type = parsedAmount > 0 ? 'expense' : 'refund';
        console.log('AMEX transaction:', { amount, type });
      } else if (source === 'WS') {
        amount = parsedAmount;
        type = parsedAmount > 0 ? 'income' : 'expense';
        console.log('WS transaction:', { amount, type });
      } else {
        amount = Math.abs(parsedAmount);
        type = 'expense';
        console.log('Default transaction:', { amount, type });
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        date: row.Date.trim(),
        description: row.Description?.trim() || '',
        amount,
        category: row.Category.trim(),
        merchant: row.Description?.trim().split(' ')[0] || 'Unknown',
        type,
        source
      };

      // Log successful transaction creation
      console.log('Created transaction:', transaction);
      return transaction;

    } catch (error) {
      console.error('Error processing row:', row, error);
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add immediate log
    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsProcessing(true);

    // Test log before parsing
    console.log('About to parse file');

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Immediate log in complete callback
        console.log('Raw results:', {
          rowCount: results.data.length,
          sampleRow: results.data[0]
        });
        
        try {
          console.log('CSV parsing complete. Total rows:', results.data.length);
          console.log('Headers:', Object.keys(results.data[0] || {}));
          console.log('First row:', results.data[0]);

          // Process all rows and filter out nulls
          const transactions = results.data
            .map((row, index) => {
              console.log(`Processing row ${index + 1}/${results.data.length}`);
              return processTransaction(row);
            })
            .filter((t): t is Transaction => {
              if (t === null) {
                console.log('Filtered out null transaction');
                return false;
              }
              return true;
            });

          console.log('Processing complete:');
          console.log('- Total rows:', results.data.length);
          console.log('- Valid transactions:', transactions.length);
          console.log('- Filtered out:', results.data.length - transactions.length);

          // Sort transactions by date
          transactions.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

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