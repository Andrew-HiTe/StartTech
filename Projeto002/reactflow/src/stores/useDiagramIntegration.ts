import { useEffect } from 'react';
import { useDiagramStore } from './diagramStore';
import { useDiagramManager } from './diagramManager';

/**
 * Hook para integrar DiagramManager com DiagramStore
 * Sincroniza a seleção de diagramas com a área de trabalho
 */
export const useDiagramIntegration = () => {
  const { currentDiagramId, getCurrentDiagram, saveDiagramData } = useDiagramManager();
  const { 
    loadDiagramData, 
    getCurrentDiagramData, 
    nodes, 
    edges 
  } = useDiagramStore();

  // Carregar dados quando diagrama muda
  useEffect(() => {
    const currentDiagram = getCurrentDiagram();
    if (currentDiagram) {
      loadDiagramData(currentDiagram.nodes, currentDiagram.edges);
    }
  }, [currentDiagramId, getCurrentDiagram, loadDiagramData]);

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
