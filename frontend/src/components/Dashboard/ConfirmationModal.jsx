import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, actionLabel = "Proceed", type = "warning" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-6xl shadow-elevated w-full max-w-lg overflow-hidden border border-white/40"
          >
            {/* Header / Accent Bar */}
            <div className={`h-2 w-full ${type === 'danger' ? 'bg-red-500' : type === 'success' ? 'bg-eco-500' : 'bg-amber-500'}`}></div>

            <div className="p-10 md:p-14">
              <div className="flex justify-between items-start mb-10">
                <div className={`p-5 rounded-3xl shadow-sm ${
                  type === 'danger' ? 'bg-red-50 text-red-500' : 
                  type === 'success' ? 'bg-eco-50 text-eco-600' : 
                  'bg-amber-50 text-amber-500'
                }`}>
                  {type === 'danger' ? <ShieldAlert size={32} /> : 
                   type === 'success' ? <CheckCircle2 size={32} /> : 
                   <AlertTriangle size={32} />}
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 order-2 sm:order-1 btn-secondary py-5 text-sm uppercase tracking-widest font-black"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 order-1 sm:order-2 py-5 rounded-3xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    type === 'danger' 
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                      : 'bg-eco-600 hover:bg-eco-700 shadow-eco-500/30'
                  }`}
                >
                   {actionLabel}
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operation protected by GreenOps Protocol</p>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
