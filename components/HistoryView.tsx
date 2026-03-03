import React, { useEffect, useState } from 'react';
import { ContractAnalysisResult } from '../types';
import { Clock, FileText, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  onSelectAnalysis: (analysis: ContractAnalysisResult) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelectAnalysis }) => {
  const [history, setHistory] = useState<ContractAnalysisResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('lexguard_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch(e) { console.error(e); }
    }
  }, []);

  const clearHistory = () => {
    if(confirm('Tüm geçmişi silmek istediğinize emin misiniz?')) {
      localStorage.removeItem('lexguard_history');
      setHistory([]);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Geçmiş Analizler</h2>
          <p className="text-slate-500 text-sm">Daha önce incelediğiniz sözleşmelerin kayıtları.</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded flex items-center gap-2">
            <Trash2 size={16} /> Temizle
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <Clock size={48} className="mb-4 opacity-20" />
             <p>Henüz kaydedilmiş bir analiz yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.sort((a,b) => b.timestamp - a.timestamp).map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    item.riskScore > 70 ? 'bg-red-500' : item.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'
                  }`}>
                    {item.riskScore}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.fileName || 'İsimsiz Sözleşme'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock size={12} /> {new Date(item.timestamp).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectAnalysis(item)}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2"
                >
                  Raporu Aç <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;