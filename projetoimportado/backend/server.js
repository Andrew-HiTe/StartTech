/**
 * Servidor principal da aplicação T-Draw
 * Unifica backend de autenticação e controle de acesso
 * Configura e inicia o servidor Express com middleware CORS
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const AuthController = require('./controllers/AuthController');
const authRoutes = require('./routes/authRoutes');
const accessRoutes = require('./routes/accessRoutes');

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
      health: '/api/health'
    }
  });
});

// Verifica senhas não criptografadas a cada 1 segundo
setInterval(AuthController.verificaSenhas, 1000);

app.listen(PORT, () => {
  console.log(`Servidor T-Draw rodando na porta ${PORT}`);
  console.log(`API disponível em: http://localhost:${PORT}/api`);
  console.log(`Frontend disponível em: http://localhost:${PORT}`);
});

module.exports = app;
