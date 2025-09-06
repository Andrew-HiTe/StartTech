/**
 * Componente de formulário de login do T-Draw
 * Interface de autenticação com campos de email e senha
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

/**
 * Componente que renderiza o formulário de login
 */
function LoginForm() {
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
      setSenha(''); // Limpa a senha quando há erro de validação
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, digite um email válido');
      setSenha(''); // Limpa a senha quando há erro de validação
      return;
    }

    setLoading(true);
    setError('');
    
    try {
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
        // Redirecionar para o gerenciador de acessos após login
        navigate('/access-manager');
      } else {
        setError(data.message || 'Erro no login');
        setSenha(''); // Limpa a senha quando há erro
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro de conexão. Tente novamente.');
      setSenha(''); // Limpa a senha quando há erro de conexão
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <button className="back-button" onClick={handleBackToHome}>
        ← Voltar
      </button>
      
      <div 
        className="login-background"
        style={{
          backgroundImage: `url('/background.jpg')`,
        }}
      >
        <div className="login-container">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1 className="titulo">T-DRAW</h1>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input"
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input"
            disabled={loading}
          />
          
          <button 
            className="entrar" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          {error && (
            <div className="error-notification">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LoginForm;
