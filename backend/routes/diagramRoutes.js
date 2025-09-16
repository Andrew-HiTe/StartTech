const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Função para garantir que a tabela diagrams existe
const ensureDiagramsTable = async () => {
  try {
    const connection = await db;
    const createDiagramsTableQuery = `
      CREATE TABLE IF NOT EXISTS diagrams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        table_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createDiagramsTableQuery);
    console.log('✅ Tabela diagrams verificada/criada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela diagrams:', error);
  }
};

// Garantir que a tabela existe quando o módulo é carregado
setTimeout(ensureDiagramsTable, 1000);

// Criar tabela para um diagrama
router.post('/create-table', async (req, res) => {
  const { diagramId, diagramName, timestamp } = req.body;

  try {
    const connection = await db;
    // Nome da tabela baseado no ID do diagrama (sanitizado)
    // Remove o prefixo 'diagram_' se já existir para evitar duplicação
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Criando tabela: ${tableName} para diagrama: ${diagramId}`);
    
    // Criar tabela dinâmica para o diagrama
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id VARCHAR(255) PRIMARY KEY,
        node_name VARCHAR(255) NOT NULL,
        node_type VARCHAR(100) DEFAULT 'table',
        node_description TEXT,
        position_x DECIMAL(10,2),
        position_y DECIMAL(10,2),
        style_width INT,
        style_height INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);

    // Registrar o diagrama na tabela principal de diagramas
    const insertDiagramQuery = `
      INSERT INTO diagrams (id, name, table_name, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        updated_at = NOW()
    `;

    await connection.execute(insertDiagramQuery, [
      diagramId,
      diagramName,
      tableName
    ]);

    console.log(`✅ Tabela ${tableName} criada para diagrama ${diagramName}`);

    res.json({
      success: true,
      message: `Tabela criada para diagrama ${diagramName}`,
      tableName,
      diagramId
    });

  } catch (error) {
    console.error('❌ Erro ao criar tabela do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tabela do diagrama',
      error: error.message
    });
  }
});

// Adicionar item (tabela/nó) ao diagrama
router.post('/add-table-item', async (req, res) => {
  const { 
    diagramId, 
    nodeId, 
    nodeName, 
    nodeType, 
    nodeDescription, 
    position, 
    style, 
    timestamp 
  } = req.body;

  try {
    const connection = await db;
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Adicionando item à tabela: ${tableName} para diagrama: ${diagramId}`);
    
    const insertQuery = `
      INSERT INTO ${tableName} (
        id, node_name, node_type, node_description, 
        position_x, position_y, style_width, style_height, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await connection.execute(insertQuery, [
      nodeId,
      nodeName,
      nodeType,
      nodeDescription,
      position?.x || 0,
      position?.y || 0,
      style?.width || 200,
      style?.height || 150
    ]);

    console.log(`✅ Item ${nodeName} adicionado ao diagrama ${diagramId}`);

    res.json({
      success: true,
      message: `Item ${nodeName} adicionado ao diagrama`,
      nodeId,
      diagramId
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar item ao diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar item ao diagrama',
      error: error.message
    });
  }
});

// Atualizar item no diagrama
router.put('/update-table-item', async (req, res) => {
  const { 
    diagramId, 
    nodeId, 
    nodeName, 
    nodeDescription, 
    position, 
    style, 
    timestamp 
  } = req.body;

  try {
    const connection = await db;
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Atualizando item na tabela: ${tableName} para diagrama: ${diagramId}`);
    
    const updateQuery = `
      UPDATE ${tableName} 
      SET node_name = ?, node_description = ?, 
          position_x = ?, position_y = ?, 
          style_width = ?, style_height = ?, 
          updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await connection.execute(updateQuery, [
      nodeName,
      nodeDescription,
      position?.x || 0,
      position?.y || 0,
      style?.width || 200,
      style?.height || 150,
      nodeId
    ]);

    console.log(`✅ Item ${nodeId} atualizado no diagrama ${diagramId}`);

    res.json({
      success: true,
      message: `Item atualizado no diagrama`,
      nodeId,
      diagramId,
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar item do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item do diagrama',
      error: error.message
    });
  }
});

// Remover item do diagrama
router.delete('/remove-table-item', async (req, res) => {
  const { diagramId, nodeId, timestamp } = req.body;

  try {
    const connection = await db;
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Removendo item da tabela: ${tableName} para diagrama: ${diagramId}`);
    
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
    const [result] = await connection.execute(deleteQuery, [nodeId]);

    console.log(`✅ Item ${nodeId} removido do diagrama ${diagramId}`);

    res.json({
      success: true,
      message: `Item removido do diagrama`,
      nodeId,
      diagramId,
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Erro ao remover item do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover item do diagrama',
      error: error.message
    });
  }
});

// Obter todos os itens de um diagrama
router.get('/:diagramId/items', async (req, res) => {
  const { diagramId } = req.params;

  try {
    const connection = await db;
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Carregando itens da tabela: ${tableName} para diagrama: ${diagramId}`);
    
    const selectQuery = `SELECT * FROM ${tableName} ORDER BY created_at DESC`;
    const [rows] = await connection.execute(selectQuery);

    console.log(`✅ ${rows.length} itens carregados do diagrama ${diagramId}`);

    res.json(rows);

  } catch (error) {
    console.error('❌ Erro ao carregar itens do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar itens do diagrama',
      error: error.message
    });
  }
});

// Deletar tabela do diagrama
router.delete('/delete-table/:diagramId', async (req, res) => {
  const { diagramId } = req.params;

  try {
    const connection = await db;
    const cleanId = diagramId.replace(/^diagram_/, '');
    const tableName = `diagram_${cleanId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    console.log(`🔧 Removendo tabela: ${tableName} para diagrama: ${diagramId}`);
    
    // Remover tabela do diagrama
    const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
    await connection.execute(dropTableQuery);

    // Remover registro da tabela principal
    const deleteDiagramQuery = `DELETE FROM diagrams WHERE id = ?`;
    await connection.execute(deleteDiagramQuery, [diagramId]);

    console.log(`✅ Tabela ${tableName} e registros do diagrama ${diagramId} removidos`);

    res.json({
      success: true,
      message: `Tabela do diagrama removida`,
      tableName,
      diagramId
    });

  } catch (error) {
    console.error('❌ Erro ao remover tabela do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover tabela do diagrama',
      error: error.message
    });
  }
});

// Listar todos os diagramas
router.get('/list', async (req, res) => {
  try {
    const connection = await db;
    const query = `
      SELECT id, name, table_name, created_at, updated_at 
      FROM diagrams 
      ORDER BY updated_at DESC
    `;
    
    const [results] = await connection.execute(query);
    
    res.json({
      success: true,
      diagrams: results
    });

  } catch (error) {
    console.error('❌ Erro ao listar diagramas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar diagramas',
      error: error.message
    });
  }
});

module.exports = router;
