import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-surface-50 min-h-screen overflow-x-hidden font-sans selection:bg-eco-100 selection:text-eco-900">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 lg:ml-72 min-h-[calc(100vh-80px)]">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
          
          {/* Footer Branding */}
          <footer className="mt-12 py-8 px-10 lg:ml-72 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1600px] mx-auto">
              <div className="flex items-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8h-5a4 4 0 0 0-8 0t8 0v2a4 4 0 0 1-8 0v-2"/><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">GreenOps Protocol</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                © 2026 Core Infrastructure. Built for Sustainability.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
