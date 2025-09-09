# Templates de Código - StartTech C4 Diagram App

## 🧩 Componente C4 Node

### Template Base
```typescript
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import type { C4NodeData } from '../stores/diagramStore';

export function C4NodeComponent({ data, selected }: NodeProps<C4NodeData>) {
  const getNodeColor = () => {
    switch (data.type) {
      case 'person': return 'bg-blue-100 border-blue-500';
      case 'system': return 'bg-green-100 border-green-500';
      case 'container': return 'bg-yellow-100 border-yellow-500';
      case 'component': return 'bg-purple-100 border-purple-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${getNodeColor()} ${selected ? 'ring-2 ring-blue-400' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-center gap-3">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-white">
          {data.type.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800">{data.title}</div>
          <div className="text-sm text-gray-600">{data.description}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Template com Props Editáveis
```typescript
import { useState, useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { useDiagramStore } from '../stores/diagramStore';

export function EditableC4Node({ id, data }: NodeProps<C4NodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const { updateNodeData } = useDiagramStore();

  const handleSave = useCallback(() => {
    updateNodeData(id, { title, description });
    setIsEditing(false);
  }, [id, title, description, updateNodeData]);

  return (
    <div 
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400"
      onDoubleClick={() => setIsEditing(true)}
    >
      <Handle type="target" position={Position.Top} />
      
      {isEditing ? (
        <div className="space-y-2">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-1 border rounded"
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-1 border rounded"
            onBlur={handleSave}
          />
        </div>
      ) : (
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {data.type.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2">
            <div className="text-lg font-bold">{data.title}</div>
            <div className="text-gray-500">{data.description}</div>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

## � Zustand Store

### Template de Store Completo
```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export interface C4NodeData {
  title: string;
  description: string;
  type: 'system' | 'container' | 'component' | 'person';
  [key: string]: unknown;
}

export type C4Node = Node<C4NodeData>;

interface DiagramState {
  nodes: C4Node[];
  edges: Edge[];
  selectedElements: string[];
  currentTool: 'select' | 'add-table' | 'connect';
  diagramName: string;
}

interface DiagramActions {
  setNodes: (nodes: C4Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<C4NodeData>) => void;
  setCurrentTool: (tool: DiagramState['currentTool']) => void;
  setDiagramName: (name: string) => void;
}

export const useDiagramStore = create<DiagramState & DiagramActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    selectedElements: [],
    currentTool: 'select',
    diagramName: 'Novo Diagrama C4',

    // Actions
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    
    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    
    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    
    onConnect: (connection) => {
      if (connection.source && connection.target) {
        set({ edges: addEdge(connection, get().edges) });
      }
    },
    
    addNode: (position) => {
      const id = `node-${Date.now()}`;
      const newNode: C4Node = {
        id,
        type: 'c4Node',
        position,
        data: {
          title: 'Novo Elemento',
          description: 'Descrição do elemento',
          type: 'system'
        }
      };
      set({ nodes: [...get().nodes, newNode] });
    },
    
    updateNodeData: (nodeId, data) => {
      set({
        nodes: get().nodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      });
    },
    
    setCurrentTool: (tool) => set({ currentTool: tool }),
    setDiagramName: (name) => set({ diagramName: name }),
  }))
);
```

### Template de Hook de Integração
```typescript
import { useEffect, useCallback } from 'react';
import { useDiagramStore } from './diagramStore';

export const useDiagramIntegration = () => {
  const { nodes, edges } = useDiagramStore();

  // Auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Implementar auto-save aqui
      console.log('Auto-saving diagram...', { nodes, edges });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

  const exportDiagram = useCallback(() => {
    const diagram = { nodes, edges };
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `diagram-${Date.now()}.json`);
    linkElement.click();
  }, [nodes, edges]);

  return { exportDiagram };
};
```

## 📋 React Flow Setup

### Template de Configuração Principal
```typescript
import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from './stores/diagramStore';
import { C4NodeComponent } from './components/C4Node';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    currentTool,
  } = useDiagramStore();

  const panOnDrag = useMemo(() => {
    return currentTool === 'select' ? [1, 2] : false;
  }, [currentTool]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        snapToGrid
        snapGrid={[15, 15]}
        panOnDrag={panOnDrag}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#2196f3', strokeWidth: 3 },
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <DiagramCanvas />
    </ReactFlowProvider>
  );
}
```

## 🎨 Patterns de Style (Tailwind)

### Classes Utilitárias Comuns
```css
/* Layout flexível */
.diagram-container {
  @apply w-full h-screen flex flex-col;
}

/* Botões com estados */
.tool-button {
  @apply px-3 py-2 rounded-lg border transition-colors;
}

.tool-button-active {
  @apply bg-blue-500 text-white border-blue-600;
}

.tool-button-inactive {
  @apply bg-white text-gray-700 border-gray-300 hover:bg-gray-50;
}

/* Nós do diagrama */
.node-base {
  @apply px-4 py-2 shadow-md rounded-md border-2 bg-white;
}

.node-selected {
  @apply ring-2 ring-blue-400;
}
```

### Configuração Tailwind Customizada
```javascript
// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'c4-person': '#1f77b4',
        'c4-system': '#ff7f0e', 
        'c4-container': '#2ca02c',
        'c4-component': '#d62728',
      },
      fontFamily: {
        'diagram': ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

## 🧪 Templates de Teste (Futuro)

### Teste de Componente
```typescript
// __tests__/C4Node.test.tsx
import { render, screen } from '@testing-library/react';
import { C4NodeComponent } from '../components/C4Node';

const mockNodeProps = {
  id: 'test-node',
  data: {
    title: 'Test Node',
    description: 'Test Description',
    type: 'system' as const,
  },
  selected: false,
};

describe('C4NodeComponent', () => {
  it('renders node with correct title and description', () => {
    render(<C4NodeComponent {...mockNodeProps} />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

### Teste de Store
```typescript
// __tests__/diagramStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDiagramStore } from '../stores/diagramStore';

describe('useDiagramStore', () => {
  it('should add node correctly', () => {
    const { result } = renderHook(() => useDiagramStore());
    
    act(() => {
      result.current.addNode({ x: 100, y: 100 });
    });
    
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].position).toEqual({ x: 100, y: 100 });
  });
});
```

---
**Atualizado:** 3 de Setembro de 2025
**Baseado na arquitetura:** React 19.1.1 + TypeScript + Vite + React Flow 12.8.4 + Zustand 5.0.8 + Tailwind CSS 3.4.17
