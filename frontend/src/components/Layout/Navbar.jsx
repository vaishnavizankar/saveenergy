import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Search, 
  Clock, 
  LogOut, 
  Menu,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-surface-50/80 border-b border-slate-200/60 flex items-center justify-between px-6 md:px-12 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-3 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200/50 shadow-sm active:scale-95"
        >
          <Menu size={22} />
        </button>

      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        {/* Platform Status (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 border-r border-slate-200 pr-8">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Sync</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock size={14} className="text-eco-600" />
                <span>{time.toISOString().split('T')[1].substring(0, 8)} UTC</span>
              </div>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Region</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Globe size={14} className="text-eco-600" />
                <span>Multi-Cloud</span>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="relative p-3 text-slate-600 hover:bg-white hover:text-eco-600 border border-transparent hover:border-slate-200 rounded-2xl transition-all shadow-hover:shadow-glow-blue group">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface-50 group-hover:scale-110 transition-transform"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 md:bg-white md:border border-slate-200 rounded-2xl transition-all hover:shadow-card active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-eco-100 to-eco-200 flex items-center justify-center text-eco-700 shadow-inner group-hover:scale-105 transition-transform">
                <User size={20} />
              </div>
              <div className="hidden xs:flex flex-col items-start text-left">
                <span className="text-sm font-bold text-slate-800 leading-none">Admin User</span>
                <span className="text-[10px] font-bold text-eco-600 uppercase tracking-tighter mt-1">Superuser access</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 glass border border-slate-200 rounded-3xl shadow-elevated p-2 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 mb-1">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Environment</p>
                    <p className="text-sm font-bold text-slate-800">Production Mode</p>
                  </div>
                  <button 
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-2xl transition-all group"
                  >
                    <User size={18} className="text-slate-400 group-hover:text-eco-600" />
                    <span>My Account</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all group mt-1"
                  >
                    <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
