import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Cloud, CreditCard } from 'lucide-react';

const Settings = () => {
  const sections = [
    { title: 'Profile', icon: <User size={18} />, description: 'Manage your GreenOps identity and credentials' },
    { title: 'Cloud Accounts', icon: <Cloud size={18} />, description: 'Configure AWS IAM roles and billing access' },
    { title: 'Notifications', icon: <Bell size={18} />, description: 'Setup alerts for idle resources and cost spikes' },
    { title: 'Compliance', icon: <Shield size={18} />, description: 'Manage sustainability auditing and report frequency' },
    { title: 'Billing', icon: <CreditCard size={18} />, description: 'View GreenOps subscription and billing history' },
  ];

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-eco-600 border border-gray-100">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Platform configuration & preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <div key={i} className="glass p-6 rounded-[2.5rem] border border-gray-100 flex items-center space-x-6 hover:shadow-lg hover:border-eco-100 transition-all cursor-pointer group">
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
    </div>
  );
};

export default Settings;
