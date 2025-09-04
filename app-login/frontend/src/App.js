/**
 * Componente principal da aplicação React
 * Renderiza primeiro a Home e depois o Login quando necessário
 */

import './App.css';
import Home from './pager/Home';
import homelogo from './imagens/homelogo.png'
import diagrama from './imagens/diagrama.jpg'
import LoginForm from './components/loginForm'
import { useState } from 'react';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  // Função para mostrar a tela de login
  const handleShowLogin = () => {
    setShowLogin(true);
  };

  // Se showLogin for true, renderiza a tela de login
  if (showLogin) {
    return (
      <div className="App">
        <header className="App-header">
          <div 
            className="login-background"
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`
            }}
          >
            <LoginForm />
          </div>
        </header>
      </div>
    );
  }

  // Por padrão, renderiza a página Home
  return (
    <div className="App">
      <Home imagem={homelogo} diag={diagrama} onShowLogin={handleShowLogin} />
    </div>
  );
}

export default App;