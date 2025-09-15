# Copilot Performance Cache

## 🚀 Informações Críticas de Alta Frequência

### Stack Principal (Evita reanálise)
- **React**: 19.1.1 + TypeScript + Vite 7.1.2
- **React Flow**: @xyflow/react 12.8.4 (diagramas)
- **Zustand**: 5.0.8 (state global)
- **Tailwind**: 3.4.17 (CSS utility-first)
- **Build**: Vite dev server porta 5173

### Componentes Core (Referência rápida)
```typescript
// Estrutura principal já implementada
src/
├── App.tsx              // React Flow canvas principal
├── stores/
│   ├── diagramStore.ts  // Zustand store (271 linhas)
│   └── useDiagramIntegration.ts // Hook de integração
├── components/
│   ├── C4Node.tsx       // Nós customizados C4
│   ├── Header.tsx       // Header dinâmico
│   ├── Sidebar*.tsx     // Ferramentas laterais
│   └── Toolbar.tsx      // Barra de ferramentas
```

### Comandos Instantâneos
```bash
# Desenvolvimento (cache: sempre usar estas variações)
npm run dev              # Dev server porta 5173
npm run build           # Build produção
npm run lint            # ESLint check
npx tsc --noEmit       # Type checking

# Recovery rápido
rm -rf node_modules/.vite  # Limpar cache
rm -rf dist               # Limpar build
```

## ⚡ Padrões de Código Otimizados

### React Flow Pattern (Cacheado)
```typescript
// ✅ Padrão eficiente já testado
const nodeTypes = useMemo(() => ({ 
  c4Node: C4NodeComponent 
}), []);

// ✅ Zustand hook otimizado
const { nodes, edges } = useDiagramStore(
  useCallback((state) => ({ 
    nodes: state.nodes, 
    edges: state.edges 
  }), [])
);
```

### TypeScript Interfaces (Cache)
```typescript
// ✅ Interfaces já validadas no projeto
interface C4NodeData {
  title: string;
  description: string;
  type: 'system' | 'container' | 'component' | 'person';
}

interface DiagramState {
  nodes: Node<C4NodeData>[];
  edges: Edge[];
  currentTool: string;
}
```

## 🔧 Fixes Instantâneos (Sem diagnóstico)

### Build Quebrado → Fix imediato
```bash
rm -rf node_modules/.vite; npm run build
```

### Tailwind não aplica → Fix rápido
```bash
# Problema: content paths no tailwind.config.cjs
npx tailwindcss -i src/index.css -o dist/output.css --watch
```

### React Flow nós não renderizam → Fix padrão
```typescript
// 1. Verificar nodeTypes no ReactFlow
// 2. Validar data dos nodes
// 3. Restart dev server
```

## 📦 Dependências State (Cache)

### Status de Dependências (Última verificação)
```json
{
  "@xyflow/react": "^12.8.4",    // ✅ Funcionando
  "react": "^19.1.1",            // ✅ Estável
  "zustand": "^5.0.8",           // ✅ Integrado
  "tailwindcss": "^3.4.17",      // ✅ Configurado
  "typescript": "~5.8.3",        // ✅ Tipos OK
  "vite": "^7.1.2"               // ✅ Build OK
}
```

### Configurações Validadas (Não recriar)
- `tsconfig.json`: ES2020 + React JSX ✅
- `vite.config.ts`: Plugin React + porta 5173 ✅
- `tailwind.config.cjs`: Content paths configurados ✅
- `eslint.config.js`: Rules React + TypeScript ✅

## 🎯 Contexto de Negócio (Cache)

### Funcionalidades Implementadas
- ✅ Sistema C4 diagrams interativos
- ✅ Drag & drop de nós
- ✅ Conexões entre elementos
- ✅ Zoom/pan no canvas
- ✅ Sidebar com ferramentas
- ✅ Header dinâmico
- ✅ State management Zustand
- ✅ **NOVO:** Criação de tabela por drag com tamanho personalizado
- ✅ **NOVO:** Cursor customizado (setinha padrão + mãozinha fechada no drag)
- ✅ **NOVO:** Toolbar na parte inferior
- ✅ **NOVO:** Edição inline do nome do diagrama (clique + Enter)
- ✅ **NOVO:** Enter para confirmar criação no modal

### TODOs Conhecidos
- [x] ~~Remover bolinha com letra dos nós~~ ✅ 
- [x] ~~Criação de tabela por drag com tamanho dinâmico~~ ✅
- [x] ~~Toolbar na parte inferior com botões padronizados~~ ✅
- [x] ~~Edição inline do nome do diagrama com Enter~~ ✅
- [x] ~~Enter no modal de criação de diagrama~~ ✅
- [ ] Sistema de persistência
- [ ] Export/import diagramas
- [ ] Colaboração real-time
- [ ] Temas personalizáveis
- [ ] Testes unitários (vitest)

---
**Cache gerado em:** 4 de Setembro de 2025
**Próxima atualização:** Quando stack/config mudar significativamente
