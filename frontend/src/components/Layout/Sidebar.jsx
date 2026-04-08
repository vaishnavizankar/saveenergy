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
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Resources', icon: <Server size={20} />, path: '/resources' },
    { name: 'Carbon Footprint', icon: <Leaf size={20} />, path: '/carbon' },
    { name: 'Cost Optimization', icon: <DollarSign size={20} />, path: '/cost' },
    { name: 'Recommendations', icon: <Lightbulb size={20} />, path: '/recommendations' },
    { name: 'Analytics Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-eco-800 text-white flex flex-col z-40 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-2xl lg:shadow-none'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-lg">
            <Leaf className="text-eco-600" size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SaveEnergy</h1>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-eco-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-eco-600 text-white shadow-lg shadow-eco-900/20' 
                  : 'text-eco-100 hover:bg-eco-700 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-eco-300 group-hover:text-eco-100'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-white/10 rounded-2xl border border-white/5">
        <div className="flex items-center space-x-2 mb-2 text-xs text-white/60">
          <ShieldCheck size={14} />
          <span>Security Level: High</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Compliance</span>
          <span className="text-xs font-bold text-eco-400 bg-eco-400/10 px-2 py-0.5 rounded-full">Pass</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
