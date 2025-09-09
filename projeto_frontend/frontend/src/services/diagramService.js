// diagramService.js
const API_BASE_URL = 'http://localhost:5000/api';

class DiagramService {
  // Criar tabela para diagrama
  async createDiagramTable(diagramId, diagramName) {
    try {
      const response = await fetch(`${API_BASE_URL}/diagrams/create-table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diagramId, diagramName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Tabela criada para diagrama: ${diagramName}`, result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar tabela do diagrama:', error);
      throw error;
    }
  }

  // Adicionar item (tabela) ao diagrama
  async addTableToDiagram(diagramId, tableData) {
    try {
      const response = await fetch(`${API_BASE_URL}/diagrams/add-table-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diagramId, tableData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Item adicionado ao diagrama:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao adicionar item ao diagrama:', error);
      throw error;
    }
  }

  // Buscar itens do diagrama
  async getDiagramItems(diagramId) {
    try {
      const response = await fetch(`${API_BASE_URL}/diagrams/${diagramId}/items`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const items = await response.json();
      console.log(`📋 Itens carregados do diagrama ${diagramId}:`, items.length);
      return items;
    } catch (error) {
      console.error('❌ Erro ao buscar itens do diagrama:', error);
      throw error;
    }
  }

  // Converter item do banco para node do ReactFlow
  convertDbItemToNode(item) {
    return {
      id: `table-${item.id}`,
      type: 'c4Node',
      position: { 
        x: item.position_x || 200, 
        y: item.position_y || 200 
      },
      data: {
        label: item.table_name,
        description: item.description || '',
        type: item.table_type || 'Table',
        color: item.color || '#ffffff',
        fields: this.parseFields(item.fields),
        isEditing: false
      }
    };
  }

  // Helper para parsing de campos
  parseFields(fieldsStr) {
    if (!fieldsStr) return [];
    try {
      return JSON.parse(fieldsStr);
    } catch (error) {
      console.warn('Erro ao fazer parse dos campos:', error);
      return [];
    }
  }

  // Converter node do ReactFlow para item do banco
  convertNodeToDbItem(node, diagramId) {
    return {
      diagram_id: diagramId,
      table_name: node.data.label,
      description: node.data.description || '',
      table_type: node.data.type || 'Table',
      position_x: node.position.x,
      position_y: node.position.y,
      color: node.data.color || '#ffffff',
      fields: JSON.stringify(node.data.fields || [])
    };
  }
}

export default new DiagramService();