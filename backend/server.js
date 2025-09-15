/**
 * Servidor Backend para StartTech
 * Conecta com MySQL local para testes
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar limite para diagramas grandes

// Configuração MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'starttech_db',
  port: process.env.DB_PORT || 3306
};

// Função para conectar ao banco
async function connectDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL com sucesso!');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
    throw error;
  }
}

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// 🔐 Rota de Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await connectDB();

    // Buscar usuário
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      await connection.end();
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0];

    // Verificar senha (para desenvolvimento, vamos aceitar qualquer senha)
    const isValidPassword = password === 'admin' || await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await connection.end();
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    await connection.end();

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//  Rota para salvar diagrama
app.post('/api/diagrams', authenticateToken, async (req, res) => {
  try {
    const { name, data } = req.body;
    
    // Validação dos dados
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome do diagrama é obrigatório' });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Dados do diagrama são obrigatórios' });
    }

    // Log para debug
    console.log('📝 Salvando diagrama:', name);
    console.log('📊 Dados recebidos:', JSON.stringify(data).substring(0, 100) + '...');
    
    const connection = await connectDB();

    const [result] = await connection.execute(
      'INSERT INTO diagrams (user_id, name, data) VALUES (?, ?, ?)',
      [req.user.userId, name, JSON.stringify(data)]
    );

    await connection.end();

    console.log('✅ Diagrama salvo com ID:', result.insertId);
    
    res.json({
      id: result.insertId,
      message: 'Diagrama salvo com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao salvar diagrama:', error);
    res.status(500).json({ error: 'Erro ao salvar diagrama' });
  }
});

// 🔄 Rota para atualizar diagrama
app.put('/api/diagrams/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, data } = req.body;
    
    // Validação dos dados
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Dados do diagrama são obrigatórios' });
    }

    // Log para debug
    console.log('🔄 Atualizando diagrama ID:', id);
    console.log('📊 Novos dados:', JSON.stringify(data).substring(0, 100) + '...');
    
    const connection = await connectDB();

    const [result] = await connection.execute(
      'UPDATE diagrams SET name = ?, data = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [name, JSON.stringify(data), id, req.user.userId]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Diagrama não encontrado' });
    }

    console.log('✅ Diagrama ID', id, 'atualizado com sucesso');
    res.json({ message: 'Diagrama atualizado com sucesso!' });

  } catch (error) {
    console.error('Erro ao atualizar diagrama:', error);
    res.status(500).json({ error: 'Erro ao atualizar diagrama' });
  }
});

// 🗑️ Rota para deletar diagrama
app.delete('/api/diagrams/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();

    await connection.execute(
      'DELETE FROM diagrams WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    await connection.end();

    res.json({ message: 'Diagrama deletado com sucesso!' });

  } catch (error) {
    console.error('Erro ao deletar diagrama:', error);
    res.status(500).json({ error: 'Erro ao deletar diagrama' });
  }
});

// ====================================================
// ROTAS PARA DIAGRAMAS
// ====================================================

// 📄 Listar diagramas do usuário
app.get('/api/diagrams', authenticateToken, async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT id, name, created_at, updated_at, version
       FROM diagrams 
       WHERE user_id = ? AND is_active = 1 
       ORDER BY updated_at DESC`,
      [req.user.userId]
    );
    await connection.end();

    res.json({
      success: true,
      diagrams: rows
    });
  } catch (error) {
    console.error('❌ Erro ao buscar diagramas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// 📋 Buscar diagrama específico
app.get('/api/diagrams/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `SELECT * FROM diagrams 
       WHERE id = ? AND user_id = ? AND is_active = 1`,
      [req.params.id, req.user.userId]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Diagrama não encontrado'
      });
    }

    const diagram = rows[0];
    
    // Parse do JSON data com validação melhorada
    try {
      if (typeof diagram.data === 'string') {
        // Se data é string, fazer parse
        diagram.data = JSON.parse(diagram.data);
      } else if (typeof diagram.data === 'object' && diagram.data !== null) {
        // Se já é objeto, manter
        console.log('📄 Data já é objeto para diagrama:', diagram.id);
      } else {
        // Se é null ou undefined, usar dados vazios
        console.log('⚠️ Data é null/undefined para diagrama:', diagram.id);
        diagram.data = { nodes: [], edges: [] };
      }
      
      // Validar estrutura dos dados
      if (!diagram.data.nodes) diagram.data.nodes = [];
      if (!diagram.data.edges) diagram.data.edges = [];
      
      console.log('📊 Diagrama carregado:', diagram.name, 'com', diagram.data.nodes.length, 'nós');
      
    } catch (e) {
      console.error('❌ Erro ao fazer parse do JSON para diagrama', diagram.id, ':', e);
      console.error('📄 Dados problemáticos:', typeof diagram.data, diagram.data?.substring?.(0, 100));
      diagram.data = { nodes: [], edges: [] };
    }

    res.json({
      success: true,
      diagram
    });
  } catch (error) {
    console.error('❌ Erro ao buscar diagrama:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// 💾 Salvar novo diagrama
app.post('/api/diagrams', authenticateToken, async (req, res) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({
        error: 'Nome e dados do diagrama são obrigatórios'
      });
    }

    // Validar estrutura dos dados
    if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return res.status(400).json({
        error: 'Estrutura de dados inválida. Esperado: {nodes: [], edges: []}'
      });
    }

    const connection = await connectDB();
    const [result] = await connection.execute(
      `INSERT INTO diagrams (user_id, name, data, version) 
       VALUES (?, ?, ?, 1)`,
      [req.user.id, name, JSON.stringify(data)]
    );
    await connection.end();

    res.json({
      success: true,
      diagramId: result.insertId,
      message: 'Diagrama salvo com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao salvar diagrama:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// ✏️ Atualizar diagrama existente
app.put('/api/diagrams/:id', authenticateToken, async (req, res) => {
  try {
    const { name, data } = req.body;
    const diagramId = req.params.id;

    if (!name || !data) {
      return res.status(400).json({
        error: 'Nome e dados do diagrama são obrigatórios'
      });
    }

    // Validar estrutura dos dados
    if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return res.status(400).json({
        error: 'Estrutura de dados inválida. Esperado: {nodes: [], edges: []}'
      });
    }

    const connection = await connectDB();
    
    // Verificar se o diagrama existe e pertence ao usuário
    const [checkRows] = await connection.execute(
      'SELECT id FROM diagrams WHERE id = ? AND user_id = ? AND is_active = 1',
      [diagramId, req.user.id]
    );

    if (checkRows.length === 0) {
      await connection.end();
      return res.status(404).json({
        error: 'Diagrama não encontrado'
      });
    }

    // Atualizar diagrama
    const [result] = await connection.execute(
      `UPDATE diagrams 
       SET name = ?, data = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ?`,
      [name, JSON.stringify(data), diagramId, req.user.id]
    );
    await connection.end();

    res.json({
      success: true,
      message: 'Diagrama atualizado com sucesso',
      affected: result.affectedRows
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar diagrama:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// 🗑️ Excluir diagrama (soft delete)
app.delete('/api/diagrams/:id', authenticateToken, async (req, res) => {
  try {
    const diagramId = req.params.id;
    const connection = await connectDB();
    
    const [result] = await connection.execute(
      `UPDATE diagrams 
       SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND user_id = ? AND is_active = 1`,
      [diagramId, req.user.id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Diagrama não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Diagrama excluído com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao excluir diagrama:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// 🏥 Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const connection = await connectDB();
    await connection.ping();
    await connection.end();
    
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
