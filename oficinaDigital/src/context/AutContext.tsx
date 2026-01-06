import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

// TROQUE PELO SEU IP DO IPCONFIG
const BASE_URL = 'http://192.168.100.10:3333';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('@OficinaDigital:user');
      const storedToken = localStorage.getItem('@OficinaDigital:token');

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.clear();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // USANDO O IP EM VEZ DE LOCALHOST
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha na autenticação');
      }

      setUser(data.user);
      localStorage.setItem('@OficinaDigital:user', JSON.stringify(data.user));
      localStorage.setItem('@OficinaDigital:token', data.token);

      return data.user;
    } catch (error) {
      console.error("Erro no AuthContext:", error);
      throw error; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@OficinaDigital:user');
    localStorage.removeItem('@OficinaDigital:token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isLoading 
    }}>
      {!isLoading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black italic text-orange-500 animate-pulse">
          AUTENTICANDO...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};