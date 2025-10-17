'use client';

import { useState } from 'react';
import { Plus, Search, Network, MessageSquare, FileText, X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickActionsMenuProps {
  onNewNote?: () => void;
  onSearch?: () => void;
  onGraphView?: () => void;
  onAIChat?: () => void;
  onCommandPalette?: () => void;
  onKeyboardHelp?: () => void;
}

export function QuickActionsMenu({
  onNewNote,
  onSearch,
  onGraphView,
  onAIChat,
  onCommandPalette,
  onKeyboardHelp,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: FileText,
      label: 'New Note',
      onClick: onNewNote,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: Search,
      label: 'Search',
      onClick: onSearch,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: Network,
      label: 'Graph View',
      onClick: onGraphView,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: MessageSquare,
      label: 'AI Chat',
      onClick: onAIChat,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      icon: Keyboard,
      label: 'Shortcuts',
      onClick: onKeyboardHelp,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const handleActionClick = (action: (typeof actions)[0]) => {
    action.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 mb-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleActionClick(action)}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
                  ${action.color} text-white
                  transition-all duration-200
                `}
                title={action.label}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-lg
          ${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          text-white transition-colors duration-200
        `}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
