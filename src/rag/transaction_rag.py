from typing import List, Optional
from pathlib import Path
import numpy as np
from transformers import pipeline

from src.models.transaction import Transaction
from src.vector_store.base import VectorStore
from src.embeddings.base import EmbeddingModel

class TransactionRAG:
    def __init__(
        self,
        vector_store: VectorStore,
        embedding_model: EmbeddingModel,
        llm_model_name: str = "google/flan-t5-small"
    ):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.llm = pipeline("text2text-generation", model=llm_model_name, max_length=512)
    
    def add_transactions(self, transactions: List[Transaction]):
        """Index new transactions"""
        texts = [t.to_text() for t in transactions]
        embeddings = self.embedding_model.embed_texts(texts)
        self.vector_store.add_transactions(transactions, embeddings)
    
    def query(self, query: str, k: int = 5) -> str:
        """Process a natural language query about transactions"""
        # Get query embedding and search for relevant transactions
        query_embedding = self.embedding_model.embed_query(query)
        results = self.vector_store.search(query_embedding, k=k)
        
        # Format context from retrieved transactions
        context = "\n".join([
            f"- {r['transaction'].to_text()}"
            for r in results
        ])
        
        # Construct prompt for LLM
        prompt = (
            f"Based on these transactions:\n{context}\n\n"
            f"Answer this question: {query}\n\n"
            "Provide a concise summary including relevant amounts and dates."
        )
        
        # Generate response
        response = self.llm(prompt)[0]["generated_text"]
        return response 