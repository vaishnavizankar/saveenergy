import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, actionLabel = "Proceed", type = "warning" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">{message}</p>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-4 px-4 font-bold rounded-2xl shadow-xl transition-all text-sm uppercase tracking-widest text-white ${
                  type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-eco-600 hover:bg-eco-700 shadow-eco-500/20'
                }`}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
