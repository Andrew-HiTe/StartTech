# Quick Performance Checks

## ⚡ Build Status Checklist
```bash
# Sequência de validação rápida
npm run build                      # ✅ Deve passar sem erros
npm run lint                       # ✅ Sem issues ESLint
npx tsc --noEmit                   # ✅ Tipos TypeScript corretos
npm run preview                    # ✅ Preview funciona corretamente
```

## 🎯 Pre-commit Quality Gates

### Checklist Obrigatório
- [ ] Build limpo (`npm run build`)
- [ ] Linter sem warnings (`npm run lint`)
- [ ] Type checking OK (`npx tsc --noEmit`)
- [ ] React Flow nodes renderizam corretamente
- [ ] Zustand store state consistency
- [ ] Tailwind classes aplicadas corretamente

### Performance Patterns
```typescript
// ✅ Padrão eficiente para React Flow
const nodeTypes = useMemo(() => ({ 
  c4Node: C4NodeComponent 
}), []);

// ✅ Padrão de otimização Zustand
const { nodes, edges } = useDiagramStore(
  useCallback((state) => ({ 
    nodes: state.nodes, 
    edges: state.edges 
  }), [])
);
```

## 🔧 Quick Fixes Reference

### React Flow não renderiza nós
```bash
# Problema: Nodes não aparecem no canvas
# Fix rápido:
# 1. Verificar nodeTypes definido
# 2. Verificar data dos nodes
# 3. Restart dev server
npm run dev
```

### Tailwind classes não aplicam
```bash
# Problema: Estilos não aparecem
# Fix rápido:
npx tailwindcss -i src/index.css -o dist/output.css --watch
# Verificar content paths no tailwind.config.cjs
```

### TypeScript compilation errors
```typescript
// Problema: Tipos incompatíveis
// Fix rápido:
// 1. Verificar imports com type
import type { NodeProps } from '@xyflow/react';
// 2. Validar interfaces
export interface C4NodeData {
  title: string;
  description: string;
  type: 'system' | 'container' | 'component' | 'person';
}
```

## 📱 Stack-Specific Validations

### React Flow Validation
```bash
# Verificar se React Flow está funcionando
npm list @xyflow/react
# Output esperado: @xyflow/react@12.8.4
```

### Zustand Store Validation
```bash
# Verificar se store está sincronizado
# No browser console:
# useDiagramStore.getState()
```

## 🎪 Workflow de Emergência

### Build Quebrado
1. `rm -rf node_modules/.vite`
2. `rm -rf dist`
3. `npm run build`

### Dependências Problemáticas
1. `npm outdated`
2. `npm update --save`
3. `npm audit fix`

### Performance Issues
1. `npm run build -- --analyze` (se configurado)
2. Verificar bundle size no dist/
3. `npm run preview` para testar produção

### React Flow Issues
1. Verificar nodeTypes registration
2. Validar node data structure
3. Check handles positioning
4. Restart dev server

### Zustand State Issues
1. Verificar store subscriptions
2. Check state mutations
3. Validate actions implementation
4. Clear browser storage if persisting

---
**Use para:** Validação rápida antes de commits, deploys e code reviews
**Stack específico:** React 19.1.1 + TypeScript + Vite + React Flow + Zustand + Tailwind
