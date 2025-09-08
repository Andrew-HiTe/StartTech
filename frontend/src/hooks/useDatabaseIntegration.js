// useDatabaseIntegration.js
import { useState, useEffect, useCallback } from 'react';
import diagramService from '../services/diagramService.js';

/**
 * Hook para integração automática com o banco de dados
 * Gerencia a persistência de diagramas automaticamente
 */
export const useDatabaseIntegration = (diagramId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para criar tabela do diagrama
  const createDiagramTable = useCallback(async (diagramName) => {
    if (!diagramId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await diagramService.createDiagramTable(diagramId, diagramName);
      console.log('✅ Tabela criada com sucesso:', result);
      return result;
    } catch (err) {
      console.error('❌ Erro ao criar tabela:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [diagramId]);

  // Função para salvar item no banco
  const saveItemToDatabase = useCallback(async (nodeData) => {
    if (!diagramId) return;

    setIsLoading(true);
    setError(null);

    try {
      const tableData = diagramService.convertNodeToDbItem(nodeData, diagramId);
      const result = await diagramService.addTableToDiagram(diagramId, tableData);
      console.log('✅ Item salvo no banco:', result);
      return result;
    } catch (err) {
      console.error('❌ Erro ao salvar item:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [diagramId]);

  // Função para carregar itens do banco
  const loadItemsFromDatabase = useCallback(async () => {
    if (!diagramId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const items = await diagramService.getDiagramItems(diagramId);
      const nodes = items.map(item => diagramService.convertDbItemToNode(item));
      console.log('✅ Itens carregados do banco:', nodes.length);
      return nodes;
    } catch (err) {
      console.error('❌ Erro ao carregar itens:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [diagramId]);

  return {
    isLoading,
    error,
    createDiagramTable,
    saveItemToDatabase,
    loadItemsFromDatabase
  };
};
