# ✅ QUICK CHECKS - Pre-Commit & Diagnóstico

## 🚀 CHECKLIST PRE-COMMIT
```bash
# 1. Build check
npm run build          # ✅ Build sem erros

# 2. Lint check  
npm run lint           # ✅ Sem warnings ESLint

# 3. Type check
npx tsc --noEmit       # ✅ Sem erros TypeScript

# 4. Preview test
npm run preview        # ✅ App carrega corretamente
```

## 🔧 QUICK FIXES PROBLEMAS COMUNS

### React Flow não carrega
```bash
npm uninstall @xyflow/react
npm install @xyflow/react@latest
```

### Tailwind classes não aplicam
```bash
# Verificar se Tailwind está processando
npx tailwindcss -i src/index.css -o dist/output.css --watch
```

### Zustand state não persiste
```typescript
// Verificar se store está sendo usado corretamente
const { nodes, setNodes } = useDiagramStore();
```

### TypeScript errors em imports
```typescript
// Usar type imports explícitos
import type { Node, Edge } from '@xyflow/react';
```

## 🔍 COMANDOS DE DIAGNÓSTICO
```bash
# Verificar versões
npm list                    # Todas as dependências
node --version             # Versão do Node
npm --version              # Versão do NPM

# Verificar conflitos
npm ls --depth=0           # Deps de primeiro nível
npm audit                  # Verificar vulnerabilidades

# Performance check
npm run build -- --analyze # Análise do bundle
```

## 🆘 QUANDO ALGO DÁ ERRADO
1. **Limpar cache**: `rm -rf node_modules package-lock.json && npm install`
2. **Reset Vite**: `rm -rf dist .vite && npm run build`
3. **Verificar logs**: Console do browser + terminal
4. **Rollback**: Git reset para último commit funcionando
