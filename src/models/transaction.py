from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Transaction:
    id: str
    amount: float
    description: str
    merchant: str
    category: str
    date: datetime
    location: Optional[str] = None
    
    def to_text(self) -> str:
        """Convert transaction to searchable text format"""
        return (
            f"Transaction of ${self.amount:.2f} at {self.merchant} "
            f"for {self.description} in category {self.category} "
            f"on {self.date.strftime('%Y-%m-%d')} "
            f"{f'at {self.location}' if self.location else ''}"
        ) 