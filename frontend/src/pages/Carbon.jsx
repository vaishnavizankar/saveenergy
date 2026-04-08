import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  MapPin, 
  Wind, 
  CloudRain, 
  Activity, 
  Calendar,
  ChevronRight,
  TrendingDown,
  Info,
  Globe,
  Sun,
  Droplets,
  Trees
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Carbon = () => {
  const [viewMode, setViewMode] = useState('realtime');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCarbon, setLiveCarbon] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const days = viewMode === 'historical' ? 30 : 1;
        const [histRes, liveRes] = await Promise.all([
          metricService.getTimeSeries(days),
          metricService.getLive()
        ]);

        const transform = histRes.data.map(item => ({
          time: viewMode === 'historical' 
            ? new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: item.carbon
        }));
        setHistory(transform);
        setLiveCarbon(liveRes.data.total_carbon_h);
      } catch (err) {
        console.error("Failed to fetch carbon data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, viewMode === 'realtime' ? 30000 : 3600000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const emissionStats = [
    { label: 'CO2e Intensity', value: '0.41', unit: 'kg/kWh', icon: <Wind size={20} />, color: 'emerald', description: 'Real-time grid intensity' },
    { label: 'Renewable Mix', value: '31.2', unit: '%', icon: <Sun size={20} />, color: 'blue', description: 'Avg grid renewable energy' },
    { label: 'Water Usage', value: '1.24', unit: 'L / GB', icon: <Droplets size={20} />, color: 'teal', description: 'Cooling efficiency' },
  ];

  const colorMaps = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100"
  };

  return (
    <div className="pt-24 px-8 pb-12 fade-in font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
            Environmental Impact
            <div className="ml-4 p-2 bg-eco-50 border border-eco-100 rounded-xl group hover:scale-110 transition-transform">
              <Leaf className="text-eco-600 w-6 h-6 animate-pulse" />
            </div>
          </h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center">
            <Globe size={14} className="mr-2 text-eco-500" />
            Monitoring Global Grid Footprint
          </p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xl shadow-gray-900/5">
          <button 
            onClick={() => setViewMode('realtime')}
            className={`${viewMode === 'realtime' ? 'bg-eco-600 text-white shadow-lg shadow-eco-600/20' : 'text-gray-400 hover:text-eco-600'} px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all transform active:scale-95`}
          >
            REAL-TIME
          </button>
          <button 
            onClick={() => setViewMode('historical')}
            className={`${viewMode === 'historical' ? 'bg-eco-600 text-white shadow-lg shadow-eco-600/20' : 'text-gray-400 hover:text-eco-600'} px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all transform active:scale-95`}
          >
            HISTORICAL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        <div className="lg:col-span-3">
          <LiveLineChart 
            data={history} 
            title="Carbon Footprint History (kg CO₂e)" 
            unit="kg" 
            color="#10b981"
          />
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-1/2 flex flex-col justify-center items-center text-center overflow-hidden relative group">
            <div className="absolute -top-4 -right-4 text-eco-50 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Trees size={160} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Emission Rate</p>
              <h4 className="text-5xl font-black text-gray-900 tracking-tighter mb-1">
                {liveCarbon.toFixed(2)}
              </h4>
              <p className="text-[10px] font-black text-eco-600 uppercase tracking-widest">kg CO₂e / hour</p>
              
              <div className="mt-8 flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-emerald-700">
                <TrendingDown size={14} />
                <span className="text-[10px] font-black uppercase tracking-tighter">-4.2% Today</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-1/2 flex flex-col justify-between">
            <h3 className="text-sm font-black text-gray-900 tracking-widest uppercase border-b border-gray-50 pb-4">Top Regions</h3>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">us-east-1</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">High Efficiency</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">eu-west-1</span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Low Intensity</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">us-west-2</span>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Standard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {emissionStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-4 rounded-2xl ${colorMaps[stat.color]} group-hover:scale-110 transition-transform shadow-sm border`}>
                {stat.icon}
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">{stat.description}</p>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <h4 className="text-5xl font-black text-gray-900 tracking-tighter">{stat.value}</h4>
              <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.unit}</span>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-50">
              <button className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-eco-600 transition-colors uppercase tracking-[0.1em]">
                <span>Analysis Insights</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Carbon;
