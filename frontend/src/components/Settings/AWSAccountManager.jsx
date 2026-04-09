import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Cloud, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  Database, 
  Globe,
  RefreshCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resourceService } from '../../services/api';

const AWSAccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', access_key: '', secret_key: '', region: 'us-east-1' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await resourceService.listAccounts();
      setAccounts(res.data);
    } catch (err) {
      console.error("Fetch accounts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await resourceService.addAccount(formData);
      setFormData({ name: '', access_key: '', secret_key: '', region: 'us-east-1' });
      setIsAdding(false);
      fetchAccounts();
    } catch (err) {
      alert("Failed to link AWS account. Please verify IAM permissions.");
    }
  };

  return (
    <div className="space-y-10 py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
         <div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Cloud Providers</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-account IAM integration pool</p>
         </div>
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => setIsAdding(!isAdding)}
           className="btn-primary"
         >
           <Plus size={18} />
           <span className="uppercase tracking-[0.15em] text-[10px] font-black">Link New AWS Node</span>
         </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-slate-50/80 rounded-[40px] p-10 border border-slate-200/50 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Identifier</label>
                <div className="relative group">
                  <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-600 transition-colors" />
                  <input
                    required
                    placeholder="e.g. Production AWS"
                    className="input-field w-full pl-14"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Interface Region</label>
                <select 
                   className="input-field w-full appearance-none bg-white font-bold"
                   value={formData.region}
                   onChange={(e) => setFormData({...formData, region: e.target.value})}
                >
                   <option value="us-east-1">US East (N. Virginia)</option>
                   <option value="us-west-2">US West (Oregon)</option>
                   <option value="eu-central-1">Europe (Frankfurt)</option>
                   <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Key ID</label>
                <div className="relative group">
                   <KeyRound size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-600 transition-colors" />
                   <input
                    required
                    type="password"
                    placeholder="AKIA..."
                    className="input-field w-full pl-14 font-mono tracking-widest"
                    value={formData.access_key}
                    onChange={(e) => setFormData({...formData, access_key: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secret Access Key</label>
                <div className="relative group">
                   <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-eco-600 transition-colors" />
                   <input
                    required
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    className="input-field w-full pl-14 font-mono tracking-widest"
                    value={formData.secret_key}
                    onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary py-4 px-10">Abort</button>
                <button type="submit" className="btn-primary py-4 px-10">
                   <span>Authenticate & Connect</span>
                   <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {accounts.map((acc, i) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-white border border-slate-100 rounded-[35px] shadow-sm hover:shadow-card-hover transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-eco-50 text-eco-600 rounded-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                       <Cloud size={24} />
                    </div>
                    <div>
                       <h5 className="text-lg font-black text-slate-900 tracking-tight uppercase">{acc.name}</h5>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mt-1">
                          <Globe size={12} />
                          <span>{acc.region}</span>
                       </div>
                    </div>
                 </div>
                 <button 
                   onClick={async () => { if(confirm("Disconnect this AWS node?")) { await resourceService.removeAccount(acc.id); fetchAccounts(); } }}
                   className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                       <Database size={14} className="text-slate-400" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Linked</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total Active Sync</span>
                 </div>
                 
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                       <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                       </div>
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                       <Activity size={10} />
                       <span>Last Polled: 02m ago</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {accounts.length === 0 && !loading && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[50px] bg-slate-50/50 group hover:bg-white transition-all">
             <div className="w-20 h-20 bg-white shadow-elevated rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Lock size={32} className="text-slate-300" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No authenticated AWS providers found in cluster</p>
             <button onClick={() => setIsAdding(true)} className="mt-6 text-eco-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                Link Initial Node <ArrowRight size={16} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSAccountManager;
