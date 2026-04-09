import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Leaf, 
  DollarSign, 
  Lightbulb, 
  BarChart3, 
  Settings,
  X,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Resources', icon: <Server size={20} />, path: '/resources' },
    { name: 'Carbon Footprint', icon: <Leaf size={20} />, path: '/carbon' },
    { name: 'Cost Optimization', icon: <DollarSign size={20} />, path: '/cost' },
    { name: 'Recommendations', icon: <Lightbulb size={20} />, path: '/recommendations' },
    { name: 'Analytics Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-72 sidebar-gradient text-white flex flex-col z-40 transition-all duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none border-r border-white/5`}>
      {/* Brand Section */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="bg-white p-2 rounded-2xl shadow-glow-eco shadow-white/10"
          >
            <Leaf className="text-eco-600" size={26} fill="currentColor" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-eco-200 bg-clip-text text-transparent">SaveEnergy</h1>
            <p className="text-[10px] font-bold text-eco-400 uppercase tracking-widest mt-0.5 opacity-80">GreenOps Core</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto scrollbar-hide py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center group relative px-4 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-eco-100/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1.5 h-6 bg-eco-400 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={`transition-all duration-300 mr-4 ${isActive ? 'text-eco-400 scale-110' : 'text-eco-200/50 group-hover:text-eco-300'}`}>
                {item.icon}
              </span>
              <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium opacity-80 group-hover:opacity-100'}`}>{item.name}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto text-eco-400/50" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 transition-hover hover:bg-white/10 group cursor-default">
          <p className="text-[10px] font-black text-eco-400 uppercase tracking-widest mb-1.5 opacity-80">Status Indicator</p>
          <div className="flex items-center gap-3">
            <div className="flex relative">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-eco-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-eco-500"></span>
            </div>
            <span className="text-xs font-bold text-white tracking-wide">Live Infrastructure</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
