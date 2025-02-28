from flask import request, jsonify
from flask import app

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