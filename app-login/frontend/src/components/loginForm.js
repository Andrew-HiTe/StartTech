import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, loading, error, showError } = useAuth();

  const handleLogin = async () => {
    // Validação local
    if (!email || !senha) {
      showError('Email e senha são obrigatórios');
      return;
    }

    if (!email.includes('@')) {
      showError('Por favor, digite um email válido');
      return;
    }

    const result = await login(email, senha);
    
    if (result.success) {
      window.location.href = '/dashboard'; // redirect
    } else {
      setSenha(''); // Limpa apenas a senha
    }
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