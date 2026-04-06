import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, unit, icon, trend, trendValue, color = "eco" }) => {
  const isPositive = trend === 'up';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-48 transition-all hover:bg-white/80 group"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl bg-${color}-100 text-${color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPositive ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{title}</p>
        <div className="flex items-baseline space-x-1 mt-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h2>
          <span className="text-sm font-bold text-gray-400">{unit}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-50 group-hover:border-gray-100 transition-colors">
        <div className={`h-1 w-full bg-${color}-50 rounded-full overflow-hidden`}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            className={`h-full bg-${color}-500 shadow-[0_0_8px_rgba(22,163,74,0.3)]`}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
