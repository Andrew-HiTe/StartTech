# Guia de Tratamento de Erros - StartTech C4 Diagram App

## Configuração do Projeto

### Stack Tecnológico
- **React**: 19.1.1 + TypeScript + Vite 7.1.2
- **React Flow**: @xyflow/react 12.8.4 (diagramas interativos)
- **Zustand**: 5.0.8 (gerenciamento de estado)
- **Tailwind CSS**: 3.4.17 (estilização)
- **ESLint**: 9.33.0 (qualidade de código)

### Configurações Críticas
- **tsconfig.json**: Configuração TypeScript com ES modules
- **vite.config.ts**: Build tool e dev server
- **tailwind.config.cjs**: Configuração CSS utility-first
- **eslint.config.js**: Rules para React + TypeScript

## Erros Comuns e Soluções

### 1. Problemas de Build

#### Erro: "Could not resolve '@xyflow/react'"
**Causa:** Dependência React Flow não instalada corretamente ou versão incompatível
**Solução:**
```bash
npm uninstall @xyflow/react
npm install @xyflow/react@latest
npm run build
```

#### Erro: "TypeScript compilation errors"
**Causa:** Tipos incompatíveis ou configuração tsconfig
**Solução:**
```bash
npx tsc --noEmit  # Verificar erros de tipo
npm run lint      # Verificar problemas ESLint
```

### 2. Problemas de Dependências

#### Erro: "Module not found: Can't resolve 'zustand'"
**Causa:** State management store não instalado ou importação incorreta
**Solução:**
```bash
npm install zustand@latest
# Verificar imports: import { create } from 'zustand'
```

#### Erro: "Tailwind classes not applied"
**Causa:** Configuração Tailwind content paths incorretos
**Solução:**
```javascript
// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // ...
}
```

### 3. Problemas de Configuração

#### Erro: "Vite server won't start"
**Causa:** Conflito de porta ou configuração incorreta
**Solução:**
```bash
# Limpar cache e reiniciar
rm -rf node_modules/.vite
npm run dev
```

#### Erro: "React Flow nodes não aparecem"
**Causa:** nodeTypes não configurado ou handle positions incorretos
**Solução:**
```typescript
// ✅ Correto
const nodeTypes = { c4Node: C4NodeComponent };
<ReactFlow nodeTypes={nodeTypes} />
```

### 4. Problemas de Runtime

#### Erro: "Cannot read properties of undefined (connection)"
**Causa:** Conexões React Flow sem validação
**Solução:**
```typescript
// ✅ Sempre validar connection
onConnect: (connection) => {
  if (connection.source && connection.target) {
    setEdges(addEdge(connection, edges));
  }
}
```

## Padrões de Desenvolvimento Seguros

### 1. Componente C4 Node Seguro
```typescript
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import type { C4NodeData } from '../stores/diagramStore';

export function C4NodeComponent({ data }: NodeProps<C4NodeData>) {
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
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### 2. Zustand Store Seguro
```typescript
import { create } from 'zustand';
import type { Node, Edge, Connection } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  nodes: [],
  edges: [],
  onConnect: (connection) => {
    if (connection.source && connection.target) {
      set({ edges: addEdge(connection, get().edges) });
    }
  },
}));
```

### 3. React Flow Integration Seguro
```typescript
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
/>
```

## Debugging Workflow

### Checklist de Diagnóstico
- [ ] Build sem erros: `npm run build`
- [ ] Testes passando: `npm test` (se configurado)
- [ ] Linter limpo: `npm run lint`
- [ ] Dependências atualizadas: `npm outdated`
- [ ] Configurações corretas: Vite + Tailwind + TypeScript

### Comandos de Diagnóstico
```bash
# Verificar build
npm run build

# Verificar dependências
npm list
npm outdated

# Limpar cache
rm -rf node_modules/.vite
rm -rf dist

# Reset completo
rm -rf node_modules package-lock.json
npm install
```

### Estratégias de Rollback
1. **Git checkout:** Para mudanças de código
2. **Dependency rollback:** `npm install package@version`
3. **Config backup:** Manter backups de vite.config.ts, tsconfig.json

---
**Última atualização:** 3 de Setembro de 2025
**Instruções:** Atualize este arquivo sempre que encontrar novos erros/soluções
