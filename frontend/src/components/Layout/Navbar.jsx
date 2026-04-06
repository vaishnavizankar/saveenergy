import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Search, 
  Clock, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
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
    <header className="h-16 glass fixed top-0 right-0 left-64 border-b border-gray-200 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4 bg-gray-100 px-4 py-2 rounded-full w-96 group transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-eco-500/20 shadow-sm border-transparent focus-within:border-eco-500/30 border">
        <Search size={18} className="text-gray-400 group-focus-within:text-eco-600" />
        <input 
          type="text" 
          placeholder="Search resources, reports..." 
          className="bg-transparent border-none outline-none text-sm w-full font-medium"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Clock size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {time.toISOString().split('T')[0]} {time.toISOString().split('T')[1].substring(0, 5)} UTC
          </span>
        </div>

        <button className="text-gray-500 hover:text-eco-600 transition-colors p-2 hover:bg-eco-50 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-800">Admin User</span>
            <span className="text-[10px] font-bold text-eco-600 uppercase tracking-tighter">GreenOps Admin</span>
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
