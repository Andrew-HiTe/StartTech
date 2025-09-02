const express = require('express');
const cors = require('cors');
const AuthController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', authRoutes);

// Verificar senhas não criptografadas a cada 1 segundo
setInterval(AuthController.verificaSenhas, 1000);

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});