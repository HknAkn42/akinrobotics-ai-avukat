import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  users: User[]; // Admin panel için tüm kullanıcılar
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User & { password?: string }) => void;
  removeUser: (id: string) => void;
  resetPassword: (id: string, newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Varsayılan Admin
const DEFAULT_ADMIN: User & { password?: string } = {
  id: 'admin-1',
  name: 'Sistem Yöneticisi',
  role: 'ADMIN',
  username: 'admin', // Basit admin
  password: '1234'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password?: string })[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Başlangıçta kullanıcıları yükle
  useEffect(() => {
    const storedUsers = localStorage.getItem('lexguard_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Hiç kullanıcı yoksa varsayılan admini ekle
      const initialUsers = [DEFAULT_ADMIN];
      setUsers(initialUsers);
      localStorage.setItem('lexguard_users', JSON.stringify(initialUsers));
    }

    // Oturum kontrolü
    const session = localStorage.getItem('lexguard_session');
    if (session) {
      setUser(JSON.parse(session));
      setIsAuthenticated(true);
    }
  }, []);

  // Kullanıcı listesi değişince kaydet
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('lexguard_users', JSON.stringify(users));
    }
  }, [users]);

  const login = async (username: string, pass: string): Promise<boolean> => {
    // Gerçek bir backend olmadığı için yerel listeden kontrol ediyoruz
    // Not: Prodüksiyonda şifreler asla düz metin (plain text) saklanmaz!
    // Bu bir demo/prototip olduğu için kabul edilebilir.
    
    // Admin override (hardcoded fallback)
    if (username === 'admin@akinrobotics.com' && pass === 'akin2024!') {
        const adminUser = { id: 'master-admin', name: 'Master Admin', role: 'ADMIN' as UserRole, username: 'admin@akinrobotics.com' };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('lexguard_session', JSON.stringify(adminUser));
        return true;
    }

    const foundUser = users.find(u => (u.username === username || u.id === username) && u.password === pass);
    
    if (foundUser) {
      // Şifreyi session objesinden çıkaralım
      const { password, ...safeUser } = foundUser;
      setUser(safeUser);
      setIsAuthenticated(true);
      localStorage.setItem('lexguard_session', JSON.stringify(safeUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lexguard_session');
  };

  const addUser = (newUser: User & { password?: string }) => {
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };
  
  const resetPassword = (id: string, newPass: string) => {
      setUsers(prev => prev.map(u => {
          if (u.id === id) {
              return { ...u, password: newPass };
          }
          return u;
      }));
  };

  return (
    <AuthContext.Provider value={{ user, users, isAuthenticated, login, logout, addUser, removeUser, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
