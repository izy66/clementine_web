import { Transaction } from '../types/transaction';
import { LocalStorage } from './storage/LocalStorage';

export class TransactionService {
  private storage: LocalStorage;
  private listeners: (() => void)[] = [];

  constructor() {
    this.storage = new LocalStorage();
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    console.log('Adding transaction:', transaction);
    await this.storage.addTransaction(transaction);
    
    // Optionally notify listeners
    this.notifyDataChange();
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await this.storage.getAllTransactions();
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    await this.storage.updateTransaction(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.storage.deleteTransaction(id);
  }

  async syncWithBackend(): Promise<void> {
    try {
      // Get local transactions
      const localTransactions = await this.getAllTransactions();

      // Send to backend
      const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: localTransactions }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with backend');
      }

      // Get updated transactions from backend
      const { transactions } = await response.json();

      // Update local storage
      for (const transaction of transactions) {
        await this.storage.addTransaction(transaction);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  public async clearAllTransactions(): Promise<void> {
    await this.storage.clearAllTransactions();
  }

  addChangeListener(listener: () => void) {
    this.listeners.push(listener);
  }

  private notifyDataChange() {
    this.listeners.forEach(listener => listener());
  }
} 