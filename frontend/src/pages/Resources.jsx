import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Search,
  RefreshCcw,
  Box,
  Zap,
  Globe,
  Layers,
  Trash2,
  StopCircle,
  Play,
  Cpu,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourceService } from '../services/api';
import ConfirmationModal from '../components/Dashboard/ConfirmationModal';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [actioningId, setActioningId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 30000);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws/live`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'LIVE_METRICS') {
        const liveData = msg.data;
        setResources(prev => {
          return prev.map(res => {
            const update = liveData.find(u => u.id === res.resource_id);
            if (update) {
              return {
                ...res,
                cpu_usage: update.cpu,
                cost_per_hour: update.cost,
                carbon_emissions: update.carbon,
                updated_at: update.timestamp
              };
            }
            return res;
          });
        });
      }
    };

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const fetchResources = async () => {
    try {
      const res = await resourceService.list();
      setResources(res.data);
    } catch (err) {
      console.error("Resources fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestToggleState = (res) => {
    if (res.status === 'stopped' || res.type === 'S3' || res.type === 'Lambda') return;
    setSelectedRes(res);
    setIsModalOpen(true);
  };

  const handleToggleState = async () => {
    if (!selectedRes) return;
    const resId = selectedRes.resource_id;
    const isStarting = selectedRes.status === 'stopped';
    setIsModalOpen(false);
    setActioningId(resId);
    try {
      if (isStarting) await resourceService.start(resId);
      else await resourceService.stop(resId);
      fetchResources();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActioningId(null);
      setSelectedRes(null);
    }
  };

  const handleDeleteResource = async (res) => {
    if (!confirm(`Permanently decommission "${res.name}"? This will terminate the instance in AWS.`)) return;
    setActioningId(res.resource_id);
    try {
      await resourceService.remove(res.resource_id);
      fetchResources();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActioningId(null);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.resource_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || res.type === filterType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'EC2': return <Server size={18} />;
      case 'RDS': return <Database size={18} />;
      case 'S3': return <Box size={18} />;
      case 'Lambda': return <Zap size={18} />;
      default: return <Layers size={18} />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'EC2': return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'RDS': return 'bg-indigo-50 text-indigo-600 border-indigo-100/50';
      case 'S3': return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'Lambda': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100/50';
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Inventory Control</h2>
          <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
               <Globe size={14} className="text-eco-600" />
               <span className="uppercase tracking-widest text-[10px] font-black">All Activated Regions</span>
             </div>
             <span className="h-4 w-[1px] bg-slate-200"></span>
             <div className="badge-eco px-4 py-1.5 flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={3} />
                <span>Synchronized with CloudWatch</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group bg-white shadow-sm rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eco-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search resource name or ID..."
              className="pl-12 pr-6 py-3.5 bg-transparent border border-slate-200 rounded-2xl text-sm w-full md:w-64 focus:ring-8 focus:ring-eco-500/5 focus:border-eco-500/50 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eco-600 transition-colors pointer-events-none" size={16} />
            <select
              className="pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer hover:border-slate-300 focus:ring-8 focus:ring-eco-500/5 transition-all appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Cloud Services</option>
              <option value="EC2">EC2 Instances</option>
              <option value="RDS">RDS Clusters</option>
              <option value="S3">S3 Buckets</option>
              <option value="Lambda">Functions</option>
            </select>
          </div>

          <button
            onClick={async () => {
               const btn = document.getElementById('sync-btn');
               if(btn) btn.classList.add('animate-spin');
               try { await resourceService.sync(); await fetchResources(); } catch(e) {}
               if(btn) btn.classList.remove('animate-spin');
            }}
            className="btn-primary"
          >
            <RefreshCcw size={18} id="sync-btn" />
            <span className="hidden md:inline uppercase tracking-widest text-[10px] font-black">Inventory Sync</span>
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden bg-white/60">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="premium-table min-w-[1200px]">
            <thead>
              <tr>
                <th>Infrastructure Asset</th>
                <th>Category</th>
                <th>Instance Profile</th>
                <th>Performance</th>
                <th>Runtime Status</th>
                <th className="text-right">Est. Unit Cost</th>
                <th className="text-right">Operational Control</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredResources.map((res, index) => (
                  <motion.tr
                    key={res.resource_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.02 }}
                    className="group transition-all hover:bg-slate-50/60"
                  >
                    <td>
                      <div className="flex items-center gap-5">
                        <div className={`p-3.5 rounded-2xl border ${getColorClass(res.type)} shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                          {getIcon(res.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-slate-900 tracking-tight">{res.name}</p>
                             <ArrowUpRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase mt-0.5">{res.resource_id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-eco border-none shadow-sm ${getColorClass(res.type)}`}>
                        {res.type}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 font-mono">{res.instance_type}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{res.region}</span>
                      </div>
                    </td>
                    <td>
                      {res.type !== 'S3' ? (
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                             <span>CPU Usage</span>
                             <span>{res.cpu_usage.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${res.cpu_usage}%` }}
                              className={`h-full transition-all duration-1000 ${
                                res.cpu_usage > 75 ? 'bg-red-500 shadow-glow-amber' : 
                                res.cpu_usage < 10 ? 'bg-amber-400 shadow-glow-amber' : 'bg-eco-500 shadow-glow-eco'
                              }`}
                            ></motion.div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                           <Box size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Global Pool</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl w-fit ${
                        ['running', 'active', 'available'].includes(res.status)
                          ? 'bg-eco-50 text-eco-600 border border-eco-100/50 shadow-sm'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50'
                      }`}>
                        <div className={`relative flex h-2 w-2`}>
                           {['running', 'active', 'available'].includes(res.status) && (
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                           )}
                           <span className={`relative inline-flex rounded-full h-2 w-2 ${['running', 'active', 'available'].includes(res.status) ? 'bg-eco-500' : 'bg-slate-300'}`}></span>
                        </div>
                        <span className="drop-shadow-sm">{res.status}</span>
                      </div>
                    </td>
                    <td className="text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-slate-900 tabular-nums">${(res.cost_per_hour || 0).toFixed(3)}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Per Operating Hour</span>
                       </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 px-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => requestToggleState(res)}
                          disabled={actioningId === res.resource_id || res.type === 'S3' || res.type === 'Lambda'}
                          className={`p-3 rounded-2xl transition-all shadow-sm border border-slate-200/50 ${
                            actioningId === res.resource_id ? 'bg-slate-50 opacity-50' :
                            ['running', 'active', 'available'].includes(res.status)
                              ? 'bg-white text-red-500 hover:bg-red-50 hover:border-red-200'
                              : 'bg-white text-eco-600 hover:bg-eco-50 hover:border-eco-200'
                          }`}
                        >
                          {actioningId === res.resource_id ? <RefreshCcw size={18} className="animate-spin" /> :
                            ['running', 'active', 'available'].includes(res.status) ? <StopCircle size={20} /> : <Play size={20} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: '#fef2f2', color: '#ef4444' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteResource(res)}
                          disabled={actioningId === res.resource_id}
                          className="p-3 rounded-2xl bg-white text-slate-400 border border-slate-200/50 hover:border-red-200 shadow-sm"
                          title="Terminate Instance"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleToggleState}
        title={selectedRes?.status === 'stopped' ? "Re-activate Cloud Asset?" : "De-activate Infrastructure?"}
        message={selectedRes?.status === 'stopped'
          ? `You are about to resume operation for ${selectedRes?.name}. This will re-enable all performance monitoring for the ${selectedRes?.type} instance.`
          : `Suspending ${selectedRes?.name} will reduce your hourly carbon footprint by ${(selectedRes?.carbon_emissions || 0).toFixed(4)}kg CO₂e. Proceed with suspension?`}
        actionLabel={selectedRes?.status === 'stopped' ? "Resume Control" : "Execute Suspension"}
        type={selectedRes?.status === 'stopped' ? "success" : "danger"}
      />
    </div>
  );
};

export default Resources;
