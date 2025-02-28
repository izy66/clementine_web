import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, onPanelChange }) => {
  const navItems = [
    { id: 'visual', icon: '📊', label: 'Insights' },
    { id: 'history', icon: '📝', label: 'History' },
    { id: 'assistant', icon: '🤖', label: 'AI Assistant' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Clementine</h1>
        <p className="text-sm text-gray-500">AI Budget Assistant</p>
      </div>
      
      <nav className="mt-6">
        {navItems.map(item => (
          <motion.button
            key={item.id}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPanelChange(item.id)}
            className={`w-full px-6 py-4 flex items-center space-x-4 text-left
              ${activePanel === item.id 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 