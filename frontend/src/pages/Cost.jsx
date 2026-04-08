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
  ShieldAlert
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
        // Fetch history for chart
        const histRes = await metricService.getTimeSeries(30);
        const transform = histRes.data.map(item => ({
          time: new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          value: item.cost * 24 
        }));
        setHistory(transform);

        // Fetch real-time breakdown (Requirement: Breakdown by service)
        const breakRes = await metricService.getCostBreakdown();
        setBreakdown(breakRes.data.breakdown);
        setTotalHourly(breakRes.data.total_hourly_cost);
        setAnomalies(breakRes.data.anomalies || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Requirement: Automatically update every 5 minutes
    const interval = setInterval(fetchData, 300000); 
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    // 1. Define Headers
    const headers = ["Source/Service", "Type", "Amount", "Unit"];
    
    // 2. Map Breakdown Data
    const breakdownRows = breakdown.map(item => [
      item.service,
      "Active Usage",
      item.cost.toFixed(3),
      "USD/hr"
    ]);

    // 3. Map History Data
    const historyRows = history.map(item => [
      item.time,
      "Daily Total",
      item.value.toFixed(2),
      "USD"
    ]);

    // 4. Combine and Format
    const csvContent = [
      headers.join(","),
      ...breakdownRows.map(row => row.join(",")),
      ...historyRows.map(row => row.join(","))
    ].join("\n");

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `saveenergy_cost_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const costCards = [
    { title: 'Hourly Running Cost', value: `$${totalHourly.toFixed(3)}`, unit: 'Per Hour', icon: <Activity size={20} />, trend: 'down', trendVal: '4.2', color: 'blue' },
    { title: 'Forecasted Month', value: `$${(totalHourly * 24 * 30).toFixed(2)}`, unit: 'Next 30 Days', icon: <TrendingUp size={20} />, trend: 'up', trendVal: '2.1', color: 'indigo' },
    { title: 'Anomalies Detected', value: anomalies.length.toString(), unit: 'Last 7 Days', icon: <ShieldAlert size={20} />, trend: 'up', trendVal: '12', color: 'amber' },
  ];

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cost Management</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">AWS Cost Explorer & CloudWatch Integration</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center space-x-2 shadow-sm hover:shadow-md transition-all text-xs font-black tracking-widest text-gray-600"
          >
            <FileDown size={16} className="text-eco-600" />
            <span>EXPORT CSV</span>
          </button>
          <div className="bg-eco-50 p-1.5 rounded-2xl border border-eco-100 flex items-center">
            <Calendar size={14} className="ml-2 text-eco-600" />
            <span className="px-4 py-2 text-xs font-black text-eco-700 tracking-widest uppercase">
              {new Date().toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {costCards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2.5 rounded-xl bg-${card.color}-100 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${card.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{card.trendVal}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{card.title}</p>
              <div className="flex items-baseline space-x-1">
                <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">{card.value}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{card.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <LiveLineChart 
            data={history} 
            title="Spending Forecast Trend" 
            unit="$" 
            color="#3b82f6"
          />

          {/* Requirement: Breakdown by service */}
          <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6 flex items-center space-x-2">
              <BarChart size={20} className="text-eco-600" />
              <span>Breakdown by Service</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{item.service}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-gray-900">${item.cost.toFixed(3)}/hr</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Active Usage</span>
                  </div>
                </div>
              ))}
              {breakdown.length === 0 && (
                <div className="col-span-2 py-8 text-center text-gray-400 text-sm font-medium italic">
                  No active service breakdown available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Requirement: Highlight cost spikes or anomalies */}
          <div className="glass p-8 rounded-3xl shadow-sm border border-amber-100/50 bg-amber-50/10">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center space-x-2">
              <AlertCircle size={20} className="text-amber-500" />
              <span>Anomalies</span>
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {anomalies.map((anom, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-white rounded-2xl border border-amber-100 shadow-sm flex items-start space-x-3"
                  >
                    <div className="bg-amber-100 p-2 rounded-xl text-amber-600 mt-1">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{anom.service} Spike</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed font-medium">Detected unusual spend increase of <span className="font-bold text-amber-600">${anom.amount}</span> on {anom.date}.</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {anomalies.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ShieldAlert size={32} className="text-eco-300 mb-2" />
                  <p className="text-xs font-bold text-eco-600 uppercase tracking-widest">System Stable</p>
                  <p className="text-[10px] text-gray-400 mt-1">No cost anomalies detected</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center space-x-2">
                <Target size={20} className="text-eco-600" />
                <span>Budget Status</span>
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">Integration with <span className="text-eco-600 font-bold">AWS Budgets</span> active. Monitoring daily spend against $150 limit.</p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>Usage to date</span>
                    <span className="text-gray-900">$2,840 / $4,000</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "71%" }}
                      className="h-full bg-eco-500 shadow-[0_0_8px_rgba(22,163,74,0.3)] transition-all duration-1000"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transform active:scale-95 transition-all flex items-center justify-center space-x-2 group">
              <span>Setup Budget Alerts</span>
              <Activity size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cost;
