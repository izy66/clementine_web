from datetime import datetime
from pathlib import Path

from src.models.transaction import Transaction
from src.vector_store.faiss_store import FaissVectorStore
from src.embeddings.sentence_transformer import SentenceTransformerEmbedding
from src.rag.transaction_rag import TransactionRAG

def main():
    # Initialize components
    embedding_model = SentenceTransformerEmbedding()
    vector_store = FaissVectorStore(
        dimension=384,  # Dimension for all-MiniLM-L6-v2
        index_path=Path("data/vector_store/faiss_index")
    )
    
    rag = TransactionRAG(
        vector_store=vector_store,
        embedding_model=embedding_model
    )
    
    # Sample transactions
    transactions = [
        Transaction(
            id="1",
            amount=150.0,
            description="Hotel stay in Miami",
            merchant="Marriott Hotels",
            category="Travel",
            date=datetime(2024, 3, 1),
            location="Miami, Florida"
        ),
        Transaction(
            id="2",
            amount=85.0,
            description="Seafood dinner",
            merchant="Ocean Grill",
            category="Restaurants",
            date=datetime(2024, 3, 2),
            location="Miami Beach, Florida"
        ),
        # Add more transactions...
    ]
    
    # Index transactions
    rag.add_transactions(transactions)
    
    # Example query
    query = "How much did I spend on my trip to Florida in March?"
    response = rag.query(query)
    print(f"Query: {query}")
    print(f"Response: {response}")

if __name__ == "__main__":
    main() 