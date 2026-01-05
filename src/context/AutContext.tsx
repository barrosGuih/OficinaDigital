import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>; // Adicionado password
  logout: () => void;
  isLoading: boolean; // Útil para não piscar a tela de login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ao carregar o app, verifica se o usuário já estava logado
    const storedUser = localStorage.getItem('@OficinaDigital:user');
    const storedToken = localStorage.getItem('@OficinaDigital:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // CHAMADA REAL PARA O SEU BACKEND
      const response = await fetch('http://localhost:3333/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se o backend retornar erro (401, etc), lança para o catch
        throw new Error(data.error || 'Falha na autenticação');
      }

      // Se deu certo, o backend retorna { user, token }
      setUser(data.user);
      
      // Salva no localStorage para persistir o acesso
      localStorage.setItem('@OficinaDigital:user', JSON.stringify(data.user));
      localStorage.setItem('@OficinaDigital:token', data.token);

    } catch (error) {
      console.error("Erro no login context:", error);
      throw error; // Repassa o erro para a tela de Login exibir a mensagem
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@OficinaDigital:user');
    localStorage.removeItem('@OficinaDigital:token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isLoading 
    }}>
      {!isLoading && children} 
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