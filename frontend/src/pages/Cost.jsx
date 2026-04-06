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
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Cost = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await metricService.getTimeSeries(30); // 30 days
        // Transform for recharts
        const transform = res.data.map(item => ({
          time: new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          value: item.cost * 24 // Estimate daily
        }));
        setHistory(transform);
      } catch (err) {
        console.error("Failed to fetch cost history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const costCards = [
    { title: 'Current Spend', value: '$2,840', unit: 'Month-to-Date', icon: <CreditCard size={20} />, trend: 'down', trendVal: '4.2', color: 'blue' },
    { title: 'Forecasted', value: '$3,412', unit: 'Next 30 Days', icon: <TrendingUp size={20} />, trend: 'up', trendVal: '2.1', color: 'indigo' },
    { title: 'Waste Detected', value: '$412', unit: 'Idle Capacity', icon: <AlertCircle size={20} />, trend: 'up', trendVal: '12', color: 'amber' },
  ];

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cost Intelligence</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">AWS Infrastructure Billing & Optimization</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center space-x-2 shadow-sm hover:shadow-md transition-all text-xs font-black tracking-widest text-gray-600">
            <FileDown size={16} className="text-eco-600" />
            <span>EXPORT CSV</span>
          </button>
          <div className="bg-eco-50 p-1.5 rounded-2xl border border-eco-100 flex items-center">
            <Calendar size={14} className="ml-2 text-eco-600" />
            <span className="px-4 py-2 text-xs font-black text-eco-700 tracking-widest">MAR 2026 - APR 2026</span>
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
        <div className="lg:col-span-2">
          <LiveLineChart 
            data={history} 
            title="Spending Forecast Analysis" 
            unit="$" 
            color="#3b82f6"
          />
        </div>

        <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 h-96 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center space-x-2">
              <Target size={20} className="text-eco-600" />
              <span>Budget Alignment</span>
            </h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">You are currently <span className="text-eco-600 font-bold">12% below</span> your monthly allocated cloud budget.</p>
            
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

              <div>
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  <span>Predicted End of Month</span>
                  <span className="text-amber-500">$3,620</span>
                </div>
                <div className="h-0.5 w-full border-t border-dashed border-gray-300"></div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transform active:scale-95 transition-all flex items-center justify-center space-x-2 group">
            <span>Configure Alerts</span>
            <AlertCircle size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cost;
