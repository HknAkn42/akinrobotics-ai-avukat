import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Users, UserPlus, Trash2, Copy, Check, Shield, Key, Lock, ExternalLink } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { users, addUser, removeUser } = useAuth();
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'LAWYER' as UserRole });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{username: string, password: string, link: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) return;

    const user: User & { password?: string } = {
      id: Date.now().toString(),
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`
    };

    addUser(user);
    
    // Show success modal with credentials
    const appLink = window.location.origin;
    setCreatedUserCredentials({
        username: newUser.username,
        password: newUser.password,
        link: appLink
    });
    setShowSuccessModal(true);

    // Reset form
    setNewUser({ name: '', username: '', password: '', role: 'LAWYER' });
  };

  const copyToClipboard = () => {
    if (!createdUserCredentials) return;
    
    const text = `
Merhaba,
AKINROBOTICS AI Avukat sistemine erişim bilgileriniz aşağıdadır:

🔗 Uygulama Linki: ${createdUserCredentials.link}
👤 Kullanıcı Adı: ${createdUserCredentials.username}
🔑 Şifre: ${createdUserCredentials.password}

Lütfen giriş yaptıktan sonra şifrenizi güvenli bir yerde saklayınız.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Shield className="text-blue-600" size={32} />
          Yönetim Paneli
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Kullanıcıları yönetin, yeni hesaplar oluşturun ve erişim yetkilerini düzenleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ADD USER FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-500" />
              Yeni Kullanıcı Ekle
            </h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kullanıcı Adı (E-Posta)</label>
                <input 
                  type="text" 
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="ahmet.yilmaz"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
                <div className="relative">
                    <input 
                      type="text" 
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="Güçlü bir şifre belirleyin"
                      required
                    />
                    <button 
                        type="button"
                        onClick={() => setNewUser({...newUser, password: Math.random().toString(36).slice(-8) + '!'})}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-blue-500"
                        title="Rastgele Şifre Oluştur"
                    >
                        <Key size={16} />
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol / Yetki</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="LAWYER">Avukat (Standart)</option>
                  <option value="ADMIN">Yönetici (Tam Yetki)</option>
                  <option value="INTERN">Stajyer (Kısıtlı)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Kullanıcıyı Oluştur
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: USER LIST */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-indigo-500" />
                Kayıtlı Kullanıcılar ({users.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Kullanıcı</th>
                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Rol</th>
                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700">Kullanıcı Adı</th>
                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-700 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' 
                            : user.role === 'LAWYER'
                            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                          {user.role === 'ADMIN' ? 'YÖNETİCİ' : user.role === 'LAWYER' ? 'AVUKAT' : 'STAJYER'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-mono">
                        {user.username}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => removeUser(user.id)}
                          disabled={user.username === 'admin' || user.username === 'admin@akinrobotics.com'} // Prevent deleting master admin
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && createdUserCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 transform scale-100 transition-all">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Kullanıcı Oluşturuldu!</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
              Aşağıdaki bilgileri kopyalayarak yeni kullanıcı ile paylaşabilirsiniz.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Uygulama Linki</span>
                <a href={createdUserCredentials.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Aç <ExternalLink size={10}/>
                </a>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Kullanıcı Adı</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{createdUserCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Şifre</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {createdUserCredentials.password}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Kapat
              </button>
              <button 
                onClick={copyToClipboard}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Kopyalandı!' : 'Bilgileri Kopyala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
