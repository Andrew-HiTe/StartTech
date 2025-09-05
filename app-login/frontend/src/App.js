import './App.css';
import Home from './pager/Home';
import homelogo from './imagens/homelogo.png'
import diagrama from './imagens/diagrama.jpg'
import LoginForm from './components/loginForm'
import { useState } from 'react';

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
      {/*<header className="App-header">
        <div 
          className="login-background"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`
          }}
        >
          <LoginForm/>
        </div>
      </header>*/}
      <Home imagem={homelogo} diag={diagrama}/>
    </div>
  );
}

export default App;
