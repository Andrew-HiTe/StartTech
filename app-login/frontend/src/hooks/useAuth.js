import { useState, useEffect } from 'react';
import AuthService from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, senha) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await AuthService.login(email, senha);
      
      if (data.success) {
        return { success: true };
      } else {
        setError(data.message || 'Email ou senha incorretos');
        return { success: false };
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return { login, loading, error, showError, clearError };
};