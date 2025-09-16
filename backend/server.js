/**
 * Servidor Backend para StartTech
 * Conecta com MySQL local para testes
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Array em memória para classificações criadas dinamicamente
let createdClassifications = [];

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

console.log('🔧 Configuração do banco:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  hasPassword: !!dbConfig.password
});

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

// Middleware de autenticação simplificado para desenvolvimento
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  // Durante desenvolvimento, aceitar tokens simples
  if (token === 'admin@starttech.com' || token.includes('@')) {
    req.user = {
      userId: 1,
      email: token,
      role: 'admin',
      name: 'Administrador'
    };
    return next();
  }

  // Tentar verificar JWT se não for um token simples
  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Importar rotas de controle de acesso
// require('./access_control_routes')(app); // Temporariamente desabilitado devido a dependências do schema

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

// 🛠️ Rota temporária para criar usuário admin
app.post('/api/create-admin', async (req, res) => {
  try {
    const connection = await connectDB();
    
    // Verificar se já existe admin
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@starttech.com']
    );
    
    if (existing.length > 0) {
      await connection.end();
      return res.json({ message: 'Usuário admin já existe' });
    }
    
    // Criar usuário admin
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@starttech.com', 'admin123', 'Administrador', 'admin']
    );
    
    await connection.end();
    
    res.json({ 
      message: 'Usuário admin criado com sucesso!',
      email: 'admin@starttech.com',
      password: 'admin123'
    });
    
  } catch (error) {
    console.error('Erro ao criar admin:', error);
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
    console.log('📊 Dados recebidos - nodes:', data.nodes?.length || 0, 'edges:', data.edges?.length || 0);
    console.log('🔗 Edges recebidas:', data.edges);
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
    
    let query, params;
    
    // Admin pode ver todos os diagramas
    if (req.user.role === 'admin') {
      query = `SELECT d.id, d.name, d.created_at, d.updated_at, d.version, d.user_id,
                      u.name as owner_name, u.email as owner_email
               FROM diagrams d
               JOIN users u ON d.user_id = u.id
               WHERE d.is_active = 1 
               ORDER BY d.updated_at DESC`;
      params = [];
    } else {
      // Usuários normais veem apenas seus diagramas + diagramas compartilhados
      query = `SELECT DISTINCT d.id, d.name, d.created_at, d.updated_at, d.version, d.user_id,
                      u.name as owner_name, u.email as owner_email,
                      CASE 
                        WHEN d.user_id = ? THEN 'owner'
                        ELSE COALESCE(da.access_level, 'view')
                      END as access_level
               FROM diagrams d
               JOIN users u ON d.user_id = u.id
               LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ? AND da.is_active = 1
               WHERE d.is_active = 1 
               AND (d.user_id = ? OR da.user_email = ?)
               ORDER BY d.updated_at DESC`;
      params = [req.user.userId, req.user.email, req.user.userId, req.user.email];
    }
    
    const [rows] = await connection.execute(query, params);
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
    
    let query, params;
    
    // Admin pode acessar qualquer diagrama
    if (req.user.role === 'admin') {
      query = `SELECT d.*, u.name as owner_name, u.email as owner_email
               FROM diagrams d
               JOIN users u ON d.user_id = u.id
               WHERE d.id = ? AND d.is_active = 1`;
      params = [req.params.id];
    } else {
      // Usuários normais: próprios diagramas + diagramas compartilhados
      query = `SELECT d.*, u.name as owner_name, u.email as owner_email,
                      CASE 
                        WHEN d.user_id = ? THEN 'owner'
                        ELSE COALESCE(da.access_level, NULL)
                      END as access_level
               FROM diagrams d
               JOIN users u ON d.user_id = u.id
               LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ? AND da.is_active = 1
               WHERE d.id = ? AND d.is_active = 1
               AND (d.user_id = ? OR da.user_email = ?)`;
      params = [req.user.userId, req.user.email, req.params.id, req.user.userId, req.user.email];
    }
    
    const [rows] = await connection.execute(query, params);
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Diagrama não encontrado ou acesso negado'
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
      
      console.log('📊 Diagrama carregado:', diagram.name, 'com', diagram.data.nodes.length, 'nós e', diagram.data.edges.length, 'edges');
      console.log('🔗 Edges carregadas:', diagram.data.edges);
      console.log('👤 Acesso por:', req.user.email, '| Role:', req.user.role);
      
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

// ====================================================
// IMPORTAR E REGISTRAR ROTAS DE CONTROLE DE ACESSO
// ====================================================

// Carregar rotas no contexto atual (mesmo arquivo)
// As rotas usam o 'app' já definido, então incluímos o código diretamente

// 📋 Listar classificações de um diagrama (DESABILITADO - usando versão simplificada)
/*
app.get('/api/diagrams/:diagramId/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const connection = await connectDB();
    
    // Verificar se o usuário tem acesso ao diagrama
    let query, params;
    
    // Admin pode acessar qualquer diagrama
    if (req.user.role === 'admin') {
      query = `SELECT d.id, d.user_id, 'owner' as access_level
               FROM diagrams d
               WHERE d.id = ? AND d.is_active = 1`;
      params = [diagramId];
    } else {
      query = `SELECT d.id, d.user_id, da.access_level
               FROM diagrams d
               LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
               WHERE d.id = ? AND d.is_active = 1
               AND (d.user_id = ? OR da.is_active = 1)`;
      params = [req.user.email, diagramId, req.user.userId];
    }
    
    const [accessCheck] = await connection.execute(query, params);

    if (accessCheck.length === 0) {
      await connection.end();
      return res.status(403).json({ error: 'Acesso negado ao diagrama' });
    }

    // Buscar classificações do diagrama
    const [classifications] = await connection.execute(`
      SELECT 
        dc.*,
        u.name as created_by_name,
        COUNT(cp.id) as users_with_permission,
        COUNT(tc.id) as tables_with_classification
      FROM diagram_classifications dc
      LEFT JOIN users u ON dc.created_by = u.id
      LEFT JOIN classification_permissions cp ON dc.id = cp.classification_id AND cp.is_active = 1
      LEFT JOIN table_classifications tc ON dc.id = tc.classification_id AND tc.is_active = 1
      WHERE dc.diagram_id = ? AND dc.is_active = 1
      GROUP BY dc.id
      ORDER BY dc.display_order, dc.name
    `, [diagramId]);

    await connection.end();

    res.json({
      success: true,
      classifications,
      hasEditAccess: req.user.role === 'admin' || 
                     accessCheck[0].user_id === req.user.userId || 
                     ['edit', 'admin'].includes(accessCheck[0].access_level)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar classificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
*/

// ➕ Criar nova classificação (DESABILITADO - aguardando schema completo)
/*
app.post('/api/diagrams/:diagramId/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const { name, description, color, isDefault } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da classificação é obrigatório' });
    }

    const connection = await connectDB();
    
    // Verificar permissão de edição
    const [accessCheck] = await connection.execute(`
      SELECT d.user_id, da.access_level
      FROM diagrams d
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE d.id = ? AND d.is_active = 1
    `, [req.user.email, diagramId]);

    if (accessCheck.length === 0 || 
        (accessCheck[0].user_id !== req.user.userId && 
         !['edit', 'admin'].includes(accessCheck[0].access_level))) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente para criar classificação' });
    }

    // Se esta será a classificação padrão, remover flag das outras
    if (isDefault) {
      await connection.execute(`
        UPDATE diagram_classifications 
        SET is_default = FALSE 
        WHERE diagram_id = ?
      `, [diagramId]);
    }

    // Inserir nova classificação
    const [result] = await connection.execute(`
      INSERT INTO diagram_classifications 
      (diagram_id, name, description, color, is_default, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [diagramId, name.trim(), description || '', color || '#3B82F6', isDefault || false, req.user.userId]);

    await connection.end();

    res.json({
      success: true,
      classificationId: result.insertId,
      message: 'Classificação criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar classificação:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe uma classificação com este nome neste diagrama' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});
*/

// 🧪 Rota de teste para debug
app.get('/api/test-auth', authenticateToken, (req, res) => {
  console.log('🧪 Teste auth - user:', req.user);
  res.json({ message: 'Auth OK', user: req.user });
});

// 🔍 Verificar permissões efetivas do usuário  
app.get('/api/diagrams/:diagramId/my-permissions', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    console.log(`🔍 Verificando permissões para diagrama ${diagramId}, usuário: ${req.user.email}, role: ${req.user.role}`);
    
    // Admin tem acesso total a tudo - sem necessidade de conexão DB
    if (req.user.role === 'admin') {
      console.log('✅ Usuário é admin - acesso total concedido');
      return res.json({
        success: true,
        isOwner: true,
        hasAccess: true,
        permissions: {}, // Admin pode ver tudo
        visibleTables: [], // Lista vazia = pode ver tudo
        userRole: 'admin'
      });
    }
    
    // Para usuários não-admin, por enquanto conceder acesso também (temporário)
    console.log('⚠️ Usuário não é admin - concedendo acesso temporário');
    res.json({
      success: true,
      isOwner: false,
      hasAccess: true,
      permissions: {},
      visibleTables: [],
      userRole: req.user.role
    });

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ====================================================
// ROTAS SIMPLIFICADAS DE CONTROLE DE ACESSO
// ====================================================

// 📋 Buscar classificações do diagrama (FUNCIONANDO COM BD)
app.get('/api/diagrams/:diagramId/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    console.log('📋 Buscando classificações para diagrama:', diagramId);
    
    const connection = await connectDB();
    
    // Verificar se o usuário tem acesso ao diagrama
    let query, params;
    
    if (req.user.role === 'admin') {
      query = `SELECT d.id, d.user_id, 'admin' as access_level
               FROM diagrams d
               WHERE d.id = ? AND d.is_active = 1`;
      params = [diagramId];
    } else {
      query = `SELECT d.id, d.user_id, COALESCE(da.access_level, 'none') as access_level
               FROM diagrams d
               LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ? AND da.is_active = 1
               WHERE d.id = ? AND d.is_active = 1
               AND (d.user_id = ? OR da.is_active = 1)`;
      params = [req.user.email, diagramId, req.user.userId];
    }
    
    const [accessCheck] = await connection.execute(query, params);

    if (accessCheck.length === 0) {
      await connection.end();
      return res.status(403).json({ error: 'Acesso negado ao diagrama' });
    }

    // Buscar classificações do diagrama
    const [classifications] = await connection.execute(`
      SELECT 
        dc.*,
        u.name as created_by_name,
        COUNT(DISTINCT cp.id) as users_with_permission,
        COUNT(DISTINCT tc.id) as tables_with_classification
      FROM diagram_classifications dc
      LEFT JOIN users u ON dc.created_by = u.id
      LEFT JOIN classification_permissions cp ON dc.id = cp.classification_id AND cp.is_active = 1
      LEFT JOIN table_classifications tc ON dc.id = tc.classification_id AND tc.is_active = 1
      WHERE dc.diagram_id = ? AND dc.is_active = 1
      GROUP BY dc.id, dc.name, dc.description, dc.color, dc.display_order, dc.is_default, dc.is_active, dc.created_by, dc.created_at, dc.updated_at, u.name
      ORDER BY dc.display_order, dc.name
    `, [diagramId]);

    await connection.end();

    console.log(`✅ Encontradas ${classifications.length} classificações`);
    res.json({
      success: true,
      classifications,
      hasEditAccess: req.user.role === 'admin' || 
                     accessCheck[0].user_id === req.user.userId || 
                     ['edit', 'admin'].includes(accessCheck[0].access_level)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar classificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ➕ Criar nova classificação (FUNCIONANDO COM BD)
app.post('/api/diagrams/:diagramId/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const { name, description, color, isDefault } = req.body;
    
    console.log('➕ Criando classificação para diagrama:', diagramId);
    console.log('📝 Dados recebidos:', req.body);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da classificação é obrigatório' });
    }

    const connection = await connectDB();
    
    // Verificar permissão de edição no diagrama
    let query, params;
    if (req.user.role === 'admin') {
      query = `SELECT d.id, d.user_id, 'admin' as access_level
               FROM diagrams d WHERE d.id = ? AND d.is_active = 1`;
      params = [diagramId];
    } else {
      query = `SELECT d.id, d.user_id, COALESCE(da.access_level, 'none') as access_level
               FROM diagrams d
               LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ? AND da.is_active = 1
               WHERE d.id = ? AND d.is_active = 1
               AND (d.user_id = ? OR da.access_level IN ('edit', 'admin'))`;
      params = [req.user.email, diagramId, req.user.userId];
    }

    const [accessCheck] = await connection.execute(query, params);

    if (accessCheck.length === 0) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente para criar classificação' });
    }

    // Se esta será a classificação padrão, remover flag das outras
    if (isDefault) {
      await connection.execute(`
        UPDATE diagram_classifications 
        SET is_default = FALSE 
        WHERE diagram_id = ? AND is_active = 1
      `, [diagramId]);
    }

    // Inserir nova classificação
    const [result] = await connection.execute(`
      INSERT INTO diagram_classifications 
      (diagram_id, name, description, color, is_default, created_by, is_active)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `, [diagramId, name.trim(), description || '', color || '#3B82F6', isDefault || false, req.user.userId]);

    // Buscar a classificação criada
    const [newClassification] = await connection.execute(`
      SELECT dc.*, u.name as created_by_name
      FROM diagram_classifications dc
      LEFT JOIN users u ON dc.created_by = u.id
      WHERE dc.id = ?
    `, [result.insertId]);

    await connection.end();

    console.log('✅ Classificação criada com sucesso:', newClassification[0]);
    res.status(201).json({
      success: true,
      classification: newClassification[0],
      message: 'Classificação criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar classificação:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe uma classificação com este nome neste diagrama' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// ✏️ Rota para editar classificação (FUNCIONANDO COM BD)
app.put('/api/classifications/:id', authenticateToken, async (req, res) => {
  try {
    const classificationId = parseInt(req.params.id);
    console.log('✏️ Editando classificação ID:', classificationId);
    
    const { name, description, color, isDefault } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da classificação é obrigatório' });
    }

    const connection = await connectDB();

    // Verificar se a classificação existe e se o usuário tem permissão
    const [classification] = await connection.execute(`
      SELECT dc.*, d.user_id as diagram_owner
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      WHERE dc.id = ? AND dc.is_active = 1
    `, [classificationId]);
    
    if (classification.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Classificação não encontrada' });
    }

    const classData = classification[0];

    // Verificar permissão (admin ou dono do diagrama)
    if (req.user.role !== 'admin' && req.user.userId !== classData.diagram_owner) {
      // Verificar se tem acesso de edição ao diagrama
      const [access] = await connection.execute(`
        SELECT access_level FROM diagram_access 
        WHERE diagram_id = ? AND user_email = ? AND is_active = 1
      `, [classData.diagram_id, req.user.email]);
      
      if (access.length === 0 || !['edit', 'admin'].includes(access[0].access_level)) {
        await connection.end();
        return res.status(403).json({ error: 'Permissão insuficiente para editar classificação' });
      }
    }

    // Se será a classificação padrão, remover flag das outras
    if (isDefault && !classData.is_default) {
      await connection.execute(`
        UPDATE diagram_classifications 
        SET is_default = FALSE 
        WHERE diagram_id = ? AND id != ? AND is_active = 1
      `, [classData.diagram_id, classificationId]);
    }

    // Atualizar a classificação
    await connection.execute(`
      UPDATE diagram_classifications 
      SET name = ?, description = ?, color = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name.trim(), description || '', color || classData.color, isDefault || false, classificationId]);

    // Buscar a classificação atualizada
    const [updated] = await connection.execute(`
      SELECT dc.*, u.name as created_by_name
      FROM diagram_classifications dc
      LEFT JOIN users u ON dc.created_by = u.id
      WHERE dc.id = ?
    `, [classificationId]);

    await connection.end();

    console.log('✅ Classificação atualizada:', updated[0]);
    res.json({
      success: true,
      classification: updated[0],
      message: 'Classificação atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao editar classificação:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe uma classificação com este nome neste diagrama' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// 🗑️ Rota para deletar classificação (FUNCIONANDO COM BD)
app.delete('/api/classifications/:id', authenticateToken, async (req, res) => {
  try {
    const classificationId = parseInt(req.params.id);
    console.log('🗑️ Deletando classificação ID:', classificationId);
    
    const connection = await connectDB();

    // Verificar se a classificação existe e se o usuário tem permissão
    const [classification] = await connection.execute(`
      SELECT dc.*, d.user_id as diagram_owner
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      WHERE dc.id = ? AND dc.is_active = 1
    `, [classificationId]);
    
    if (classification.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Classificação não encontrada' });
    }

    const classData = classification[0];

    // Verificar se não é a classificação padrão
    if (classData.is_default) {
      await connection.end();
      return res.status(400).json({ error: 'Não é possível deletar a classificação padrão' });
    }

    // Verificar permissão (admin ou dono do diagrama)
    if (req.user.role !== 'admin' && req.user.userId !== classData.diagram_owner) {
      const [access] = await connection.execute(`
        SELECT access_level FROM diagram_access 
        WHERE diagram_id = ? AND user_email = ? AND is_active = 1
      `, [classData.diagram_id, req.user.email]);
      
      if (access.length === 0 || !['edit', 'admin'].includes(access[0].access_level)) {
        await connection.end();
        return res.status(403).json({ error: 'Permissão insuficiente para deletar classificação' });
      }
    }

    // Buscar a classificação padrão do diagrama para mover as tabelas
    const [defaultClass] = await connection.execute(`
      SELECT id FROM diagram_classifications 
      WHERE diagram_id = ? AND is_default = TRUE AND is_active = 1
    `, [classData.diagram_id]);

    if (defaultClass.length > 0) {
      // Mover todas as tabelas desta classificação para a padrão
      await connection.execute(`
        UPDATE table_classifications 
        SET classification_id = ?, assigned_at = CURRENT_TIMESTAMP
        WHERE classification_id = ? AND is_active = 1
      `, [defaultClass[0].id, classificationId]);
    }

    // Marcar classificação como inativa (soft delete)
    await connection.execute(`
      UPDATE diagram_classifications 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [classificationId]);

    // Desativar todas as permissões desta classificação
    await connection.execute(`
      UPDATE classification_permissions 
      SET is_active = FALSE
      WHERE classification_id = ?
    `, [classificationId]);

    await connection.end();

    console.log('✅ Classificação deletada:', classData.name);
    res.json({ 
      success: true,
      message: 'Classificação deletada com sucesso',
      deletedClassification: classData
    });

  } catch (error) {
    console.error('❌ Erro ao deletar classificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔑 Rota para permissões de classificação (FUNCIONANDO COM BD)
app.get('/api/classifications/:id/permissions', authenticateToken, async (req, res) => {
  try {
    const classificationId = parseInt(req.params.id);
    console.log('🔑 Buscando permissões da classificação:', classificationId);
    
    const connection = await connectDB();
    
    // Verificar se a classificação existe e se o usuário tem acesso
    const [classification] = await connection.execute(`
      SELECT dc.*, d.user_id as diagram_owner
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      WHERE dc.id = ? AND dc.is_active = 1
    `, [classificationId]);
    
    if (classification.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Classificação não encontrada' });
    }

    // Buscar permissões da classificação
    const [permissions] = await connection.execute(`
      SELECT cp.*, u.name as user_name
      FROM classification_permissions cp
      LEFT JOIN users u ON cp.user_email = u.email
      WHERE cp.classification_id = ? AND cp.is_active = 1
      ORDER BY cp.granted_at DESC
    `, [classificationId]);

    await connection.end();
    
    res.json({
      success: true,
      classificationId: classificationId,
      permissions: permissions
    });

  } catch (error) {
    console.error('❌ Erro ao buscar permissões da classificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔐 Rota para acesso de diagrama (FUNCIONANDO COM BD)  
app.get('/api/diagrams/:diagramId/access', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    console.log('🔐 Buscando controle de acesso para diagrama:', diagramId);
    
    const connection = await connectDB();
    
    // Verificar se o diagrama existe
    const [diagram] = await connection.execute(`
      SELECT d.*, u.name as owner_name
      FROM diagrams d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? AND d.is_active = 1
    `, [diagramId]);
    
    if (diagram.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Diagrama não encontrado' });
    }

    // Verificar se é o dono ou admin
    const isOwner = req.user.userId === diagram[0].user_id;
    const isAdmin = req.user.role === 'admin';

    if (isAdmin || isOwner) {
      // Buscar lista de acessos concedidos
      const [accessList] = await connection.execute(`
        SELECT da.*, u.name as user_name
        FROM diagram_access da
        LEFT JOIN users u ON da.user_email = u.email
        WHERE da.diagram_id = ? AND da.is_active = 1
        ORDER BY da.granted_at DESC
      `, [diagramId]);

      await connection.end();
      
      res.json({
        success: true,
        diagramId: diagramId,
        userEmail: req.user.email,
        accessLevel: isAdmin ? 'admin' : 'owner',
        permissions: ['view', 'edit', 'admin'],
        isOwner: isOwner,
        accessList: accessList
      });
    } else {
      // Verificar se tem acesso concedido
      const [userAccess] = await connection.execute(`
        SELECT access_level FROM diagram_access 
        WHERE diagram_id = ? AND user_email = ? AND is_active = 1
      `, [diagramId, req.user.email]);

      await connection.end();
      
      if (userAccess.length > 0) {
        res.json({
          success: true,
          diagramId: diagramId,
          userEmail: req.user.email,
          accessLevel: userAccess[0].access_level,
          permissions: [userAccess[0].access_level],
          isOwner: false,
          accessList: [] // Usuários não-owners não veem a lista completa
        });
      } else {
        res.status(403).json({ error: 'Acesso negado ao diagrama' });
      }
    }

  } catch (error) {
    console.error('❌ Erro ao buscar acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🏷️ Rota para atualizar classificação de uma tabela
app.put('/api/tables/:tableId/classification', authenticateToken, async (req, res) => {
  try {
    const { tableId } = req.params;
    const { classificationId, diagramId } = req.body;
    
    console.log('🏷️ Atualizando classificação da tabela:', { tableId, classificationId, diagramId });

    if (!diagramId || !classificationId) {
      return res.status(400).json({ error: 'diagramId e classificationId são obrigatórios' });
    }

    const connection = await connectDB();
    
    // Verificar permissão no diagrama
    let hasPermission = false;
    if (req.user.role === 'admin') {
      hasPermission = true;
    } else {
      const [access] = await connection.execute(`
        SELECT d.user_id, da.access_level
        FROM diagrams d
        LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ? AND da.is_active = 1
        WHERE d.id = ? AND d.is_active = 1
      `, [req.user.email, diagramId]);
      
      if (access.length > 0) {
        hasPermission = (access[0].user_id === req.user.userId || 
                        ['edit', 'admin'].includes(access[0].access_level));
      }
    }

    if (!hasPermission) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente para alterar classificação' });
    }

    // Verificar se a classificação existe no diagrama
    const [classification] = await connection.execute(`
      SELECT id FROM diagram_classifications 
      WHERE id = ? AND diagram_id = ? AND is_active = 1
    `, [classificationId, diagramId]);
    
    if (classification.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Classificação não encontrada no diagrama' });
    }

    // Verificar se já existe uma classificação para esta tabela
    const [existing] = await connection.execute(`
      SELECT id FROM table_classifications 
      WHERE diagram_id = ? AND table_node_id = ? AND is_active = 1
    `, [diagramId, tableId]);

    if (existing.length > 0) {
      // Atualizar classificação existente
      await connection.execute(`
        UPDATE table_classifications 
        SET classification_id = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [classificationId, req.user.userId, existing[0].id]);
    } else {
      // Criar nova classificação para a tabela
      await connection.execute(`
        INSERT INTO table_classifications 
        (diagram_id, table_node_id, classification_id, assigned_by)
        VALUES (?, ?, ?, ?)
      `, [diagramId, tableId, classificationId, req.user.userId]);
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Classificação da tabela atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar classificação da tabela:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ======================================
// 🎯 ROTAS DE PERMISSIONAMENTO AVANÇADO
// ======================================

// 🔍 Obter role do usuário em um diagrama específico
app.get('/api/diagrams/:diagramId/user-role', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const connection = await connectDB();

    // Verificar se é admin global
    if (req.user.role === 'admin') {
      await connection.end();
      return res.json({ role: 'admin' });
    }

    // Verificar acesso específico ao diagrama
    const [access] = await connection.execute(`
      SELECT access_level 
      FROM diagram_access 
      WHERE diagram_id = ? AND user_email = ? AND is_active = 1
    `, [diagramId, req.user.email]);

    await connection.end();

    if (access.length > 0) {
      res.json({ role: access[0].access_level });
    } else {
      res.json({ role: null });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar role do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔍 Obter todas as permissões do usuário (todos os diagramas)
app.get('/api/user/diagram-permissions', authenticateToken, async (req, res) => {
  try {
    const connection = await connectDB();
    const permissions = {};

    // Se for admin global, tem acesso a tudo
    if (req.user.role === 'admin') {
      // Buscar todos os diagramas para o admin
      const [diagrams] = await connection.execute(`
        SELECT id FROM diagrams WHERE is_active = 1
      `);

      diagrams.forEach(diagram => {
        permissions[diagram.id] = {
          role: 'admin',
          allowedClassifications: [] // Admin vê tudo
        };
      });
    } else {
      // Buscar permissões específicas do usuário
      const [userAccess] = await connection.execute(`
        SELECT 
          da.diagram_id,
          da.access_level as role,
          GROUP_CONCAT(cp.classification_id) as allowed_classifications
        FROM diagram_access da
        LEFT JOIN classification_permissions cp ON cp.user_email = da.user_email 
          AND cp.diagram_id = da.diagram_id AND cp.is_active = 1
        WHERE da.user_email = ? AND da.is_active = 1
        GROUP BY da.diagram_id, da.access_level
      `, [req.user.email]);

      userAccess.forEach(access => {
        permissions[access.diagram_id] = {
          role: access.role,
          allowedClassifications: access.allowed_classifications ? 
            access.allowed_classifications.split(',').map(id => parseInt(id)) : []
        };
      });
    }

    await connection.end();
    res.json({ permissions });

  } catch (error) {
    console.error('❌ Erro ao buscar permissões do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🎯 Adicionar usuário a um diagrama com role específica
app.post('/api/diagrams/:diagramId/users', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const { userEmail, role } = req.body;

    // Apenas admin global pode gerenciar acessos
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerenciar acessos' });
    }

    if (!userEmail || !role) {
      return res.status(400).json({ error: 'Email do usuário e role são obrigatórios' });
    }

    if (!['editor', 'leitor'].includes(role)) {
      return res.status(400).json({ error: 'Role deve ser: editor ou leitor' });
    }

    const connection = await connectDB();

    // Verificar se o diagrama existe
    const [diagram] = await connection.execute(`
      SELECT id FROM diagrams WHERE id = ? AND is_active = 1
    `, [diagramId]);

    if (diagram.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Diagrama não encontrado' });
    }

    // Verificar se já existe acesso para este usuário
    const [existing] = await connection.execute(`
      SELECT id FROM diagram_access 
      WHERE diagram_id = ? AND user_email = ? AND is_active = 1
    `, [diagramId, userEmail]);

    if (existing.length > 0) {
      // Atualizar role existente
      await connection.execute(`
        UPDATE diagram_access 
        SET access_level = ?, granted_by = ?, granted_at = CURRENT_TIMESTAMP
        WHERE diagram_id = ? AND user_email = ?
      `, [role, req.user.userId, diagramId, userEmail]);
    } else {
      // Criar novo acesso
      await connection.execute(`
        INSERT INTO diagram_access (diagram_id, user_email, access_level, granted_by)
        VALUES (?, ?, ?, ?)
      `, [diagramId, userEmail, role, req.user.userId]);
    }

    await connection.end();

    res.json({
      success: true,
      message: `Acesso ${role} concedido ao usuário ${userEmail}`
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário ao diagrama:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🗑️ Remover usuário de um diagrama
app.delete('/api/diagrams/:diagramId/users/:userEmail', authenticateToken, async (req, res) => {
  try {
    const { diagramId, userEmail } = req.params;

    // Apenas admin global pode gerenciar acessos
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerenciar acessos' });
    }

    const connection = await connectDB();

    // Desativar acesso do usuário
    await connection.execute(`
      UPDATE diagram_access 
      SET is_active = 0, removed_by = ?, removed_at = CURRENT_TIMESTAMP
      WHERE diagram_id = ? AND user_email = ?
    `, [req.user.userId, diagramId, userEmail]);

    // Desativar permissões de classificação do usuário
    await connection.execute(`
      UPDATE classification_permissions 
      SET is_active = 0, removed_by = ?, removed_at = CURRENT_TIMESTAMP
      WHERE diagram_id = ? AND user_email = ?
    `, [req.user.userId, diagramId, userEmail]);

    await connection.end();

    res.json({
      success: true,
      message: `Acesso removido do usuário ${userEmail}`
    });

  } catch (error) {
    console.error('❌ Erro ao remover usuário do diagrama:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🏷️ Atribuir classificações a um usuário (para role "leitor")
app.post('/api/diagrams/:diagramId/users/:userEmail/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId, userEmail } = req.params;
    const { classificationIds } = req.body;

    // Apenas admin global pode gerenciar permissões
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerenciar permissões' });
    }

    if (!Array.isArray(classificationIds)) {
      return res.status(400).json({ error: 'classificationIds deve ser um array' });
    }

    const connection = await connectDB();

    // Verificar se o usuário tem acesso ao diagrama
    const [userAccess] = await connection.execute(`
      SELECT access_level FROM diagram_access 
      WHERE diagram_id = ? AND user_email = ? AND is_active = 1
    `, [diagramId, userEmail]);

    if (userAccess.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Usuário não tem acesso a este diagrama' });
    }

    // Remover permissões antigas
    await connection.execute(`
      UPDATE classification_permissions 
      SET is_active = 0, removed_by = ?, removed_at = CURRENT_TIMESTAMP
      WHERE diagram_id = ? AND user_email = ?
    `, [req.user.userId, diagramId, userEmail]);

    // Adicionar novas permissões
    for (const classificationId of classificationIds) {
      await connection.execute(`
        INSERT INTO classification_permissions 
        (diagram_id, user_email, classification_id, granted_by)
        VALUES (?, ?, ?, ?)
      `, [diagramId, userEmail, classificationId, req.user.userId]);
    }

    await connection.end();

    res.json({
      success: true,
      message: `Permissões de classificação atualizadas para ${userEmail}`
    });

  } catch (error) {
    console.error('❌ Erro ao atribuir classificações ao usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔍 Listar usuários de um diagrama com suas permissões
app.get('/api/diagrams/:diagramId/users', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;

    // Apenas admin global pode ver usuários
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem ver usuários' });
    }

    const connection = await connectDB();

    const [users] = await connection.execute(`
      SELECT 
        da.user_email,
        da.access_level as role,
        da.granted_at,
        GROUP_CONCAT(
          DISTINCT CONCAT(dc.id, ':', dc.name, ':', dc.color)
        ) as allowed_classifications
      FROM diagram_access da
      LEFT JOIN classification_permissions cp ON da.user_email = cp.user_email 
        AND da.diagram_id = cp.diagram_id AND cp.is_active = 1
      LEFT JOIN diagram_classifications dc ON cp.classification_id = dc.id AND dc.is_active = 1
      WHERE da.diagram_id = ? AND da.is_active = 1
      GROUP BY da.user_email, da.access_level, da.granted_at
      ORDER BY da.granted_at DESC
    `, [diagramId]);

    const formattedUsers = users.map(user => ({
      email: user.user_email,
      role: user.role,
      grantedAt: user.granted_at,
      allowedClassifications: user.allowed_classifications ? 
        user.allowed_classifications.split(',').map(item => {
          const [id, name, color] = item.split(':');
          return { id: parseInt(id), name, color };
        }) : []
    }));

    await connection.end();
    res.json({ users: formattedUsers });

  } catch (error) {
    console.error('❌ Erro ao listar usuários do diagrama:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Sistema de controle de acesso ativo`);
});

module.exports = app;
