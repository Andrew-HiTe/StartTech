# 📝 TEMPLATES - Padrões de Código para React Flow + Zustand

## 🧩 TEMPLATE COMPONENTE C4 NODE
```tsx
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import type { C4NodeData } from '../stores/diagramStore';

export function CustomC4Node({ data }: NodeProps<C4NodeData>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} />
      
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          {data.type.charAt(0).toUpperCase()}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.title}</div>
          <div className="text-gray-500">{data.description}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}
```

## 🗃️ TEMPLATE ZUSTAND STORE
```typescript
import { create } from 'zustand';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  currentTool: 'select' | 'add' | 'connect';
}

interface StoreActions {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setCurrentTool: (tool: StoreState['currentTool']) => void;
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  nodes: [],
  edges: [],
  currentTool: 'select',
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
}));
```

## ⚙️ TEMPLATE CONFIGURAÇÃO VITE + TAILWIND
```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})

// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
