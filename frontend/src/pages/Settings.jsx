import React from 'react';
import { 
  Settings as SettingsIcon, 
  Activity, 
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import AWSAccountManager from '../components/Settings/AWSAccountManager';

const Settings = () => {
  return (
    <div className="page-enter">
      <div className="mb-16">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">System Configuration</h2>
        <div className="flex items-center gap-4 mt-3">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
             <SettingsIcon size={14} className="text-eco-600" />
             <span className="uppercase tracking-widest text-[10px] font-black">Environmental Variables Secure</span>
           </div>
           <span className="h-4 w-[1px] bg-slate-200"></span>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
             <Activity size={14} />
             <span className="uppercase tracking-widest text-[10px] font-black">Control Plane v42.0.1</span>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-12 bg-white/60 min-h-[600px] flex flex-col"
        >
          
          <div className="flex-1">
             <AWSAccountManager />
          </div>

          <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between opacity-50">
             <div className="flex items-center gap-3">
                <Lock size={14} className="text-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Environment Sync Active</span>
             </div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Online</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
