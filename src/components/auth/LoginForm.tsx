/**
 * Componente de formulário de login do T-Draw
 * Interface de autenticação com campos de email e senha
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import background from '../../assets/images/background.jpg';
import logo from '../../assets/images/logo.png';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Manipula o processo de login
   */
  const handleLogin = async () => {
    if (!email || !senha) {
      setError('Email e senha são obrigatórios');
      setSenha('');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, digite um email válido');
      setSenha('');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulando login bem-sucedido para permitir acesso ao diagrama
      // Em produção, aqui seria feita a chamada para a API
      setTimeout(() => {
        console.log('Login realizado com sucesso');
        navigate('/diagram');
        setLoading(false);
      }, 1000);
      
      /* API call real seria algo como:
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login realizado:', data.user);
        navigate('/diagram');
      } else {
        setError(data.message || 'Erro no login');
        setSenha('');
      }
      */
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão. Tente novamente.');
      setSenha('');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="page-login">
      <button 
        className="absolute top-4 left-4 md:top-8 md:left-8 bg-white bg-opacity-20 text-white border-none py-2 px-4 md:py-3 md:px-6 rounded-lg cursor-pointer text-sm md:text-base transition-all duration-300 hover:bg-white hover:bg-opacity-30 z-10"
        onClick={handleBackToHome}
      >
        ← Voltar
      </button>
      
      <div 
        className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center p-4"
        style={{
          backgroundImage: `url(${background})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      >
        <div className="bg-white bg-opacity-90 rounded-2xl p-6 md:p-8 lg:p-10 flex flex-col items-center w-full max-w-sm md:max-w-md">
          <img src={logo} alt="Logo" className="w-32 md:w-40 lg:w-44 mb-4" />
          <h1 className="font-black mb-6 text-2xl md:text-3xl text-gray-800">
            T-DRAW
          </h1>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 md:p-3.5 mb-4 rounded-lg border border-gray-300 text-sm md:text-base focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 md:p-3.5 mb-4 rounded-lg border border-gray-300 text-sm md:text-base focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          />
          
          <button 
            className="w-full p-3 md:p-3.5 bg-blue-700 text-white border-none rounded-lg font-light cursor-pointer text-lg md:text-xl hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          {error && (
            <div className="fixed top-5 right-5 bg-red-600 text-white py-3 md:py-4 px-4 md:px-5 rounded-lg text-sm md:text-base z-[1000] shadow-lg border-l-4 border-red-800 animate-slideIn max-w-xs md:max-w-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
