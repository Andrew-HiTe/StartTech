/**
 * Componente de formulário de login
 * Interface simples de autenticação com campos de email e senha
 */

import React, { useState } from 'react';

/**
 * Componente que renderiza o formulário de login
 */
function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Manipula o processo de login
   */
  const handleLogin = () => {
    if (!email || !senha) {
      setError('Email e senha são obrigatórios');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, digite um email válido');
      return;
    }

    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setLoading(false);
      console.log('Login realizado:', { email, senha });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <img src={"/logo.png"} alt="Logo" className="logo" />
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
  );
}

export default LoginForm;