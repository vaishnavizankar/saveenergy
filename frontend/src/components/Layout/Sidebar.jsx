import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Leaf, 
  DollarSign, 
  Lightbulb, 
  BarChart3, 
  Settings,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Resources', icon: <Server size={20} />, path: '/resources' },
    { title: 'Carbon Footprint', icon: <Leaf size={20} />, path: '/carbon' },
    { title: 'Cost Optimization', icon: <DollarSign size={20} />, path: '/cost' },
    { title: 'Recommendations', icon: <Lightbulb size={20} />, path: '/recommendations' },
    { title: 'Analytics Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen sidebar-gradient text-white flex flex-col fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-white p-1.5 rounded-lg">
          <Leaf className="text-eco-600" size={24} fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">GreenOps</h1>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-white/20 text-white font-medium shadow-sm' 
                : 'text-white/70 hover:bg-white/10 hover:text-white'}
            `}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
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
    </div>
  );
};

export default Sidebar;
