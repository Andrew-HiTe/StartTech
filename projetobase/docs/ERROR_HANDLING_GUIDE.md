# 🚨 ERROR HANDLING GUIDE - React + TypeScript + React Flow + Zustand

## 📋 STACK DETECTADO
- **React**: 19.1.1 + TypeScript + Vite
- **React Flow**: @xyflow/react 12.8.4
- **State**: Zustand 5.0.8
- **Styling**: Tailwind CSS 3.4.17

## 🔥 TOP 5 ERROS MAIS COMUNS + SOLUÇÕES

### 1. **React Flow Node Types Error**
```
Error: Node type 'c4Node' not found
```
**Solução**: Verificar se `nodeTypes` está definido antes do `<ReactFlow>`
```tsx
const nodeTypes = { c4Node: C4NodeComponent };
```

### 2. **Zustand TypeScript Errors**
```
Property 'nodes' does not exist on type...
```
**Solução**: Verificar interface do store e usar tipagem correta
```tsx
export interface DiagramStore extends DiagramState, DiagramActions {}
```

### 3. **React Flow Connection Errors**
```
Cannot read properties of undefined (reading 'source')
```
**Solução**: Validar connection antes de adicionar
```tsx
onConnect: (connection) => {
  if (connection.source && connection.target) {
    setEdges(addEdge(connection, edges));
  }
}
```

### 4. **Tailwind Classes Not Applied**
```
Classes not working in production
```
**Solução**: Verificar `tailwind.config.cjs` content paths
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

### 5. **Vite Build Errors**
```
Could not resolve "@xyflow/react"
```
**Solução**: Verificar importações e dependências
```bash
npm install @xyflow/react@latest
```

## 🆘 EMERGENCY RESET COMMANDS
```bash
# Reset completo
rm -rf node_modules package-lock.json
npm install

# Reset apenas React Flow
npm uninstall @xyflow/react
npm install @xyflow/react@latest

# Reset Zustand state
# Limpar localStorage/sessionStorage se persistindo state
```
