export type TransactionType = 'expense' | 'income' | 'refund';
export type TransactionSource = 'AMEX' | 'WS';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  type: TransactionType;
  source: TransactionSource;
}

export interface TransactionFormData {
  merchant: string;
  date: string;
  amount: string;
  type: TransactionType;
  description: string;
  category: string;
} 