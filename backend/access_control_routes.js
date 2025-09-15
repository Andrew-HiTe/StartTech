/**
 * API Routes para Sistema de Controle de Acesso
 * Gerenciamento de classificações e permissões granulares
 */

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
  // Configuração do banco (deve ser a mesma do server.js)
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'starttech_db',
    port: process.env.DB_PORT || 3306
  };

  // Função para conectar ao banco
  async function connectDB() {
    return await mysql.createConnection(dbConfig);
  }

  // Middleware de autenticação (deve ser o mesmo do server.js)
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

// ====================================================
// CLASSIFICAÇÕES POR DIAGRAMA
// ====================================================

// 📋 Listar classificações de um diagrama
app.get('/api/diagrams/:diagramId/classifications', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const connection = await connectDB();
    
    // Verificar se o usuário tem acesso ao diagrama
    const [accessCheck] = await connection.execute(`
      SELECT d.id, d.user_id, da.access_level
      FROM diagrams d
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE d.id = ? AND d.is_active = 1
      AND (d.user_id = ? OR da.is_active = 1)
    `, [req.user.email, diagramId, req.user.userId]);

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
      hasEditAccess: accessCheck[0].user_id === req.user.userId || 
                     ['edit', 'admin'].includes(accessCheck[0].access_level)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar classificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ➕ Criar nova classificação
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

// ✏️ Atualizar classificação
app.put('/api/classifications/:classificationId', authenticateToken, async (req, res) => {
  try {
    const { classificationId } = req.params;
    const { name, description, color, isDefault } = req.body;

    const connection = await connectDB();
    
    // Verificar permissão
    const [accessCheck] = await connection.execute(`
      SELECT dc.diagram_id, d.user_id, da.access_level
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE dc.id = ? AND dc.is_active = 1
    `, [req.user.email, classificationId]);

    if (accessCheck.length === 0 || 
        (accessCheck[0].user_id !== req.user.userId && 
         !['edit', 'admin'].includes(accessCheck[0].access_level))) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    // Se esta será a classificação padrão, remover flag das outras
    if (isDefault) {
      await connection.execute(`
        UPDATE diagram_classifications 
        SET is_default = FALSE 
        WHERE diagram_id = ? AND id != ?
      `, [accessCheck[0].diagram_id, classificationId]);
    }

    // Atualizar classificação
    const [result] = await connection.execute(`
      UPDATE diagram_classifications 
      SET name = ?, description = ?, color = ?, is_default = ?
      WHERE id = ?
    `, [name.trim(), description || '', color || '#3B82F6', isDefault || false, classificationId]);

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classificação não encontrada' });
    }

    res.json({
      success: true,
      message: 'Classificação atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar classificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🗑️ Excluir classificação
app.delete('/api/classifications/:classificationId', authenticateToken, async (req, res) => {
  try {
    const { classificationId } = req.params;
    const connection = await connectDB();
    
    // Verificar permissão e se não é classificação padrão
    const [classificationCheck] = await connection.execute(`
      SELECT dc.diagram_id, dc.is_default, d.user_id, da.access_level
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE dc.id = ? AND dc.is_active = 1
    `, [req.user.email, classificationId]);

    if (classificationCheck.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Classificação não encontrada' });
    }

    if (classificationCheck[0].user_id !== req.user.userId && 
        !['edit', 'admin'].includes(classificationCheck[0].access_level)) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    if (classificationCheck[0].is_default) {
      await connection.end();
      return res.status(400).json({ error: 'Não é possível excluir a classificação padrão' });
    }

    // Remover classificação (soft delete)
    await connection.execute(`
      UPDATE diagram_classifications 
      SET is_active = FALSE 
      WHERE id = ?
    `, [classificationId]);

    // Mover tabelas desta classificação para a padrão
    const [defaultClassification] = await connection.execute(`
      SELECT id FROM diagram_classifications 
      WHERE diagram_id = ? AND is_default = TRUE AND is_active = TRUE
    `, [classificationCheck[0].diagram_id]);

    if (defaultClassification.length > 0) {
      await connection.execute(`
        UPDATE table_classifications 
        SET classification_id = ? 
        WHERE classification_id = ? AND is_active = TRUE
      `, [defaultClassification[0].id, classificationId]);
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Classificação excluída com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao excluir classificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ====================================================
// PERMISSÕES POR CLASSIFICAÇÃO
// ====================================================

// 📋 Listar permissões de uma classificação
app.get('/api/classifications/:classificationId/permissions', authenticateToken, async (req, res) => {
  try {
    const { classificationId } = req.params;
    const connection = await connectDB();
    
    // Verificar acesso
    const [accessCheck] = await connection.execute(`
      SELECT dc.diagram_id, d.user_id, da.access_level
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE dc.id = ? AND dc.is_active = 1
    `, [req.user.email, classificationId]);

    if (accessCheck.length === 0) {
      await connection.end();
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar permissões
    const [permissions] = await connection.execute(`
      SELECT 
        cp.*,
        u.name as granted_by_name
      FROM classification_permissions cp
      LEFT JOIN users u ON cp.granted_by = u.id
      WHERE cp.classification_id = ? AND cp.is_active = 1
      ORDER BY cp.user_email
    `, [classificationId]);

    await connection.end();

    res.json({
      success: true,
      permissions,
      hasEditAccess: accessCheck[0].user_id === req.user.userId || 
                     ['edit', 'admin'].includes(accessCheck[0].access_level)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ➕ Adicionar permissão a classificação
app.post('/api/classifications/:classificationId/permissions', authenticateToken, async (req, res) => {
  try {
    const { classificationId } = req.params;
    const { userEmail, permissionType, expiresAt } = req.body;

    if (!userEmail || !userEmail.includes('@')) {
      return res.status(400).json({ error: 'E-mail válido é obrigatório' });
    }

    const connection = await connectDB();
    
    // Verificar permissão de edição
    const [accessCheck] = await connection.execute(`
      SELECT dc.diagram_id, d.user_id, da.access_level
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE dc.id = ? AND dc.is_active = 1
    `, [req.user.email, classificationId]);

    if (accessCheck.length === 0 || 
        (accessCheck[0].user_id !== req.user.userId && 
         !['edit', 'admin'].includes(accessCheck[0].access_level))) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    // Inserir ou atualizar permissão
    await connection.execute(`
      INSERT INTO classification_permissions 
      (classification_id, user_email, permission_type, granted_by, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        permission_type = VALUES(permission_type),
        granted_by = VALUES(granted_by),
        expires_at = VALUES(expires_at),
        is_active = TRUE
    `, [classificationId, userEmail.toLowerCase(), permissionType || 'view', req.user.userId, expiresAt || null]);

    await connection.end();

    res.json({
      success: true,
      message: 'Permissão configurada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao configurar permissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🗑️ Remover permissão de classificação
app.delete('/api/classifications/:classificationId/permissions/:userEmail', authenticateToken, async (req, res) => {
  try {
    const { classificationId, userEmail } = req.params;
    const connection = await connectDB();
    
    // Verificar permissão
    const [accessCheck] = await connection.execute(`
      SELECT dc.diagram_id, d.user_id, da.access_level
      FROM diagram_classifications dc
      JOIN diagrams d ON dc.diagram_id = d.id
      LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.user_email = ?
      WHERE dc.id = ? AND dc.is_active = 1
    `, [req.user.email, classificationId]);

    if (accessCheck.length === 0 || 
        (accessCheck[0].user_id !== req.user.userId && 
         !['edit', 'admin'].includes(accessCheck[0].access_level))) {
      await connection.end();
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    // Remover permissão
    await connection.execute(`
      UPDATE classification_permissions 
      SET is_active = FALSE 
      WHERE classification_id = ? AND user_email = ?
    `, [classificationId, decodeURIComponent(userEmail).toLowerCase()]);

    await connection.end();

    res.json({
      success: true,
      message: 'Permissão removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover permissão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ====================================================
// ACESSO A DIAGRAMAS
// ====================================================

// 📋 Listar usuários com acesso ao diagrama
app.get('/api/diagrams/:diagramId/access', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const connection = await connectDB();
    
    // Verificar se é dono ou admin
    const [ownerCheck] = await connection.execute(`
      SELECT d.user_id, u.email as owner_email
      FROM diagrams d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? AND d.is_active = 1
    `, [diagramId]);

    if (ownerCheck.length === 0 || ownerCheck[0].user_id !== req.user.userId) {
      await connection.end();
      return res.status(403).json({ error: 'Apenas o dono do diagrama pode ver esta informação' });
    }

    // Buscar usuários com acesso
    const [accessList] = await connection.execute(`
      SELECT 
        da.*,
        u.name as granted_by_name
      FROM diagram_access da
      LEFT JOIN users u ON da.granted_by = u.id
      WHERE da.diagram_id = ? AND da.is_active = 1
      ORDER BY da.user_email
    `, [diagramId]);

    await connection.end();

    res.json({
      success: true,
      owner: ownerCheck[0].owner_email,
      accessList
    });

  } catch (error) {
    console.error('❌ Erro ao buscar acessos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ➕ Conceder acesso ao diagrama
app.post('/api/diagrams/:diagramId/access', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const { userEmail, accessLevel, expiresAt } = req.body;

    if (!userEmail || !userEmail.includes('@')) {
      return res.status(400).json({ error: 'E-mail válido é obrigatório' });
    }

    const connection = await connectDB();
    
    // Verificar se é dono
    const [ownerCheck] = await connection.execute(`
      SELECT user_id FROM diagrams 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `, [diagramId, req.user.userId]);

    if (ownerCheck.length === 0) {
      await connection.end();
      return res.status(403).json({ error: 'Apenas o dono do diagrama pode conceder acesso' });
    }

    // Inserir ou atualizar acesso
    await connection.execute(`
      INSERT INTO diagram_access 
      (diagram_id, user_email, access_level, granted_by, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        access_level = VALUES(access_level),
        granted_by = VALUES(granted_by),
        expires_at = VALUES(expires_at),
        is_active = TRUE
    `, [diagramId, userEmail.toLowerCase(), accessLevel || 'view', req.user.userId, expiresAt || null]);

    await connection.end();

    res.json({
      success: true,
      message: 'Acesso concedido com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao conceder acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ====================================================
// VALIDAÇÃO DE PERMISSÕES (Para Frontend)
// ====================================================

// 🔍 Verificar permissões efetivas do usuário
app.get('/api/diagrams/:diagramId/my-permissions', authenticateToken, async (req, res) => {
  try {
    const { diagramId } = req.params;
    const connection = await connectDB();
    
    // Buscar permissões efetivas do usuário
    const [permissions] = await connection.execute(`
      SELECT * FROM user_effective_permissions
      WHERE diagram_id = ? AND user_email = ?
    `, [diagramId, req.user.email]);

    // Verificar se é dono
    const [ownerCheck] = await connection.execute(`
      SELECT user_id FROM diagrams 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `, [diagramId, req.user.userId]);

    const isOwner = ownerCheck.length > 0;

    await connection.end();

    res.json({
      success: true,
      isOwner,
      hasAccess: isOwner || permissions.length > 0,
      permissions: permissions.reduce((acc, perm) => {
        if (perm.classification_permission) {
          acc[perm.classification_id] = perm.classification_permission;
        }
        return acc;
      }, {}),
      visibleTables: permissions.filter(p => p.table_node_id).map(p => p.table_node_id)
    });

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ====================================================
// CLASSIFICAÇÃO DE TABELAS
// ====================================================

// ✏️ Definir classificação de uma tabela
app.put('/api/diagrams/:diagramId/tables/:tableNodeId/classification', authenticateToken, async (req, res) => {
  try {
    const { diagramId, tableNodeId } = req.params;
    const { classificationId } = req.body;

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
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    // Verificar se a classificação existe neste diagrama
    const [classificationCheck] = await connection.execute(`
      SELECT id FROM diagram_classifications 
      WHERE id = ? AND diagram_id = ? AND is_active = 1
    `, [classificationId, diagramId]);

    if (classificationCheck.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Classificação inválida para este diagrama' });
    }

    // Inserir ou atualizar classificação da tabela
    await connection.execute(`
      INSERT INTO table_classifications 
      (diagram_id, table_node_id, classification_id, assigned_by)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        classification_id = VALUES(classification_id),
        assigned_by = VALUES(assigned_by),
        assigned_at = CURRENT_TIMESTAMP,
        is_active = TRUE
    `, [diagramId, tableNodeId, classificationId, req.user.userId]);

    await connection.end();

    res.json({
      success: true,
      message: 'Classificação da tabela atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao classificar tabela:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

}; // Fechar a função module.exports