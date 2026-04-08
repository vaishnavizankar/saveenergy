import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Database,
  HardDrive,
  Power,
  StopCircle,
  Play,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  RefreshCcw,
  Box,
  Zap,
  Globe,
  Layers
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
    // 1. Initial Load
    fetchResources();

    // 2. Slow Poll for List Changes (new/deleted resources)
    const interval = setInterval(fetchResources, 30000);

    // 3. WebSocket for Real-time Performance Telemetry
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
      console.error("Failed to fetch resources", err);
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
      if (isStarting) {
        await resourceService.start(resId);
      } else {
        await resourceService.stop(resId);
      }
      fetchResources();
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActioningId(null);
      setSelectedRes(null);
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
      case 'EC2': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RDS': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'S3': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Lambda': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cloud Inventory</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 flex items-center">
            <Globe size={14} className="mr-2 text-eco-500" />
            Active Across All AWS Regions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              try {
                await resourceService.sync();
                fetchResources(); // Optionally re-fetch after a slight delay, but websocket will update it anyway
              } catch (e) {}
            }}
            className="bg-eco-50 hover:bg-eco-100 text-eco-700 px-4 py-2.5 rounded-2xl border border-eco-200 flex items-center space-x-2 text-xs font-black tracking-widest uppercase transition-all shadow-sm"
          >
            <RefreshCcw size={16} />
            <span>Sync Data</span>
          </button>
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 flex items-center space-x-2 shadow-sm focus-within:ring-4 focus-within:ring-eco-500/5 transition-all">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name or ID..."
              className="bg-transparent border-none outline-none text-sm font-medium w-full md:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-500 outline-none cursor-pointer hover:bg-gray-50 transition-all"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Services</option>
            <option value="EC2">EC2 Instances</option>
            <option value="RDS">RDS Clusters</option>
            <option value="S3">S3 Buckets</option>
            <option value="Lambda">Lambda Functions</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="glass rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                  <th className="px-8 py-5">Resource Identity</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Runtime / Class</th>
                  <th className="px-8 py-5">Region</th>
                  <th className="px-8 py-5">Performance</th>
                  <th className="px-8 py-5">Operational Status</th>
                  <th className="px-8 py-5 text-right">Cost/h</th>
                  <th className="px-8 py-5 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filteredResources.map((res) => (
                    <motion.tr
                      key={res.resource_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/20 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl border ${getColorClass(res.type)} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            {getIcon(res.type)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 tracking-tight">{res.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter uppercase">{res.resource_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getColorClass(res.type)}`}>
                          {res.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-mono font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">{res.instance_type}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{res.region}</span>
                      </td>
                      <td className="px-8 py-5">
                        {res.type !== 'S3' ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                              <div
                                className={`h-full ${res.cpu_usage > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : res.cpu_usage < 5 ? 'bg-amber-400' : 'bg-eco-500'} transition-all duration-1000`}
                                style={{ width: `${res.cpu_usage}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-500">{res.cpu_usage.toFixed(1)}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Global Storage</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full w-fit ${['running', 'active', 'available'].includes(res.status)
                          ? 'bg-eco-50 text-eco-700'
                          : 'bg-gray-100 text-gray-400'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${['running', 'active', 'available'].includes(res.status) ? 'bg-eco-500 animate-pulse' : 'bg-gray-300'}`}></div>
                          <span>{res.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-900 text-sm italic">
                        ${(res.cost_per_hour || 0).toFixed(3)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => requestToggleState(res)}
                          disabled={actioningId === res.resource_id || res.type === 'S3' || res.type === 'Lambda'}
                          className={`p-2.5 rounded-xl transition-all shadow-sm border ${actioningId === res.resource_id ? 'bg-gray-50' :
                            ['running', 'active', 'available'].includes(res.status)
                              ? 'bg-white text-red-500 border-red-50 hover:bg-red-50 hover:border-red-200 hover:shadow-md'
                              : 'bg-white text-eco-600 border-eco-50 hover:bg-eco-50 hover:border-eco-200 hover:shadow-md'
                            }`}
                        >
                          {actioningId === res.resource_id ? <RefreshCcw size={16} className="animate-spin" /> :
                            ['running', 'active', 'available'].includes(res.status) ? <StopCircle size={18} /> : <Play size={18} />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleToggleState}
            title={selectedRes?.status === 'stopped' ? "Resume Eco Session?" : "Suspend Infrastructure?"}
            message={selectedRes?.status === 'stopped'
              ? `You are about to resume ${selectedRes?.name}. This will restore operational metrics to your dashboard.`
              : `Are you sure you want to pause ${selectedRes?.name}? Suspending idle resources is a key step in reducing your carbon footprint.`}
            actionLabel={selectedRes?.status === 'stopped' ? "Resume Resource" : "Confirm Suspension"}
            type={selectedRes?.status === 'stopped' ? "success" : "danger"}
          />
        </div>
      </div>
    </div>
  );
};

export default Resources;
