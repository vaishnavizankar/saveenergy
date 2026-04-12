import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';

const LiveLineChart = ({ data, color = "#16a34a", title, unit }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-premium p-10 h-[450px] group relative"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-1.5 tracking-[0.2em] leading-none opacity-80 flex items-center gap-2">
            Real-time Telemetry Processing
            <span className="inline-block w-4 h-[1px] bg-slate-200"></span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/50 px-4 py-2 rounded-2xl shadow-sm">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Live Engine</span>
        </div>
      </div>
      
      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="4 4" 
              vertical={false} 
              stroke="#e2e8f0" 
              strokeOpacity={0.6}
            />
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
              domain={[0, 'auto']}
              tickFormatter={(val) => {
                if (unit === '₹') return `₹${val.toLocaleString('en-IN')}`;
                return `${val.toFixed(val < 1 ? 3 : 1)} ${unit}`;
              }}
              allowDecimals={true}
              width={80}
            />
            <Tooltip 
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass shadow-elevated rounded-2xl p-4 border border-white/50 animate-scale-in">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.time}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900">{payload[0].value.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorArea)" 
              animationDuration={1500}
              animationEasing="ease-in-out"
              activeDot={{ r: 6, strokeWidth: 0, fill: color, className: 'shadow-glow-eco' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Overlay */}
      <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between opacity-40">
         <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
         <span className="px-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Multi-cluster Visibility</span>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      </div>
    </motion.div>
  );
};

export default LiveLineChart;
