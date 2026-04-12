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
          value: item.cost * 24 * 83.5 // Convert to INR
        }));
        setHistory(transform);

        const breakRes = await metricService.getCostBreakdown();
        // Convert breakdown costs to INR
        const inrBreakdown = breakRes.data.breakdown.map(item => ({
          ...item,
          cost: item.cost * 83.5
        }));
        setBreakdown(inrBreakdown);
        setTotalHourly(breakRes.data.total_hourly_cost * 83.5);
        setAnomalies((breakRes.data.anomalies || []).map(a => ({
          ...a,
          amount: (a.amount * 83.5).toFixed(2)
        })));
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
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    // Detailed CSV Structure
    const content = [
      ["GREENOPS INFRASTRUCTURE COST AUDIT"],
      ["Export Date (IST)", timestamp],
      ["Currency", "INR"],
      ["Exchange Rate", "1 USD = 83.50 INR"],
      ["Status", "AWS Billing Integration Active"],
      [""], // Spacer
      ["--- HOURLY SERVICE BREAKDOWN ---"],
      ["Cloud Service", "Resource Type", "Hourly Rate (INR/hr)", "Monthly Projection (Projected INR)"],
      ...breakdown.map(item => [
        item.service, 
        "AWS Managed Instance", 
        item.cost.toFixed(2), 
        (item.cost * 24 * 30).toFixed(0)
      ]),
      [""], // Spacer
      ["--- TOTAL OPERATING SUMMARY ---"],
      ["Total Hourly Cost", "", `₹${totalHourly.toFixed(2)}`, "INR/hr"],
      ["Total Monthly Spend (Est)", "", `₹${(totalHourly * 24 * 30).toFixed(0)}`, "INR/mo"],
      ["Efficiency Potential (IA)", "", "22%", "Projected Savings"],
      [""], // Spacer
      ["--- 30-DAY HISTORICAL TREND ---"],
      ["Archive Date", "Data Source", "Consolidated Daily Spend", "Unit"],
      ...history.map(item => [
        item.time, 
        "CloudWatch Billing Metrics", 
        item.value.toFixed(2), 
        "INR"
      ]),
      [""],
      ["END OF ARCHIVE DOC"],
    ];

    const csvContent = content.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Detailed_GreenOps_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const costCards = [
    { title: 'Hourly Operating Cost', value: `₹${totalHourly.toFixed(2)}`, unit: 'Per Hour', icon: <Activity size={20} />, trend: 'down', trendVal: '4.2', color: 'blue' },
    { title: 'Projected Monthly', value: `₹${(totalHourly * 24 * 30).toFixed(0)}`, unit: 'Rolling 30 Days', icon: <TrendingUp size={20} />, trend: 'up', trendVal: '2.1', color: 'indigo' }
  ];

  return (
    <div className="page-enter bg-slate-50/50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Cost Intelligence</h2>
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
              className="btn-secondary px-8 py-4 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm"
            >
              <FileDown size={18} className="text-blue-600" />
              <span>Export Analytics</span>
            </motion.button>
            <div className="glass px-6 py-4 rounded-2xl border border-white flex items-center gap-3 shadow-sm bg-white/40">
               <Calendar size={16} className="text-blue-600" />
               <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  {new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}
               </span>
            </div>
          </div>
        </div>

        {/* Responsive Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Metric Cards - Row 1 */}
          {costCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="card-premium p-8 h-52 flex flex-col justify-between bg-white shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                  {card.icon}
                </div>
                {card.trend && (
                   <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${card.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <span>{card.trendVal}%</span>
                   </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.title}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{card.value}</h4>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Main Analytics Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="card-premium p-0 overflow-hidden bg-white">
              <LiveLineChart 
                data={history} 
                title="30-Day Spending Trajectory" 
                unit="₹" 
                color="#3b82f6"
              />
            </div>

            <div className="card-premium p-10 bg-white shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cost Distribution</h3>
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
                    className="flex items-center justify-between p-7 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-glow-blue"></div>
                      <p className="text-xs font-black text-slate-900 tracking-tighter uppercase">{item.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 tabular-nums">₹{item.cost.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-[35px]">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic text-center mx-auto">Syncing live distribution data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cost;
