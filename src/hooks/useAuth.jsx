/**
 * Hook de Autenticação
 * Gerencia estado de login/logout do usuário
 */

import { useState, useEffect, createContext, useContext } from 'react';

// Contexto de autenticação
const AuthContext = createContext();

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setLoading(false);
  }, []);

  // Função de login
  const login = async (userData, password) => {
    try {
      // Fazer requisição para o backend
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userData.email || userData, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Salvar no localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('✅ Login realizado:', data.user);
      return data;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Limpar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    console.log('🚪 Logout realizado');
  };

  // Função para verificar se é admin
  const isAdmin = () => {
    return user?.email?.includes('admin') || false;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin: isAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
