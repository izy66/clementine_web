from abc import ABC, abstractmethod
from typing import List, Dict, Any
import numpy as np

from src.models.transaction import Transaction

class VectorStore(ABC):
    @abstractmethod
    def add_transactions(self, transactions: List[Transaction], embeddings: np.ndarray):
        pass
    
    @abstractmethod
    def search(self, query_embedding: np.ndarray, k: int = 5) -> List[Dict[str, Any]]:
        pass 