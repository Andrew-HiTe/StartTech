const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'teste'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rota básica
app.get('/', (req, res) => {
  res.json({ message: 'Servidor do Gerenciador de Acessos rodando!' });
});

// Rota para verificar se email existe no banco
app.post('/api/verify-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  const query = 'SELECT email FROM usuarios WHERE email = ?';
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const exists = results.length > 0;
    res.json({ 
      exists, 
      email: exists ? results[0].email : null,
      message: exists ? 'Email encontrado' : 'Email não cadastrado' 
    });
  });
});

// Rota para buscar colaboradores por termo de pesquisa
app.get('/api/search-collaborators', (req, res) => {
  const { search } = req.query;
  
  if (!search || search.length < 2) {
    return res.json({ collaborators: [] });
  }

  // Como a tabela só tem email, vamos buscar apenas por email
  const query = 'SELECT email FROM usuarios WHERE email LIKE ? LIMIT 10';
  const searchTerm = `%${search}%`;
  
  db.query(query, [searchTerm], (err, results) => {
    if (err) {
      console.error('Erro ao buscar colaboradores:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const collaborators = results.map(user => ({
      email: user.email,
      name: user.email
    }));
    
    res.json({ collaborators });
  });
});

app.get('/api/projects', (req, res) => {
  const projects = [
    { id: 1, name: 'Projeto Alpha', description: 'Sistema de gestão financeira' },
    { id: 2, name: 'Projeto Beta', description: 'Plataforma de e-commerce' },
    { id: 3, name: 'Projeto Gamma', description: 'Sistema de recursos humanos' },
    { id: 4, name: 'Projeto Delta', description: 'Portal de cliente' }
  ];
  res.json(projects);
});

app.get('/api/collaborators', (req, res) => {
  const { search } = req.query;
  let collaborators = [
    { id: 1, name: 'João Silva', email: 'joao.silva@empresa.com', role: 'Desenvolvedor Frontend' },
    { id: 2, name: 'Maria Santos', email: 'maria.santos@empresa.com', role: 'Desenvolvedor Backend' },
    { id: 3, name: 'Pedro Costa', email: 'pedro.costa@empresa.com', role: 'DevOps' },
    { id: 4, name: 'Ana Oliveira', email: 'ana.oliveira@empresa.com', role: 'Designer UX/UI' },
    { id: 5, name: 'Carlos Lima', email: 'carlos.lima@empresa.com', role: 'Product Manager' }
  ];

  if (search) {
    collaborators = collaborators.filter(collab => 
      collab.name.toLowerCase().includes(search.toLowerCase()) ||
      collab.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(collaborators);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
