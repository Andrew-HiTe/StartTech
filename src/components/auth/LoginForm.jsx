/**
 * Componente de Login do StartTech
 * Conecta com backend MySQL para autenticação
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import './LoginForm.css';
import homelogo from '../../assets/images/homelogo.png';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
      await login(email, senha);
      console.log('✅ Login realizado com sucesso');
      navigate('/diagram');
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
      setSenha('');
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
      <button className="login-back-button" onClick={handleBackToHome}>
        ← Voltar
      </button>
      
      <div 
        className="login-page"
        style={{
          backgroundImage: `url('/background.jpg')`,
        }}
      >
        <div className="login-form-container">
          <img src={homelogo} alt="StartTech Logo" className="login-logo" />
          
          {/* Erro */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="login-input"
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyPress={handleKeyPress}
            className="login-input"
            disabled={loading}
          />

          {/* Usuários de teste - design melhorado */}
          <div className="login-test-users">
            <p className="login-test-users-title">👤 Usuários de teste:</p>
            <div className="login-test-users-list">
              <div>• admin@starttech.com / admin</div>
              <div>• editor@starttech.com / editor</div>
              <div>• reader@starttech.com / reader</div>
            </div>
          </div>
          
          <button 
            className="login-button" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="login-spinner"></span>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
