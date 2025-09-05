const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota básica
app.get('/', (req, res) => {
  res.json({ message: 'Servidor do Gerenciador de Acessos rodando!' });
});

// Rota para buscar projetos
app.get('/api/projects', (req, res) => {
  const projects = [
    { id: 1, name: 'Projeto Alpha', description: 'Sistema de gestão financeira' },
    { id: 2, name: 'Projeto Beta', description: 'Plataforma de e-commerce' },
    { id: 3, name: 'Projeto Gamma', description: 'Sistema de recursos humanos' },
    { id: 4, name: 'Projeto Delta', description: 'Portal de cliente' }
  ];
  res.json(projects);
});

// Rota para buscar colaboradores
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
