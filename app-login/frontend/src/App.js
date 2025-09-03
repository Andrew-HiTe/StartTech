/**
 * Componente principal da aplicação React
 * Renderiza a interface de login com background personalizado
 * e estrutura o layout principal da aplicação
 */

import './App.css';
import LoginForm from './components/loginForm';

/**
 * Componente raiz que estrutura a aplicação com formulário de login
 */
function App() {
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

export default App;