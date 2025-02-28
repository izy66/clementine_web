import { Transaction } from '../../types/transaction';

export class LocalStorage {
  private readonly STORAGE_KEY = 'transactions';

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      console.log('Retrieved from localStorage:', {
        size: data?.length || 0,
        byteSize: new Blob([data || '']).size
      });
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      return [];
    }
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getAllTransactions();
      transactions.push(transaction);
      await this.saveTransactions(transactions);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  private async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      const data = JSON.stringify(transactions);
      console.log('Saving to localStorage:', {
        count: transactions.length,
        size: data.length,
        byteSize: new Blob([data]).size
      });
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw error;
    }
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const transactions = await this.getAllTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      transactions[index] = transaction;
      await this.saveTransactions(transactions);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getAllTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    await this.saveTransactions(filtered);
  }

  async clearAllTransactions(): Promise<void> {
    try {
      console.log('Clearing all transactions');
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing transactions:', error);
      throw error;
    }
  }
} 