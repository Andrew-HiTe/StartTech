import './App.css';
import logo from './logo.png';
import { useState } from 'react';
import Home from './pager/Home';

function App() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loginErro, setLoginErro] = useState(false);

  const handleLogin = () => {
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/dashboard'; // Coloca o link da pag. aqui
        } else {
          setLoginErro(true);
          setSenha('');
          setTimeout(() => setLoginErro(false), 3000);
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        setLoginErro(true);
        setSenha('');
        setTimeout(() => setLoginErro(false), 3000);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="App">
      <Home imagem={logo} />
      <header className="App-header">
        {loginErro && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#f44336',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            zIndex: 1000
          }}>
            Email ou senha incorretos!
          </div>
        )}
        <div className="login-background">
          <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
            <h1 className="titulo">T-DRAW</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input"
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input"
            />
            <button className="entrar" onClick={handleLogin}>Entrar</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
