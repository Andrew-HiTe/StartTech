import { useEffect } from 'react';
import useDiagramStore from './diagramStore.js';
import { useDiagramManager } from './diagramManager.js';
import diagramService from '../services/diagramService.js';

/**
 * Hook para integrar DiagramManager com DiagramStore
 * Sincroniza a seleção de diagramas com a área de trabalho
 */
export const useDiagramIntegration = () => {
  const { 
    currentDiagramId, 
    getCurrentDiagram, 
    saveDiagramData, 
    loadDiagramsFromDatabase 
  } = useDiagramManager();
  const { 
    loadDiagramData, 
    getCurrentDiagramData, 
    setCurrentDiagramId,
    setNodes,
    nodes, 
    edges 
  } = useDiagramStore();

  // Versão simplificada para debug - apenas carregar dados locais
  useEffect(() => {
    const currentDiagram = getCurrentDiagram();
    if (currentDiagram && currentDiagramId) {
      console.log(`🔄 Carregando diagrama: ${currentDiagram.name}`);
      setCurrentDiagramId(currentDiagramId);
      loadDiagramData(currentDiagram.nodes || [], currentDiagram.edges || []);
    }
  }, [currentDiagramId]);

  // Salvar dados quando nodes/edges mudam (com debounce)
  useEffect(() => {
    if (!currentDiagramId) return;

    const timeoutId = setTimeout(() => {
      const { nodes: currentNodes, edges: currentEdges } = getCurrentDiagramData();
      saveDiagramData(currentDiagramId, currentNodes, currentEdges);
    }, 1000); // 1 segundo de debounce

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, currentDiagramId, getCurrentDiagramData, saveDiagramData]);

  return {
    currentDiagramId,
    getCurrentDiagram
  };
};
