import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Search, 
  Clock, 
  LogOut, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const [time, setTime] = useState(new Date());
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
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 backdrop-blur-md bg-white/80">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resources, reports..." 
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm w-64 lg:w-80 focus:ring-2 focus:ring-eco-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 lowercase tracking-tight">
            {time.toISOString().split('T')[0]} {time.toISOString().split('T')[1].substring(0, 5)} UTC
          </span>
        </div>

        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center space-x-2 md:space-x-3 group cursor-pointer border-l border-gray-100 pl-3 md:pl-6">
          <div className="hidden xs:flex flex-col items-end">
            <span className="text-sm font-bold text-gray-800">Admin User</span>
            <span className="text-[10px] font-bold text-eco-600 uppercase tracking-tighter">SaveEnergy Admin</span>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-eco-100 flex items-center justify-center text-eco-600 group-hover:bg-eco-200 transition-colors shadow-sm">
              <User size={20} />
            </div>
            <button 
              onClick={handleLogout}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-100 p-1 rounded-lg text-red-500 shadow-sm hover:bg-red-50 hover:border-red-100 transition-all"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
