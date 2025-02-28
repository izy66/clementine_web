import faiss
import numpy as np
from typing import List, Dict, Any, Optional
import pickle
from pathlib import Path

from src.vector_store.base import VectorStore
from src.models.transaction import Transaction

class FaissVectorStore(VectorStore):
    def __init__(self, dimension: int, index_path: Optional[Path] = None):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.transactions: List[Transaction] = []
        self.index_path = index_path
        
        if index_path and index_path.exists():
            self.load_index()
    
    def add_transactions(self, transactions: List[Transaction], embeddings: np.ndarray):
        assert len(transactions) == embeddings.shape[0], "Number of transactions must match number of embeddings"
        assert embeddings.shape[1] == self.dimension, f"Embedding dimension must be {self.dimension}"
        
        self.transactions.extend(transactions)
        self.index.add(embeddings)
        
        if self.index_path:
            self.save_index()
    
    def search(self, query_embedding: np.ndarray, k: int = 5) -> List[Dict[str, Any]]:
        distances, indices = self.index.search(query_embedding.reshape(1, -1), k)
        
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.transactions):
                results.append({
                    "transaction": self.transactions[idx],
                    "distance": float(distance)
                })
        return results
    
    def save_index(self):
        if not self.index_path.parent.exists():
            self.index_path.parent.mkdir(parents=True)
        
        faiss.write_index(self.index, str(self.index_path))
        with open(str(self.index_path) + ".transactions", "wb") as f:
            pickle.dump(self.transactions, f)
    
    def load_index(self):
        self.index = faiss.read_index(str(self.index_path))
        with open(str(self.index_path) + ".transactions", "rb") as f:
            self.transactions = pickle.load(f) 