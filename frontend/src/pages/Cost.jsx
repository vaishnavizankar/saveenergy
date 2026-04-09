import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart, 
  Target, 
  CreditCard, 
  AlertCircle,
  FileDown,
  Clock,
  ArrowRight,
  Calendar,
  Activity,
  ShieldAlert,
  ChevronRight,
  Search,
  ZapOff,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Cost = () => {
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [totalHourly, setTotalHourly] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const histRes = await metricService.getTimeSeries(30);
        const transform = histRes.data.map(item => ({
          time: new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          value: item.cost * 24 
        }));
        setHistory(transform);

        const breakRes = await metricService.getCostBreakdown();
        setBreakdown(breakRes.data.breakdown);
        setTotalHourly(breakRes.data.total_hourly_cost);
        setAnomalies(breakRes.data.anomalies || []);
      } catch (err) {
        console.error("Cost data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000); 
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    const headers = ["Source/Service", "Type", "Amount", "Unit"];
    const breakdownRows = breakdown.map(item => [item.service, "Active Usage", item.cost.toFixed(3), "USD/hr"]);
    const historyRows = history.map(item => [item.time, "Daily Total", item.value.toFixed(2), "USD"]);
    const csvContent = [headers.join(","), ...breakdownRows.map(row => row.join(",")), ...historyRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `greenops_cost_audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const costCards = [
    { title: 'Hourly Operating Cost', value: `$${totalHourly.toFixed(3)}`, unit: 'Per Hour', icon: <Activity size={20} />, trend: 'down', trendVal: '4.2', color: 'blue' },
    { title: 'Projected Monthly', value: `$${(totalHourly * 24 * 30).toFixed(2)}`, unit: 'Rolling 30 Days', icon: <TrendingUp size={20} />, trend: 'up', trendVal: '2.1', color: 'indigo' },
    { title: 'Cost Anomalies', value: anomalies.length.toString(), unit: 'Unusual Spikes', icon: <ShieldAlert size={20} />, trend: anomalies.length > 0 ? 'up' : null, trendVal: '100', color: 'amber' },
  ];

  return (
    <div className="page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Cost Intelligence</h2>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <CreditCard size={14} className="text-blue-500" />
               <span className="uppercase tracking-widest text-[10px] font-black">AWS Billing Integration Active</span>
             </div>
             <span className="h-4 w-[1px] bg-slate-200"></span>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock size={14} />
                <span className="uppercase tracking-widest text-[10px] font-black">Refreshed every 5m</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="btn-secondary px-8 py-4 text-[10px] font-black uppercase tracking-widest"
          >
            <FileDown size={18} className="text-blue-600" />
            <span>Export Analytics</span>
          </motion.button>
          <div className="glass px-6 py-4 rounded-2xl border border-white flex items-center gap-3 shadow-sm">
             <Calendar size={16} className="text-blue-600" />
             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                {new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {costCards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="card-premium p-8 h-52 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600 shadow-sm transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              {card.trend && (
                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${card.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{card.trendVal}%</span>
                 </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.title}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{card.value}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-12">
          <LiveLineChart 
            data={history} 
            title="30-Day Spending Trajectory" 
            unit="$" 
            color="#3b82f6"
          />

          <div className="card-premium p-12 bg-white/40">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Cost Distribution</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Consumption by Cloud Service</p>
               </div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100">
                  <BarChart size={24} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {breakdown.length > 0 ? breakdown.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-7 bg-white/80 rounded-[35px] border border-slate-100/50 shadow-sm hover:shadow-card-hover transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-glow-blue group-hover:scale-125 transition-transform"></div>
                    <div>
                        <p className="text-sm font-black text-slate-900 tracking-tighter uppercase">{item.service}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Asset utilization active</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900 tracking-tight tabular-nums">${item.cost.toFixed(3)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">USD per hour</p>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 py-16 text-center glass rounded-[35px] border-dashed border-2 border-slate-200">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Syncing live distribution data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="card-premium p-10 bg-amber-50/50 border border-amber-100 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity transform -rotate-12 duration-1000 scale-150">
               <AlertCircle size={200} className="text-amber-600" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-sm">
                   <Target size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Anomalies</h3>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {anomalies.map((anom, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-white rounded-3xl border border-amber-100/80 shadow-sm flex items-start gap-4 hover:shadow-glow-amber transition-all"
                    >
                      <div className="bg-amber-100/50 p-2.5 rounded-xl text-amber-600 mt-1">
                        <ZapOff size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{anom.service} Spend Spike</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-bold uppercase tracking-tight"> Unidentified increase of <span className="text-amber-600 font-black">${anom.amount}</span> on {anom.date}.</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {anomalies.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center glass rounded-[35px] border border-white/50">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-glow-eco">
                       <ShieldAlert size={36} />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Portfolio Stable</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px]">No anomalous billing activities detected in this cycle.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-slate-900 text-white relative overflow-hidden group h-full">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-45 duration-1000 scale-150">
                <PieChart size={200} />
             </div>
             <div className="relative z-10 flex flex-col h-full">
                <h4 className="text-xl font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Budget Outlook</h4>
                <div className="space-y-8 flex-1">
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Efficiency Potential</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-5xl font-black tracking-tighter text-white">22<span className="text-2xl text-blue-400 ml-1">%</span></span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">Available for cost recovery this month.</p>
                   </div>
                   <div className="pt-8 border-t border-white/5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Top Spender</p>
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white/5 rounded-2xl text-blue-400">
                            <Server size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black uppercase tracking-widest">EC2 Instances</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">64% of total cluster spend</p>
                         </div>
                      </div>
                   </div>
                </div>
                <motion.button 
                   whileHover={{ x: 5 }}
                   className="mt-12 btn-primary bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[2.5rem] border-none font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                   <span>View Savings Panel</span>
                   <ChevronRight size={18} />
                </motion.button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cost;
