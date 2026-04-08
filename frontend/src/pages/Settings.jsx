import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Cloud, CreditCard, ChevronRight } from 'lucide-react';
import AWSAccountManager from '../components/Settings/AWSAccountManager';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('Overview');

  const sections = [
    { id: 'Profile', title: 'Profile', icon: <User size={18} />, description: 'Manage your SaveEnergy identity and credentials' },
    { id: 'Accounts', title: 'Cloud Accounts', icon: <Cloud size={18} />, description: 'Configure AWS IAM roles and billing access' },
    { id: 'Notifications', title: 'Notifications', icon: <Bell size={18} />, description: 'Setup alerts for idle resources and cost spikes' },
    { id: 'Compliance', title: 'Compliance', icon: <Shield size={18} />, description: 'Manage sustainability auditing and report frequency' },
    { id: 'Billing', title: 'Billing', icon: <CreditCard size={18} />, description: 'View SaveEnergy subscription and billing history' },
  ];

  return (
    <div className="pt-24 px-8 pb-12 fade-in font-inter">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-eco-600 border border-gray-100">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Platform configuration & preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <button 
            onClick={() => setActiveSection('Overview')}
            className={`w-full text-left p-6 rounded-[2.5rem] border transition-all flex items-center justify-between group ${activeSection === 'Overview' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'glass border-gray-100 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-all ${activeSection === 'Overview' ? 'bg-white/10' : 'bg-gray-50 text-gray-400 group-hover:text-eco-600'}`}>
                <SettingsIcon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest">Configuration</h4>
                <p className={`text-[10px] font-bold ${activeSection === 'Overview' ? 'text-gray-400' : 'text-gray-400'}`}>General settings</p>
              </div>
            </div>
          </button>

          {sections.map((section, i) => (
            <button 
              key={i} 
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-6 rounded-[2.5rem] border transition-all flex items-center justify-between group ${activeSection === section.id ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'glass border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-all ${activeSection === section.id ? 'bg-white/10' : 'bg-gray-50 text-gray-400 group-hover:text-eco-600'}`}>
                  {section.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest">{section.title}</h4>
                  <p className={`text-[10px] font-bold ${activeSection === section.id ? 'text-gray-400' : 'text-gray-400'}`}>Global preferences</p>
                </div>
              </div>
              {activeSection !== section.id && <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {activeSection === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveSection(section.id)}
                  className="glass p-8 rounded-[2.5rem] border border-gray-100 flex items-center space-x-6 hover:shadow-lg hover:border-eco-100 transition-all cursor-pointer group h-full"
                >
                  <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-eco-50 group-hover:text-eco-600 transition-all">
                    {section.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-gray-900 tracking-tight">{section.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'Accounts' && (
            <div className="fade-in">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Cross-Account IAM Access</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Connect multiple AWS organizations to consolidate your sustainability metrics. Each account requires an IAM Role with a Trust Policy pointing to the SaveEnergy Collector.
                </p>
              </div>
              <AWSAccountManager />
            </div>
          )}

          {(activeSection !== 'Overview' && activeSection !== 'Accounts') && (
            <div className="glass p-12 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center opacity-50 grayscale select-none">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <SettingsIcon size={40} className="text-gray-200" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Coming Soon</h4>
              <p className="text-gray-400 text-sm font-bold mt-2 uppercase tracking-widest italic font-mono">Module integration in progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
