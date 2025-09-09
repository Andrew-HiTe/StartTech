/**
 * Servidor principal da aplicação T-Draw
 * Unifica backend de autenticação e controle de acesso
 * Configura e inicia o servidor Express com middleware CORS
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const AuthController = require('./controllers/AuthController');
const authRoutes = require('./routes/authRoutes');
const accessRoutes = require('./routes/accessRoutes');
const diagramRoutes = require('./routes/diagramRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/diagrams', diagramRoutes);

// Rota básica para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor T-Draw funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Rota para servir a página inicial (desenvolvimento)
app.get('/', (req, res) => {
  res.json({ 
    message: 'T-Draw Backend API',
    endpoints: {
      auth: '/api/auth/login',
      access: '/api/access/*',
      diagrams: '/api/diagrams/*',
      health: '/api/health'
    }
  });
});

// Verifica senhas não criptografadas a cada 30 segundos (reduzido de 1 segundo)
// Timer apenas para verificação periódica, não crítico para funcionamento
let senhaVerificationTimer = setInterval(() => {
  // Verificar se há conexão ativa antes de executar
  if (db && typeof db.execute === 'function') {
    AuthController.verificaSenhas().catch(error => {
      console.log('Verificação de senhas pulada devido a erro de conexão');
      // Se houver muitos erros consecutivos, pausar o timer temporariamente
      if (error.message && error.message.includes('closed state')) {
        console.log('Pausando verificação de senhas por 60 segundos devido a conexão fechada');
        clearInterval(senhaVerificationTimer);
        setTimeout(() => {
          senhaVerificationTimer = setInterval(arguments.callee, 30000);
        }, 60000);
      }
    });
  }
}, 30000); // 30 segundos ao invés de 1 segundo

// Tratamento de erros
app.on('error', (error) => {
  console.error('Erro no servidor:', error);
});

const server = app.listen(PORT, '127.0.0.1', (error) => {
  if (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
  console.log(`Servidor T-Draw rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
  console.log(`Frontend disponível em: http://localhost:${PORT}`);
  
  // Verificar se o servidor está realmente escutando
  console.log('Endereço do servidor:', server.address());
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} já está em uso!`);
  } else {
    console.error('Erro no servidor:', error);
  }
  process.exit(1);
});

module.exports = app;
