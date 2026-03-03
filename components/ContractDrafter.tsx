import React, { useState, useEffect } from 'react';
import { CompanyContext, Clause, DraftVersion } from '../types';
import { draftContract } from '../services/geminiService';
import { FilePlus, Send, Copy, FileText, Loader2, Download, Trash2, CheckCircle, BookTemplate, AlertCircle, BookMarked, Plus, X, History, RotateCcw, Check } from 'lucide-react';
import { readDocumentContent } from '../services/fileService';

interface ContractDrafterProps {
  context: CompanyContext;
}

const ContractDrafter: React.FC<ContractDrafterProps> = ({ context }) => {
  // Initialize from localStorage
  const [template, setTemplate] = useState(() => localStorage.getItem('lexguard_draft_template') || '');
  const [instruction, setInstruction] = useState(() => localStorage.getItem('lexguard_draft_instruction') || '');
  const [draft, setDraft] = useState(() => localStorage.getItem('lexguard_draft_result') || '');
  
  // Versions State
  const [versions, setVersions] = useState<DraftVersion[]>(() => {
      try {
          const saved = localStorage.getItem('lexguard_draft_versions');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });
  const [showVersions, setShowVersions] = useState(false);
  
  const [selectedMasterId, setSelectedMasterId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Clause Modal State
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [libraryClauses, setLibraryClauses] = useState<Clause[]>([]);

  // Save to localStorage
  useEffect(() => { localStorage.setItem('lexguard_draft_template', template); }, [template]);
  useEffect(() => { localStorage.setItem('lexguard_draft_instruction', instruction); }, [instruction]);
  useEffect(() => { localStorage.setItem('lexguard_draft_result', draft); }, [draft]);
  useEffect(() => { localStorage.setItem('lexguard_draft_versions', JSON.stringify(versions)); }, [versions]);

  useEffect(() => {
      if (showClauseModal) {
          const saved = localStorage.getItem('lexguard_clauses');
          if (saved) {
              setLibraryClauses(JSON.parse(saved));
          }
      }
  }, [showClauseModal]);

  const handleMasterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedMasterId(id);
      setUploadedFileName(''); 
      if (id) {
          const master = context.masterContracts?.find(m => m.id === id);
          if (master) {
              setTemplate(master.content);
          }
      }
  };

  const handleDraft = async () => {
    if (!instruction) return;
    setLoading(true);
    setDraft(''); 
    try {
      const generatedDraft = await draftContract(
        instruction, 
        template.trim() ? template : null, 
        context
      );
      setDraft(generatedDraft);
      
      // Save Version
      const newVersion: DraftVersion = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          content: generatedDraft,
          instruction: instruction
      };
      setVersions(prev => [newVersion, ...prev].slice(0, 10)); // Keep last 10 versions

    } catch (error: any) {
      console.error(error);
      alert(`Taslak oluşturulamadı: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = (version: DraftVersion) => {
      if(confirm('Bu versiyona dönmek mevcut taslağı değiştirecektir. Emin misiniz?')) {
          setDraft(version.content);
          setInstruction(version.instruction);
          setShowVersions(false);
      }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const clearAll = () => {
      if(confirm('Taslağı ve talimatları temizlemek istiyor musunuz?')) {
          setTemplate('');
          setInstruction('');
          setDraft('');
          setSelectedMasterId('');
          setUploadedFileName('');
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsFileLoading(true);
        setUploadedFileName(file.name);
        try {
            const text = await readDocumentContent(file);
            setTemplate(text);
            setSelectedMasterId(''); 
        } catch (error) {
            alert("Dosya okunamadı. Desteklenen formatlar: .docx, .pdf, .txt, .jpg, .png");
            setUploadedFileName('');
        } finally {
            setIsFileLoading(false);
            e.target.value = '';
        }
    }
  };

  const insertClauseToInstruction = (clause: Clause) => {
      const textToAdd = `\n\n[KULLANILACAK ÖZEL MADDE - ${clause.title}]:\n"${clause.content}"`;
      setInstruction(prev => prev + textToAdd);
      setShowClauseModal(false);
  };


  return (
    <div className="h-full flex flex-col p-6 space-y-6 relative">
       <div className="mb-2 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Akıllı Sözleşme Hazırlayıcı</h2>
            <p className="text-slate-500 text-sm">Standart şablonlarımızı kullanarak veya sıfırdan yeni sözleşmeler oluşturun.</p>
          </div>
          <div className="flex gap-2">
              {versions.length > 0 && (
                  <button onClick={() => setShowVersions(true)} className="text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded text-sm flex items-center gap-2 font-medium">
                      <History size={16}/> Geçmiş Versiyonlar ({versions.length})
                  </button>
              )}
              {(template || instruction || draft) && (
                 <button onClick={clearAll} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded text-sm flex items-center gap-2">
                     <Trash2 size={16}/> Temizle
                 </button>
              )}
          </div>
        </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Input Column */}
        <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <BookTemplate size={16} /> Kaynak Şablon
                        {template && <CheckCircle size={14} className="text-green-500"/>}
                    </label>
                </div>

                {/* Dropdown for Knowledge Base */}
                {context.masterContracts && context.masterContracts.length > 0 ? (
                    <div className="relative">
                        <select 
                            value={selectedMasterId}
                            onChange={handleMasterSelect}
                            className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="">-- Boş Şablon / Sıfırdan Yaz --</option>
                            {context.masterContracts.map(m => (
                                <option key={m.id} value={m.id}>📄 {m.type} Şablonunu Kullan</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-blue-800">▼</div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded">
                        * Profil sekmesinden standart sözleşme yüklerseniz burada görünür.
                    </div>
                )}
                
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">VEYA</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                     <span className="text-xs text-slate-500">Manuel dosya yükleyin (Görsel Dahil):</span>
                     <label className="cursor-pointer text-xs font-medium hover:underline flex items-center gap-1 transition-colors bg-white border border-slate-200 px-3 py-2 rounded-lg sm:border-0 sm:p-0 sm:bg-transparent justify-center w-full sm:w-auto">
                        {isFileLoading ? <Loader2 className="animate-spin text-blue-600" size={12}/> : uploadedFileName ? <CheckCircle className="text-green-600" size={12}/> : <FileText className="text-blue-600" size={12}/>}
                        <span className={uploadedFileName ? "text-green-600 font-bold" : "text-blue-600"}>
                            {isFileLoading ? 'Okunuyor (OCR)...' : uploadedFileName ? `${uploadedFileName} Yüklendi` : '.docx / .pdf / .jpg Yükle'}
                        </span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.doc,.docx,.pdf,.jpg,.png"/>
                    </label>
                </div>

                <textarea
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder-slate-400 shadow-sm"
                    placeholder="Seçilen şablon içeriği buraya gelir veya manuel yapıştırabilirsiniz..."
                />
            </div>

            {/* User Instructions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col relative">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FilePlus size={16} /> Değişkenler & Talimatlar
                    </label>
                    <button 
                        onClick={() => setShowClauseModal(true)}
                        className="text-xs bg-teal-50 text-teal-700 px-3 py-2 rounded-lg font-bold border border-teal-100 hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <BookMarked size={14} /> <span className="truncate">Kütüphaneden Madde Ekle</span>
                    </button>
                </div>
                
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="flex-1 w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 placeholder-slate-400 shadow-sm"
                    placeholder="Örn: 'ABC Ltd. Şti.' ile yapılacak Demo Sözleşmesi. Süre 30 gün. Kütüphaneden 'Standart Gizlilik' maddesini ekle..."
                />
                <button
                    onClick={handleDraft}
                    disabled={loading || !instruction}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    {loading ? 'Avukat Yazıyor...' : 'Sözleşmeyi Hazırla'}
                </button>
            </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Oluşturulan Belge</h3>
                {draft && (
                    <div className="flex gap-2">
                        <button 
                            onClick={copyToClipboard} 
                            className={`p-2 rounded transition-colors flex items-center gap-1 text-xs font-bold ${copySuccess ? 'bg-green-100 text-green-700' : 'hover:bg-slate-200 text-slate-600'}`}
                            title="Kopyala"
                        >
                            {copySuccess ? <Check size={16}/> : <Copy size={16} />}
                            {copySuccess && "Kopyalandı"}
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-white">
                {draft ? (
                    <pre className="whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed max-w-none animate-fade-in">
                        {draft}
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        {loading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <Loader2 size={48} className="mb-4 text-blue-500 animate-spin" />
                                <p className="text-slate-600 font-medium">Sözleşme hazırlanıyor...</p>
                                <p className="text-xs text-slate-400 mt-2">Bu işlem sözleşme uzunluğuna göre 30-60 saniye sürebilir.</p>
                            </div>
                        ) : (
                            <>
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p className="text-center px-8">Sol taraftan bir standart şablon seçin ve değişkenleri girin. AI sizin formatınızı bozmadan belgeyi dolduracaktır.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Clause Selector Modal */}
      {showClauseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-teal-50 rounded-t-xl">
                      <h3 className="font-bold text-teal-800 flex items-center gap-2">
                          <BookMarked size={18}/> Kütüphaneden Madde Seç
                      </h3>
                      <button onClick={() => setShowClauseModal(false)} className="text-slate-500 hover:text-slate-800"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                      {libraryClauses.length === 0 ? (
                          <div className="text-center text-slate-400 py-10">
                              <BookTemplate size={40} className="mx-auto mb-2 opacity-20"/>
                              <p>Kütüphanenizde henüz kayıtlı madde yok.</p>
                              <p className="text-xs mt-1">"Kütüphane" sekmesinden sık kullanılan maddelerinizi ekleyin.</p>
                          </div>
                      ) : (
                        libraryClauses.map(clause => (
                            <div key={clause.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-800">{clause.title}</span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">{clause.category}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 font-mono mb-3">{clause.content}</p>
                                <button 
                                    onClick={() => insertClauseToInstruction(clause)}
                                    className="w-full py-2 bg-slate-50 hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-bold rounded border border-slate-200 hover:border-teal-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={14}/> Talimatlara Ekle
                                </button>
                            </div>
                        ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Version History Modal */}
      {showVersions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <History size={18}/> Geçmiş Versiyonlar
                      </h3>
                      <button onClick={() => setShowVersions(false)} className="text-slate-500 hover:text-slate-800"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                      {versions.map((ver, idx) => (
                          <div key={ver.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-slate-500">Versiyon {versions.length - idx}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(ver.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-600 mb-3 line-clamp-2 italic">"{ver.instruction}"</p>
                              <button 
                                onClick={() => restoreVersion(ver)}
                                className="w-full py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold rounded border border-blue-200 transition-colors flex items-center justify-center gap-2"
                              >
                                  <RotateCcw size={14}/> Bu Versiyona Dön
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ContractDrafter;