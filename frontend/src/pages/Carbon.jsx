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
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Carbon = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await metricService.getTimeSeries(7); // 7 days
        // Transform for recharts
        const transform = res.data.map(item => ({
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: item.carbon
        }));
        setHistory(transform);
      } catch (err) {
        console.error("Failed to fetch carbon history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const emissionStats = [
    { label: 'CO2e Intensity', value: '0.41', unit: 'kg/kWh', icon: <Wind size={20} />, color: 'emerald' },
    { label: 'Grid Renewable%', value: '28.4', unit: '%', icon: <MapPin size={20} />, color: 'blue' },
    { label: 'Cloud Water Usage', value: '1.2', unit: 'L / GB', icon: <CloudRain size={20} />, color: 'teal' },
  ];

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Environmental Impact</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Sustainability & Carbon Emissions Tracker</p>
        </div>
        
        <div className="flex bg-eco-50 p-1.5 rounded-2xl border border-eco-100">
          <button className="bg-white text-eco-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm tracking-widest">7 DAYS</button>
          <button className="text-gray-400 px-4 py-2 rounded-xl text-xs font-black tracking-widest hover:text-eco-600 transition-colors uppercase">30 DAYS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <LiveLineChart 
            data={history} 
            title="Carbon Footprint History (kg CO₂e)" 
            unit="kg" 
            color="#10b981"
          />
        </div>

        {/* Regional Impact */}
        <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Regional Carbon Intensity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm"><MapPin size={16} /></div>
                  <span className="text-sm font-bold text-emerald-800">us-east-1 (N. Virginia)</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">0.40 kg/kWh</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><MapPin size={16} /></div>
                  <span className="text-sm font-bold text-gray-600">eu-west-1 (Ireland)</span>
                </div>
                <span className="text-xs font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">0.25 kg/kWh</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><MapPin size={16} /></div>
                  <span className="text-sm font-bold text-gray-600">us-west-2 (Oregon)</span>
                </div>
                <span className="text-xs font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">0.30 kg/kWh</span>
              </div>
            </div>
          </div>
          
          <button className="mt-8 text-eco-600 font-bold text-sm flex items-center justify-center space-x-2 bg-eco-50 py-4 rounded-2xl border border-eco-100 hover:bg-eco-100 transition-all group">
            <span>Learn About Green Migration</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emissionStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h4>
              <span className="text-xs font-bold text-gray-400">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Carbon;
