import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ticketsAdminAuth');
    if (stored === 'true') setIsAdmin(true);
    setLoading(false);
  }, []);

  const login = (password: string): boolean => {
    const correct = import.meta.env.VITE_ADMIN_PASSWORD ?? 'changeme';
    if (password === correct) {
      setIsAdmin(true);
      localStorage.setItem('ticketsAdminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('ticketsAdminAuth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
