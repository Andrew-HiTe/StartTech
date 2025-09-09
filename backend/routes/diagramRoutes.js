const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Função para garantir que a tabela diagrams existe
const ensureDiagramsTable = async () => {
  try {
    const createDiagramsTableQuery = `
      CREATE TABLE IF NOT EXISTS diagrams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        table_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createDiagramsTableQuery);
    console.log('✅ Tabela diagrams verificada/criada');
    
    // Verificar se existe pelo menos um diagrama, se não criar um padrão
    await ensureInitialDiagram();
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela diagrams:', error);
  }
};

// Função para garantir que existe pelo menos um diagrama inicial
const ensureInitialDiagram = async () => {
  try {
    // Verificar se existem diagramas
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM diagrams');
    const count = rows[0].count;
    
    if (count === 0) {
      console.log('🆕 Banco vazio - Criando diagrama inicial...');
      
      // Criar um diagrama inicial
      const initialDiagramId = `diagram_${Date.now()}_inicial`;
      const initialTableName = `diagram_${Date.now()}_inicial`;
      
      // Inserir diagrama inicial na tabela diagrams
      await db.execute(`
        INSERT INTO diagrams (id, name, table_name, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
      `, [initialDiagramId, 'Meu Primeiro Diagrama', initialTableName]);
      
      // Criar tabela para o diagrama inicial
      await db.execute(`
        CREATE TABLE IF NOT EXISTS ${initialTableName} (
          id VARCHAR(255) PRIMARY KEY,
          node_name VARCHAR(255) NOT NULL,
          node_type VARCHAR(100) DEFAULT 'table',
          node_description TEXT,
          fields JSON,
          position_x DECIMAL(10,2),
          position_y DECIMAL(10,2),
          style_width INT,
          style_height INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`✅ Diagrama inicial criado: ${initialDiagramId}`);
    } else {
      console.log(`📊 Encontrados ${count} diagramas existentes`);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar/criar diagrama inicial:', error);
  }
};

// Garantir que a tabela existe quando o módulo é carregado
ensureDiagramsTable();

// Criar tabela para um diagrama
router.post('/create-table', async (req, res) => {
  const { diagramId, diagramName, timestamp } = req.body;

  try {
    // Garantir que a tabela diagrams existe
    await ensureDiagramsTable();
    
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
        fields JSON,
        position_x DECIMAL(10,2),
        position_y DECIMAL(10,2),
        style_width INT,
        style_height INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await db.execute(createTableQuery);

    // Registrar o diagrama na tabela principal de diagramas
    const insertDiagramQuery = `
      INSERT INTO diagrams (id, name, table_name, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        updated_at = NOW()
    `;

    await db.execute(insertDiagramQuery, [
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
    
    // Se a tabela diagrams não existir, tentar recriá-la
    if (error.code === 'ER_NO_SUCH_TABLE') {
      try {
        await ensureDiagramsTable();
        // Tentar novamente após recriar a tabela - usar o mesmo tableName já definido
        
        await db.execute(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id VARCHAR(255) PRIMARY KEY,
            node_name VARCHAR(255) NOT NULL,
            node_type VARCHAR(100) DEFAULT 'table',
            node_description TEXT,
            fields JSON,
            position_x DECIMAL(10,2),
            position_y DECIMAL(10,2),
            style_width INT,
            style_height INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        await db.execute(`
          INSERT INTO diagrams (id, name, table_name, created_at, updated_at) 
          VALUES (?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            updated_at = NOW()
        `, [diagramId, diagramName, tableName]);
        
        console.log(`✅ Tabela ${tableName} criada após recriar diagrams`);
        
        res.json({
          success: true,
          message: `Tabela criada para diagrama ${diagramName}`,
          tableName,
          diagramId
        });
        return;
      } catch (recreateError) {
        console.error('❌ Erro ao recriar tabela diagrams:', recreateError);
      }
    }
    
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
    fields,
    position, 
    style, 
    timestamp 
  } = req.body;

  try {
    console.log(`🔧 Adicionando item ao diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`� Usando tabela: ${tableName} para item: ${nodeName}`);
    
    const upsertQuery = `
      INSERT INTO ${tableName} (
        id, node_name, node_type, node_description, fields,
        position_x, position_y, style_width, style_height, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        node_name = VALUES(node_name),
        node_type = VALUES(node_type),
        node_description = VALUES(node_description),
        fields = VALUES(fields),
        position_x = VALUES(position_x),
        position_y = VALUES(position_y),
        style_width = VALUES(style_width),
        style_height = VALUES(style_height),
        updated_at = NOW()
    `;

    await db.execute(upsertQuery, [
      nodeId,
      nodeName,
      nodeType,
      nodeDescription,
      JSON.stringify(fields || []),
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
    console.log(`🔧 Atualizando item no diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`� Atualizando na tabela: ${tableName} item: ${nodeId}`);
    
    const updateQuery = `
      UPDATE ${tableName} 
      SET node_name = ?, node_description = ?, 
          position_x = ?, position_y = ?, 
          style_width = ?, style_height = ?, 
          updated_at = NOW()
      WHERE id = ?
    `;

    const result = await db.execute(updateQuery, [
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
    console.log(`🔧 Removendo item do diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`� Removendo da tabela: ${tableName} item: ${nodeId}`);
    
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
    const result = await db.execute(deleteQuery, [nodeId]);

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
    console.log(`🔧 Carregando itens do diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`� Carregando da tabela: ${tableName}`);
    
    const selectQuery = `SELECT * FROM ${tableName} ORDER BY created_at DESC`;
    const [rows] = await db.execute(selectQuery);

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
    console.log(`🔧 Removendo diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`� Removendo tabela: ${tableName}`);
    
    // Remover tabela do diagrama
    const dropTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
    await db.execute(dropTableQuery);

    // Remover registro da tabela principal
    const deleteDiagramQuery = `DELETE FROM diagrams WHERE id = ?`;
    await db.execute(deleteDiagramQuery, [diagramId]);

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

// Função para verificar e limpar inconsistências entre tabelas
async function cleanupInconsistentDiagrams() {
  console.log('🧹 Verificando consistência entre tabela diagrams e tabelas de dados...');
  
  try {
    await ensureDiagramsTable();
    
    // Buscar todos os diagramas registrados
    const [diagrams] = await db.execute('SELECT * FROM diagrams');
    
    let removedCount = 0;
    for (const diagram of diagrams) {
      try {
        // Tentar verificar se a tabela do diagrama existe
        await db.execute(`SELECT 1 FROM ${diagram.table_name} LIMIT 1`);
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`🗑️ Removendo diagrama inconsistente: ${diagram.table_name}`);
          
          // Remover da tabela de controle
          await db.execute('DELETE FROM diagrams WHERE table_name = ?', [diagram.table_name]);
          removedCount++;
        }
      }
    }
    
    if (removedCount > 0) {
      console.log(`✅ Limpeza concluída: ${removedCount} diagramas inconsistentes removidos`);
    } else {
      console.log('✅ Nenhuma inconsistência encontrada');
    }
    
    return removedCount;
    
  } catch (error) {
    console.error('❌ Erro na limpeza de inconsistências:', error);
    return 0;
  }
}

// Listar todos os diagramas
// Carregar diagrama completo com nodes
router.get('/:diagramId/full', async (req, res) => {
  const { diagramId } = req.params;

  try {
    console.log(`🔧 Carregando diagrama completo para ID: ${diagramId}`);
    
    // Buscar info do diagrama na tabela de controle
    const diagramQuery = `SELECT * FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const diagram = diagramRows[0];
    // Usar o table_name armazenado na tabela diagrams, não reconstruir
    const tableName = diagram.table_name;
    
    console.log(`📊 Usando tabela: ${tableName} para diagrama: ${diagram.name}`);
    
    // Buscar todos os nodes/itens do diagrama - com tratamento de erro para tabela inexistente
    let items = [];
    try {
      const itemsQuery = `SELECT * FROM ${tableName} ORDER BY created_at ASC`;
      const [queryResult] = await db.execute(itemsQuery);
      items = queryResult;
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log(`🗑️ Tabela inexistente detectada: ${tableName}. Removendo da lista de diagramas...`);
        
        // Remover o diagrama inconsistente da tabela de controle
        await db.execute('DELETE FROM diagrams WHERE table_name = ?', [tableName]);
        
        return res.status(404).json({
          success: false,
          message: 'Diagrama removido devido à inconsistência. Tente novamente.',
          cleanupPerformed: true
        });
      }
      throw error; // Re-lançar outros erros
    }
    
    // Converter items do banco para formato de nodes
    const nodes = items.map((item, index) => ({
      id: item.id,
      type: 'c4Node',
      position: { 
        x: parseFloat(item.position_x) || 100 + (index * 250), 
        y: parseFloat(item.position_y) || 100 + (Math.floor(index / 3) * 200) 
      },
      data: {
        tableName: item.node_name,
        description: item.node_description || '',
        fields: (() => {
          try {
            return item.fields ? JSON.parse(item.fields) : [];
          } catch (e) {
            console.log('Erro ao fazer parse dos fields:', item.fields);
            return [];
          }
        })()
      },
      style: {
        width: parseInt(item.style_width) || 200,
        height: parseInt(item.style_height) || 150
      }
    }));

    res.json({
      success: true,
      diagram: {
        id: diagram.id,
        name: diagram.name,
        tableName: diagram.table_name,
        createdAt: diagram.created_at,
        updatedAt: diagram.updated_at,
        nodes,
        edges: [] // Por enquanto, sem edges salvos no banco
      }
    });

  } catch (error) {
    console.error('❌ Erro ao carregar diagrama completo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar diagrama completo',
      error: error.message
    });
  }
});

// Listar todos os diagramas
router.get('/list', async (req, res) => {
  try {
    // Garantir que a tabela diagrams existe antes de tentar acessá-la
    await ensureDiagramsTable();
    
    // Executar limpeza de inconsistências antes de listar
    await cleanupInconsistentDiagrams();
    
    const query = `
      SELECT id, name, table_name, created_at, updated_at 
      FROM diagrams 
      ORDER BY updated_at DESC
    `;
    
    const [rows] = await db.execute(query);
    
    console.log(`📋 Listando ${rows.length} diagramas`);
    
    res.json({
      success: true,
      diagrams: rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar diagramas:', error);
    
    // Se a tabela não existir, tentar recriá-la e retornar lista vazia
    if (error.code === 'ER_NO_SUCH_TABLE') {
      try {
        await ensureDiagramsTable();
        // Tentar novamente após recriar a tabela
        const [rows] = await db.execute(`
          SELECT id, name, table_name, created_at, updated_at 
          FROM diagrams 
          ORDER BY updated_at DESC
        `);
        
        console.log(`📋 Listando ${rows.length} diagramas após recriar tabela`);
        
        res.json({
          success: true,
          diagrams: rows
        });
        return;
      } catch (recreateError) {
        console.error('❌ Erro ao recriar tabela diagrams:', recreateError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao listar diagramas',
      error: error.message
    });
  }
});

// Rota de teste para simular exclusão direta no banco (apenas para testes)
router.get('/test-delete-direct/:diagramId', async (req, res) => {
  const { diagramId } = req.params;
  
  try {
    console.log(`🧪 Teste: Deletando diagrama diretamente do banco: ${diagramId}`);
    
    // Buscar informações do diagrama
    const [diagramRows] = await db.execute('SELECT table_name FROM diagrams WHERE id = ?', [diagramId]);
    
    if (diagramRows.length > 0) {
      const tableName = diagramRows[0].table_name;
      
      // Deletar tabela do diagrama
      await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`🗑️ Tabela ${tableName} deletada`);
      
      // Remover registro da tabela diagrams
      await db.execute('DELETE FROM diagrams WHERE id = ?', [diagramId]);
      console.log(`🗑️ Registro ${diagramId} removido da tabela diagrams`);
      
      res.json({
        success: true,
        message: `Diagrama ${diagramId} deletado diretamente do banco`,
        deletedTable: tableName
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao deletar diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar diagrama',
      error: error.message
    });
  }
});

// Listar tabelas/itens de um diagrama específico
router.get('/:diagramId/tables', async (req, res) => {
  const { diagramId } = req.params;

  try {
    console.log(`📋 Listando tabelas do diagrama: ${diagramId}`);
    
    // Buscar o table_name correto da tabela diagrams
    const diagramQuery = `SELECT table_name FROM diagrams WHERE id = ?`;
    const [diagramRows] = await db.execute(diagramQuery, [diagramId]);
    
    if (diagramRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Diagrama não encontrado'
      });
    }
    
    const tableName = diagramRows[0].table_name;
    console.log(`📊 Listando da tabela: ${tableName}`);
    
    const query = `
      SELECT * FROM ${tableName} 
      ORDER BY created_at ASC
    `;
    
    const [rows] = await db.execute(query);
    
    const tables = rows.map(item => ({
      id: item.id,
      name: item.node_name,
      type: item.node_type,
      description: item.node_description,
      fields: (() => {
        try {
          return item.fields ? JSON.parse(item.fields) : [];
        } catch (e) {
          return [];
        }
      })(),
      position: {
        x: parseFloat(item.position_x) || 100,
        y: parseFloat(item.position_y) || 100
      },
      style: {
        width: parseInt(item.style_width) || 200,
        height: parseInt(item.style_height) || 150
      },
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    
    console.log(`✅ Encontradas ${tables.length} tabelas no diagrama ${diagramId}`);
    
    res.json({
      success: true,
      diagramId,
      tableName,
      tables,
      count: tables.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar tabelas do diagrama:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tabelas do diagrama',
      error: error.message
    });
  }
});

// Limpar diagramas duplicados e manter apenas os mais recentes
router.delete('/cleanup-duplicates', async (req, res) => {
  try {
    console.log('🧹 Iniciando limpeza de diagramas duplicados...');
    
    // Garantir que a tabela diagrams existe antes de tentar acessá-la
    await ensureDiagramsTable();
    
    // Buscar todos os diagramas
    const [diagrams] = await db.execute(`
      SELECT id, name, table_name, created_at 
      FROM diagrams 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Encontrados ${diagrams.length} diagramas`);
    
    // Agrupar por nome e manter apenas o mais recente
    const uniqueNames = new Set();
    const toDelete = [];
    
    for (const diagram of diagrams) {
      if (uniqueNames.has(diagram.name)) {
        // Este nome já existe, marcar para deletar
        toDelete.push(diagram);
      } else {
        // Primeiro diagrama com este nome, manter
        uniqueNames.add(diagram.name);
      }
    }
    
    console.log(`🗑️ Deletando ${toDelete.length} diagramas duplicados`);
    
    // Deletar diagramas duplicados
    for (const diagram of toDelete) {
      try {
        // Deletar tabela do diagrama
        await db.execute(`DROP TABLE IF EXISTS ${diagram.table_name}`);
        
        // Remover registro da tabela diagrams
        await db.execute(`DELETE FROM diagrams WHERE id = ?`, [diagram.id]);
        
        console.log(`✅ Deletado: ${diagram.name} (${diagram.id})`);
      } catch (error) {
        console.log(`❌ Erro ao deletar ${diagram.id}:`, error.message);
      }
    }
    
    // Contar restantes
    const [remaining] = await db.execute(`SELECT COUNT(*) as count FROM diagrams`);
    
    console.log(`✅ Limpeza concluída. Restam ${remaining[0].count} diagramas`);
    
    res.json({
      success: true,
      message: 'Limpeza de duplicatas concluída',
      deleted: toDelete.length,
      remaining: remaining[0].count
    });

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    
    // Se a tabela não existir, tentar recriá-la
    if (error.code === 'ER_NO_SUCH_TABLE') {
      try {
        await ensureDiagramsTable();
        res.json({
          success: true,
          message: 'Tabela diagrams recriada com diagrama inicial',
          deleted: 0,
          remaining: 1
        });
        return;
      } catch (recreateError) {
        console.error('❌ Erro ao recriar tabela diagrams:', recreateError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro na limpeza de duplicatas',
      error: error.message
    });
  }
});

module.exports = router;
