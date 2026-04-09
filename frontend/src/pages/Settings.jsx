import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Key, 
  Cloud, 
  CreditCard, 
  Activity, 
  Database,
  Globe,
  Lock,
  ChevronRight,
  Plus,
  ArrowRight,
  Smartphone,
  Mail,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AWSAccountManager from '../components/Settings/AWSAccountManager';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('cloud');

  const tabs = [
    { id: 'profile', name: 'User Identity', icon: <User size={18} /> },
    { id: 'cloud', name: 'Cloud Integration', icon: <Cloud size={18} /> },
    { id: 'security', name: 'Identity Protocols', icon: <Shield size={18} /> },
    { id: 'notifications', name: 'Alert Systems', icon: <Bell size={18} /> },
    { id: 'billing', name: 'Institutional Billing', icon: <CreditCard size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'cloud':
        return <AWSAccountManager />;
      case 'profile':
        return (
          <div className="space-y-10 py-4 max-w-2xl">
            <div className="flex items-center gap-10">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-eco-400 to-eco-600 flex items-center justify-center text-white text-4xl font-black shadow-elevated group-hover:scale-105 transition-transform duration-500">
                    AU
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-400 hover:text-eco-600 cursor-pointer">
                     <Smartphone size={16} />
                  </div>
               </div>
               <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Admin User</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Master Principal Access</p>
                  <div className="flex items-center gap-3">
                     <span className="badge-eco py-1.5 px-4 bg-eco-50 text-eco-700 border-none shadow-sm flex items-center gap-2">
                        <CheckCircle2 size={12} strokeWidth={3} />
                        Identity Verified
                     </span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Identity</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-eco-600 transition-colors" />
                    <input type="text" defaultValue="admin@greenops.internal" className="input-field w-full pl-14" disabled />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Protocol Tier</label>
                  <div className="relative group">
                    <Zap size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" defaultValue="Enterprise Enterprise Core" className="input-field w-full pl-14 bg-slate-50 border-none text-slate-500" disabled />
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
            <Lock size={64} className="text-slate-200 mb-8" strokeWidth={1.5} />
            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Protocol Encrypted</h5>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[250px]">Modular access to this setting layer is currently restricted by GreenOps Protocol.</p>
          </div>
        );
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-3 px-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2.5rem] transition-all relative overflow-hidden group ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-elevated' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100 hover:shadow-card'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-eco-400' : 'text-slate-300 group-hover:text-eco-600'} transition-colors`}>
                {tab.icon}
              </span>
              <span className="text-xs font-black uppercase tracking-widest">{tab.name}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="settings-active"
                  className="absolute right-6 w-1.5 h-1.5 rounded-full bg-eco-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card-premium p-12 bg-white/60 min-h-[600px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-12">
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                         {tabs.find(t => t.id === activeTab)?.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                         Modify global environment parameters and access control.
                      </p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100/50">
                      {tabs.find(t => t.id === activeTab)?.icon}
                   </div>
                </div>
                
                <div className="flex-1">
                   {renderContent()}
                </div>

                <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between opacity-50">
                   <div className="flex items-center gap-3">
                      <Lock size={14} className="text-slate-300" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Environment Sync Active</span>
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modified at {new Date().toLocaleTimeString()} UTC</p>
                </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
