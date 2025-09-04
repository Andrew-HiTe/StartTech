/**
 * Ponto de entrada da aplicação React
 * Responsável por renderizar o componente App
 * no elemento root do DOM
 */

import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);