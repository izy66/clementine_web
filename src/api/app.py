from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path
import sys
from os.path import abspath, dirname
from datetime import datetime
from src.services.storage.transaction_storage import TransactionStorage

# Add project root to Python path
project_root = dirname(dirname(dirname(abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.rag.transaction_rag import TransactionRAG
from src.vector_store.faiss_store import FaissVectorStore
from src.embeddings.sentence_transformer import SentenceTransformerEmbedding

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize RAG components
embedding_model = SentenceTransformerEmbedding()
vector_store = FaissVectorStore(
    dimension=384,
    index_path=Path("data/vector_store/faiss_index")
)
rag = TransactionRAG(
    vector_store=vector_store,
    embedding_model=embedding_model
)

# Initialize storage
transaction_storage = TransactionStorage()

@app.route('/api/transactions/query', methods=['POST'])
def query_transactions():
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
        
    try:
        response = rag.query(query)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/sync', methods=['POST'])
def sync_transactions():
    try:
        data = request.json
        transactions = data.get('transactions', [])
        
        # Save transactions to backend storage
        for transaction in transactions:
            transaction_storage.add_transaction(transaction)
            
        # Return all transactions
        all_transactions = transaction_storage.load_transactions()
        return jsonify({'transactions': all_transactions})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 