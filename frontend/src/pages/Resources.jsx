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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourceService } from '../services/api';
import ConfirmationModal from '../components/Dashboard/ConfirmationModal';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    fetchResources();
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
    if (res.status === 'stopped') return;
    setSelectedRes(res);
    setIsModalOpen(true);
  };

  const handleToggleState = async () => {
    if (!selectedRes) return;
    
    const resId = selectedRes.resource_id;
    setIsModalOpen(false);
    setActioningId(resId);
    try {
      await resourceService.stop(resId);
      // Optimistic update
      setResources(prev => prev.map(r => 
        r.resource_id === resId ? { ...r, status: 'stopped' } : r
      ));
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActioningId(null);
      setSelectedRes(null);
    }
  };

  const filteredResources = resources.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.resource_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cloud Inventory</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Manage AWS EC2 & RDS Assets</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center space-x-2 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search resource ID..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-eco-50 text-eco-600 p-2.5 rounded-xl border border-eco-100 hover:bg-eco-100 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="glass rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Instance</th>
                <th className="px-6 py-4">Utilization</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cost/h</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${res.type === 'EC2' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {res.type === 'EC2' ? <Server size={18} /> : <Database size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{res.name}</p>
                          <p className="text-[10px] font-medium text-gray-400 font-mono tracking-tighter">{res.resource_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{res.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-medium text-gray-500">{res.instance_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${res.cpu_usage > 70 ? 'bg-red-500' : res.cpu_usage < 5 ? 'bg-amber-400 animate-pulse' : 'bg-eco-500'} transition-all duration-1000`} 
                            style={{ width: `${res.cpu_usage}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{res.cpu_usage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-full w-fit ${
                        res.status === 'running' 
                          ? 'bg-eco-100 text-eco-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${res.status === 'running' ? 'bg-eco-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span>{res.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">${res.cost_per_hour.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => requestToggleState(res)}
                        disabled={actioningId === res.resource_id || res.status === 'stopped'}
                        className={`p-2 rounded-xl transition-all shadow-sm border ${
                          res.status === 'running'
                            ? 'bg-white text-red-500 border-red-50 hover:bg-red-50 hover:border-red-100'
                            : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        }`}
                      >
                        {actioningId === res.resource_id ? <RefreshCcw size={16} className="animate-spin" /> : <Power size={16} />}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          <ConfirmationModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleToggleState}
            title="Stop Infrastructure Instance?"
            message={`Are you sure you want to stop ${selectedRes?.name}? This action will halt charging but may disrupt active connections/services associated with this instance.`}
            actionLabel="Confirm Stop"
            type="danger"
          />
          
          {filteredResources.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400">
              <div className="flex justify-center mb-4 text-gray-200"><Search size={48} /></div>
              <p className="font-bold">No resources matched your search</p>
              <p className="text-sm uppercase tracking-widest mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;
