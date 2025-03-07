export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionSource = 'AMEX' | 'WS' | 'CIBC_DEB' | 'CIBC_CRE' | 'CHED' | 'SCOT_DEB' | 'SCOT_CRE' | 'Unknown';

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