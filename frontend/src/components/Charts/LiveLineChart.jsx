import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  defs,
  linearGradient,
  stop
} from 'recharts';

const LiveLineChart = ({ data, color = "#16a34a", title, unit }) => {
  return (
    <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 h-96 group hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h3>
          <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-widest leading-none">Real-time Performance Metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Live Monitor</span>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              domain={[0, 'auto']}
              unit={unit}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LiveLineChart;
