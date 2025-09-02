import './App.css';
import LoginForm from './components/loginForm';

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