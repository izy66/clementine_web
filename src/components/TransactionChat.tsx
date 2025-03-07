import React, { useState } from 'react';
import ChatBox from './ChatBox';
import { Message } from '../types/chat';
import { motion } from 'framer-motion';
import { Transaction } from '../types/transaction';

interface TransactionChatProps {
  transactions: Transaction[];
}

const TransactionChat: React.FC<TransactionChatProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you analyze your transactions. Ask me anything about your spending!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Make API call
      const response = await fetch('/api/transactions/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">AI Assistant</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500">
          AI assistant is coming soon. You'll be able to ask questions about your 
          {transactions.length > 0 ? ` ${transactions.length} transactions` : ' finances'}.
        </p>
      </div>
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default TransactionChat; 