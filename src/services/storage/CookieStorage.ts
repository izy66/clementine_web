import Cookies from 'js-cookie';
import { Transaction } from '../../types/transaction';

export class CookieStorage {
  private readonly COOKIE_KEY = 'transactions';
  private readonly COOKIE_EXPIRY = 365; // days
  private readonly CHUNK_SIZE = 100; // Number of transactions per chunk

  async getAllTransactions(): Promise<Transaction[]> {
    let allTransactions: Transaction[] = [];
    let chunk = 0;
    
    while (true) {
      const data = Cookies.get(`${this.COOKIE_KEY}_${chunk}`);
      if (!data) break;
      
      const transactions = JSON.parse(data);
      console.log(`Retrieved chunk ${chunk}:`, {
        count: transactions.length,
        sample: transactions.slice(0, 2)
      });
      
      allTransactions = allTransactions.concat(transactions);
      chunk++;
    }

    console.log('Total transactions retrieved:', allTransactions.length);
    return allTransactions;
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    const transactions = await this.getAllTransactions();
    transactions.push(transaction);
    await this.saveTransactions(transactions);
  }

  private async saveTransactions(transactions: Transaction[]): Promise<void> {
    console.log('Saving transactions:', {
      total: transactions.length,
      chunks: Math.ceil(transactions.length / this.CHUNK_SIZE)
    });

    // Clear existing chunks
    let chunk = 0;
    while (Cookies.get(`${this.COOKIE_KEY}_${chunk}`)) {
      Cookies.remove(`${this.COOKIE_KEY}_${chunk}`);
      chunk++;
    }

    // Save in chunks
    for (let i = 0; i < transactions.length; i += this.CHUNK_SIZE) {
      const chunk = Math.floor(i / this.CHUNK_SIZE);
      const chunkData = transactions.slice(i, i + this.CHUNK_SIZE);
      console.log(`Saving chunk ${chunk}:`, {
        start: i,
        end: i + this.CHUNK_SIZE,
        count: chunkData.length
      });
      
      try {
        Cookies.set(`${this.COOKIE_KEY}_${chunk}`, JSON.stringify(chunkData), {
          expires: this.COOKIE_EXPIRY,
          sameSite: 'strict'
        });
      } catch (error) {
        console.error(`Error saving chunk ${chunk}:`, error);
        throw error;
      }
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
    console.log('Clearing all transactions');
    let chunk = 0;
    while (Cookies.get(`${this.COOKIE_KEY}_${chunk}`)) {
      console.log(`Removing chunk ${chunk}`);
      Cookies.remove(`${this.COOKIE_KEY}_${chunk}`);
      chunk++;
    }
  }
} 