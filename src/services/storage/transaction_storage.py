import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

class TransactionStorage:
    def __init__(self, storage_path: Path = Path("data/transactions.json")):
        self.storage_path = storage_path
        self._ensure_storage_exists()

    def _ensure_storage_exists(self) -> None:
        """Ensure storage directory and file exist"""
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.storage_path.exists():
            self.storage_path.write_text('[]')

    def load_transactions(self) -> List[Dict[str, Any]]:
        """Load all transactions from storage"""
        try:
            return json.loads(self.storage_path.read_text())
        except json.JSONDecodeError:
            return []

    def save_transactions(self, transactions: List[Dict[str, Any]]) -> None:
        """Save transactions to storage"""
        self.storage_path.write_text(json.dumps(transactions, indent=2))

    def add_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new transaction to storage"""
        transactions = self.load_transactions()
        transactions.append(transaction)
        self.save_transactions(transactions)
        return transaction

    def get_transactions_by_date_range(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get transactions within a date range"""
        transactions = self.load_transactions()
        return [
            t for t in transactions 
            if start_date <= datetime.fromisoformat(t['date']) <= end_date
        ]

    def get_transactions_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get transactions by category"""
        transactions = self.load_transactions()
        return [t for t in transactions if t['category'].lower() == category.lower()]

    def get_transactions_by_merchant(self, merchant: str) -> List[Dict[str, Any]]:
        """Get transactions by merchant"""
        transactions = self.load_transactions()
        return [
            t for t in transactions 
            if merchant.lower() in t['merchant'].lower()
        ] 