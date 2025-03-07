import { Transaction, TransactionType, TransactionSource } from '../types/transaction';
import { v4 as uuidv4 } from 'uuid';

interface CSVRow {
  Date: string;
  Description: string;
  Amount: string;
  Category: string;
  Source: string;
}

const processTransaction = (row: CSVRow): Transaction | null => {
  try {
    if (!row.Date?.trim() || !row.Amount?.trim() || !row.Category?.trim()) {
      return null;
    }

    if (row.Category === 'Transfers') {
      return null;
    }

    const rawAmount = row.Amount.replace(/[^-0-9.]/g, '');
    const parsedAmount = parseFloat(rawAmount);
    
    if (isNaN(parsedAmount)) {
      return null;
    }

    const type: TransactionType = row.Category === 'Income' ? 'income' : 
            row.Category === 'Transfers' ? 'transfer' : 'expense';

    return {
      id: uuidv4(),
      date: row.Date.trim(),
      description: row.Description?.trim() || '',
      amount: parsedAmount,
      category: row.Category.trim(),
      merchant: row.Description?.trim().split(' ')[0] || 'Unknown',
      type,
      source: row.Source as TransactionSource || 'Unknown',
    };
  } catch (error) {
    return null;
  }
};

const workerCode = () => {
  self.onmessage = (e: MessageEvent<{ rows: CSVRow[] }>) => {
    const { rows } = e.data;
    
    const processedTransactions = rows
      .map(processTransaction)
      .filter((t): t is Transaction => t !== null);
      
    self.postMessage(processedTransactions);
  };
};

export const createWorker = () => {
  const blob = new Blob([`(${workerCode.toString()})()`], { type: 'text/javascript' });
  return new Worker(URL.createObjectURL(blob));
}; 