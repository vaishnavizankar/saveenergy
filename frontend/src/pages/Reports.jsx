import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileDown, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle2, 
  Activity,
  Plus,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const title = `Sustainability Audit - ${new Date().toLocaleDateString()}`;
      await api.post(`/reports/generate?title=${title}`);
      await fetchReports();
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await api.get(`/reports/download/${report.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="pt-24 px-8 pb-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Compliance & Analytics</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Sustainability performance artifacts</p>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-eco-600 hover:bg-eco-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center space-x-2 shadow-xl shadow-eco-500/20 active:scale-95 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {isGenerating ? <Clock className="animate-spin" size={16} /> : <Plus size={16} />}
          <span>New Audit Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all group"
            >
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-eco-50 text-eco-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-gray-900 tracking-tight">{report.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Clock size={12} />
                      <span>{new Date(report.generated_at).toLocaleTimeString()} UTC</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-eco-600 font-black uppercase text-[8px] tracking-tighter bg-eco-50 px-2 py-0.5 rounded-full border border-eco-100">
                      <CheckCircle2 size={10} />
                      <span>Verified Sustainability Artifact</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right mr-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Status</p>
                  <p className="text-xs font-bold text-emerald-600">Generated & Signed</p>
                </div>
                <button 
                  onClick={() => handleDownload(report)}
                  className="p-4 bg-gray-50 text-gray-400 rounded-xl hover:bg-eco-100 hover:text-eco-600 transition-all border border-transparent hover:border-eco-200"
                >
                  <Download size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reports.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-300">
            <div className="flex justify-center mb-4 text-gray-100"><FileDown size={64} /></div>
            <p className="font-bold text-xl text-gray-400">No reports generated yet</p>
            <button 
              onClick={handleGenerate}
              className="mt-6 text-eco-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Start Your First Sustainability Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
