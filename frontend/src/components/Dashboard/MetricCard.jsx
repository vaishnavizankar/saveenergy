import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, unit, icon, trend, trendValue, color = "eco" }) => {
  const isPositive = trend === 'up';
  
  // Dynamic color mapping based on design tokens
  const colorMap = {
    eco: { bg: 'bg-eco-50', text: 'text-eco-600', border: 'border-eco-100', glow: 'shadow-eco-500/10' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', glow: 'shadow-emerald-500/10' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', glow: 'shadow-blue-500/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', glow: 'shadow-amber-500/10' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', glow: 'shadow-indigo-500/10' },
  };

  const currentTheme = colorMap[color] || colorMap.eco;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="glass p-8 rounded-5xl shadow-card border border-white hover:border-slate-200 flex flex-col justify-between h-56 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${currentTheme.bg}`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${currentTheme.bg} ${currentTheme.text} shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
          {icon}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isPositive ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">{value}</h2>
          <span className="text-xs font-bold text-slate-400 tracking-wide">{unit}</span>
        </div>
      </div>
      
      <div className="mt-6 pt-5 border-t border-slate-50/50 group-hover:border-slate-100 transition-colors relative z-10">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Benchmark</span>
           <span className="text-[9px] font-black text-eco-600 uppercase tracking-tighter">Above Target</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "78%" }}
            transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
            className={`h-full bg-gradient-to-r from-transparent to-current ${currentTheme.text} shadow-[0_0_12px_rgba(34,197,94,0.3)] bg-current opacity-80`}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
