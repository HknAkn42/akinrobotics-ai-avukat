import React, { useState, useRef } from 'react';
import { CompanyContext, CustomRule } from '../types';
import { Upload, Trash2, Edit2, FileText, CheckCircle, XCircle, Plus, Save, X, AlertCircle } from 'lucide-react';
import { readDocumentContent } from '../services/fileService';

interface TemporaryContractManagerProps {
  context: CompanyContext;
  onUpdateContext: (ctx: CompanyContext) => void;
}

const TemporaryContractManager: React.FC<TemporaryContractManagerProps> = ({ context, onUpdateContext }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Geçici Sözleşme');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter only temporary contracts
  const tempContracts = context.customRules?.filter(
    r => r.isTemporaryContract || r.category === 'Geçici Sözleşme' || r.category === 'Geçici' || r.category === 'Ek Belge'
  ) || [];

  const handleToggleActive = (id: string) => {
    const updatedRules = context.customRules.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    onUpdateContext({ ...context, customRules: updatedRules });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu geçici sözleşmeyi silmek istediğinize emin misiniz?')) {
      const updatedRules = context.customRules.filter(r => r.id !== id);
      onUpdateContext({ ...context, customRules: updatedRules });
    }
  };

  const startEdit = (rule: CustomRule) => {
    setIsEditing(rule.id);
    setEditContent(rule.content);
  };

  const saveEdit = () => {
    if (!isEditing) return;
    
    const updatedRules = context.customRules.map(r => 
      r.id === isEditing ? { ...r, content: editContent } : r
    );
    onUpdateContext({ ...context, customRules: updatedRules });
    setIsEditing(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditContent('');
  };

  const handleAdd = () => {
    if (!newContent.trim()) return;

    const newRule: CustomRule = {
      id: crypto.randomUUID(),
      content: newContent,
      category: newCategory,
      isActive: true,
      dateAdded: Date.now(),
      isTemporaryContract: true
    };

    const updatedRules = [...(context.customRules || []), newRule];
    onUpdateContext({ ...context, customRules: updatedRules });
    setNewContent('');
    setIsAdding(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await readDocumentContent(file);
      if (!text.trim()) {
        alert("Dosyadan metin okunamadı.");
        return;
      }

      const newRule: CustomRule = {
        id: crypto.randomUUID(),
        content: `[DOSYA: ${file.name}]\n\n${text}`,
        category: 'Geçici Sözleşme',
        isActive: true,
        dateAdded: Date.now(),
        isTemporaryContract: true
      };

      const updatedRules = [...(context.customRules || []), newRule];
      onUpdateContext({ ...context, customRules: updatedRules });
      alert(`${file.name} başarıyla eklendi.`);
    } catch (err) {
      console.error(err);
      alert("Dosya işlenirken hata oluştu.");
    }
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden bg-slate-50 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Geçici Sözleşme Yönetimi</h2>
          <p className="text-slate-500 text-sm">Analizlere dahil edilecek geçici sözleşmeleri ve ek protokolleri buradan yönetebilirsiniz.</p>
        </div>
        <div className="flex gap-2">
           <label className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-sm">
              <Upload size={16} />
              <span>Dosya Yükle</span>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".txt,.docx,.pdf"
                onChange={handleFileUpload}
              />
           </label>
           <button 
              onClick={() => setIsAdding(true)}
              className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm shadow-amber-200"
           >
              <Plus size={16} />
              <span>Yeni Ekle</span>
           </button>
        </div>
      </div>

      {/* ADD NEW FORM */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-lg animate-fade-in">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-amber-600"/> Yeni Geçici Sözleşme / Protokol Ekle
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori / Başlık</label>
              <input 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Örn: Ek Protokol No.1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İçerik</label>
              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono h-40 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                placeholder="Sözleşme metnini buraya yapıştırın..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleAdd}
                disabled={!newContent.trim()}
                className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {tempContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Henüz eklenmiş bir geçici sözleşme yok.</p>
            <p className="text-sm mt-1">Dosya yükleyerek veya yeni ekleyerek başlayın.</p>
          </div>
        ) : (
          tempContracts.map(contract => (
            <div key={contract.id} className={`bg-white rounded-xl border transition-all shadow-sm group ${contract.isActive ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200 opacity-75'}`}>
              
              {/* HEADER */}
              <div className="p-4 flex items-start justify-between border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${contract.isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${contract.isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {contract.category}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Eklenme: {new Date(contract.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 mr-2">
                      <button 
                        onClick={() => handleToggleActive(contract.id)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${contract.isActive ? 'bg-green-100 text-green-700' : 'text-slate-400 hover:bg-slate-100'}`}
                      >
                        Aktif
                      </button>
                      <button 
                        onClick={() => handleToggleActive(contract.id)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${!contract.isActive ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:bg-slate-100'}`}
                      >
                        Pasif
                      </button>
                   </div>

                   <button 
                      onClick={() => startEdit(contract)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Düzenle"
                   >
                      <Edit2 size={16} />
                   </button>
                   <button 
                      onClick={() => handleDelete(contract.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4">
                {isEditing === contract.id ? (
                  <div className="space-y-3 animate-fade-in">
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border border-blue-300 rounded-lg p-3 text-sm font-mono h-64 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                      >
                        İptal
                      </button>
                      <button 
                        onClick={saveEdit}
                        className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-bold flex items-center gap-1"
                      >
                        <Save size={14} /> Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`text-sm font-mono text-slate-600 whitespace-pre-wrap leading-relaxed max-h-40 overflow-hidden relative ${!contract.isActive && 'line-through opacity-50'}`}>
                     {contract.content.length > 500 ? (
                        <>
                          {contract.content.substring(0, 500)}...
                          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
                        </>
                     ) : contract.content}
                  </div>
                )}
                
                {/* STATUS INDICATOR */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                   {contract.isActive ? (
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Analize Dahil
                      </span>
                   ) : (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                        <XCircle size={12} /> Analiz Dışı
                      </span>
                   )}
                   {contract.content.includes('[DOSYA:') && (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                        <FileText size={12} /> Dosya Kaynaklı
                      </span>
                   )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TemporaryContractManager;
