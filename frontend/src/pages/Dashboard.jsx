import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Leaf, 
  Activity, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetricCard from '../components/Dashboard/MetricCard';
import LiveLineChart from '../components/Charts/LiveLineChart';
import { metricService } from '../services/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_cost_h: 0.145,
    total_carbon_h: 0.28,
    running_resources: 12,
    idle_resources: 3,
    timestamp: new Date().toISOString()
  });
  
  const [history, setHistory] = useState([
    { time: '09:00', value: 12 },
    { time: '10:00', value: 18 },
    { time: '11:00', value: 15 },
    { time: '12:00', value: 25 },
    { time: '13:00', value: 20 },
    { time: '14:00', value: 30 },
  ]);

  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    // 1. Initial Load
    const fetchSnapshot = async () => {
      try {
        const res = await metricService.getLive();
        setMetrics(res.data);
      } catch (err) {
        console.error("Failed to fetch snapshot:", err);
      }
    };
    fetchSnapshot();

    // 2. WebSocket Real-time Updates
    const ws = new WebSocket('ws://localhost:8000/ws/live');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'LIVE_METRICS') {
        const live = data.data;
        const totalCost = live.reduce((acc, curr) => acc + curr.cost, 0);
        const totalCarbon = live.reduce((acc, curr) => acc + curr.carbon, 0);
        
        setMetrics({
          ...metrics,
          total_cost_h: totalCost,
          total_carbon_h: totalCarbon,
          timestamp: data.timestamp
        });

        // Update history for chart
        setHistory(prev => {
          const newPoint = { 
            time: new Date(data.timestamp).toTimeString().substring(0, 5), 
            value: totalCarbon 
          };
          const next = [...prev, newPoint];
          return next.slice(-10); // Keep last 10 points
        });

        setLastUpdated(0);
      }
    };

    // 3. Counter for "Last updated X seconds ago"
    const timer = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);

    return () => {
      ws.close();
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Eco Dashboard</h2>
          <div className="flex items-center space-x-2 text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit">
            <Activity size={14} className="text-eco-500 animate-pulse" />
            <span>Infrastructure Health: <span className="text-eco-600">Optimal</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Last Synchronization</p>
            <p className="text-xs font-bold text-gray-600 flex items-center justify-end space-x-1">
              <Clock size={12} />
              <span>{lastUpdated}s ago</span>
            </p>
          </div>
          <button className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-eco-100 transition-all text-eco-600">
            <RefreshCcw size={20} className={lastUpdated < 1 ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Hourly Running Cost" 
          value={`$${metrics.total_cost_h.toFixed(3)}`} 
          unit="/ hr" 
          icon={<DollarSign size={24} />} 
          trend="up" 
          trendValue="2.4"
        />
        <MetricCard 
          title="Carbon Intensity" 
          value={metrics.total_carbon_h.toFixed(2)} 
          unit="kg CO₂e" 
          icon={<Leaf size={24} />} 
          color="emerald"
          trend="down" 
          trendValue="1.2"
        />
        <MetricCard 
          title="Active Resources" 
          value={metrics.running_resources} 
          unit="Instances" 
          icon={<Activity size={24} />} 
          color="blue"
        />
        <MetricCard 
          title="Idle Detections" 
          value={metrics.idle_resources} 
          unit="Idle" 
          icon={<AlertCircle size={24} />} 
          color="amber"
          trend="up"
          trendValue="0.0"
        />
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LiveLineChart 
            data={history} 
            title="Carbon Footprint Trends" 
            unit="kg" 
            color="#10b981"
          />
        </div>

        {/* Action Panel */}
        <div className="glass p-8 rounded-3xl shadow-sm border border-gray-100 h-96 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <TrendingDown size={18} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Optimization Center</h3>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              We've identified <span className="text-amber-600 font-bold">{metrics.idle_resources} resources</span> with zero utilization over the last 24h.
            </p>
          </div>

          <div className="bg-eco-50/50 p-5 rounded-2xl border border-eco-100">
            <p className="text-xs font-black text-eco-600 uppercase tracking-widest mb-1">Potential Monthly Savings</p>
            <h4 className="text-3xl font-extrabold text-eco-700 tracking-tight">$412.50</h4>
            <div className="flex items-center space-x-2 text-eco-600 mt-2 text-xs font-bold bg-white/60 p-1.5 rounded-lg w-fit">
              <Leaf size={12} fill="currentColor" />
              <span>-15.4 kg CO₂e / month</span>
            </div>
          </div>

          <button className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-eco-500/20 transform active:scale-95 transition-all flex items-center justify-center space-x-2 group">
            <span>View Recommendations</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
