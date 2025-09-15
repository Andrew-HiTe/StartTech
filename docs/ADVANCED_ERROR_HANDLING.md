# Sistema de Tratamento de Erros Otimizado

## 🛡️ Error Boundary e Recovery Patterns

### Implementação React Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Log para sistema de monitoramento
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Armazenar no localStorage para debug
    const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    existingErrors.push(errorReport);
    localStorage.setItem('app_errors', JSON.stringify(existingErrors.slice(-10))); // Manter últimos 10
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50">
          <div className="text-red-600 text-2xl mb-4">Ops! Algo deu errado</div>
          <div className="text-gray-600 mb-6 text-center max-w-md">
            {this.state.error?.message || 'Erro inesperado na aplicação'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recarregar Aplicação
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## ⚡ Hook de Tratamento de Erros Zustand

```typescript
// src/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { useDiagramStore } from '../stores/diagramStore';

interface ErrorContext {
  action: string;
  component?: string;
  data?: any;
}

export const useErrorHandler = () => {
  const { setError, clearError } = useDiagramStore();

  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    console.error('Application error:', error, context);
    
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    // Armazenar no store para exibição na UI
    setError(errorInfo);

    // Log estruturado para debugging
    console.group('🔥 Error Details');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Stack:', error.stack);
    console.groupEnd();

    // Recovery automático baseado no tipo de erro
    if (error.message.includes('React Flow')) {
      setTimeout(() => {
        console.log('🔄 Attempting React Flow recovery...');
        clearError();
      }, 2000);
    }
  }, [setError, clearError]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: ErrorContext
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError, clearError };
};
```

## 🔧 Store de Erros Integrado

```typescript
// Adição ao diagramStore.ts
interface ErrorState {
  currentError: {
    message: string;
    stack?: string;
    timestamp: string;
    context?: any;
  } | null;
  errorHistory: Array<{
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

// Slice de erro para o store
export const createErrorSlice = (set: any, get: any) => ({
  currentError: null,
  errorHistory: [],

  setError: (errorInfo: any) => set((state: any) => ({
    currentError: errorInfo,
    errorHistory: [
      ...state.errorHistory,
      {
        message: errorInfo.message,
        timestamp: errorInfo.timestamp,
        resolved: false,
      }
    ].slice(-20), // Manter últimos 20 erros
  })),

  clearError: () => set((state: any) => ({
    currentError: null,
    errorHistory: state.errorHistory.map((error: any) => 
      error.resolved ? error : { ...error, resolved: true }
    ),
  })),

  getErrorStats: () => {
    const { errorHistory } = get();
    return {
      total: errorHistory.length,
      unresolved: errorHistory.filter((e: any) => !e.resolved).length,
      recent: errorHistory.filter((e: any) => 
        new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    };
  },
});
```

## 🚨 Recovery Patterns Automáticos

### Pattern 1: React Flow Recovery
```typescript
// src/utils/recoveryPatterns.ts
export const reactFlowRecovery = {
  detectIssue: (error: Error) => {
    return error.message.includes('React Flow') || 
           error.message.includes('node') ||
           error.message.includes('edge');
  },

  recover: async () => {
    console.log('🔄 Executing React Flow recovery...');
    
    // Limpar state problemático
    const store = useDiagramStore.getState();
    store.clearSelection();
    
    // Revalidar nodes e edges
    const validNodes = store.nodes.filter(node => 
      node.id && node.type && node.data
    );
    const validEdges = store.edges.filter(edge => 
      edge.id && edge.source && edge.target
    );
    
    if (validNodes.length !== store.nodes.length || 
        validEdges.length !== store.edges.length) {
      store.setNodes(validNodes);
      store.setEdges(validEdges);
    }
    
    return true;
  }
};

export const stateRecovery = {
  detectIssue: (error: Error) => {
    return error.message.includes('state') || 
           error.message.includes('store') ||
           error.message.includes('undefined');
  },

  recover: async () => {
    console.log('🔄 Executing state recovery...');
    
    // Reset para estado mínimo seguro
    const store = useDiagramStore.getState();
    store.resetToDefault();
    
    return true;
  }
};
```

## 📊 Dashboard de Erros (Componente)

```typescript
// src/components/ErrorDashboard.tsx
import React from 'react';
import { useDiagramStore } from '../stores/diagramStore';

export const ErrorDashboard: React.FC = () => {
  const { currentError, errorHistory, clearError, getErrorStats } = useDiagramStore();
  const stats = getErrorStats();

  if (!currentError && stats.total === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {currentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {currentError.message}
            </span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {stats.total > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
          Erros: {stats.unresolved} ativos, {stats.total} total
        </div>
      )}
    </div>
  );
};
```

## ⚡ Implementação de Logging Avançado

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(message: string, data?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`🐛 [DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`ℹ️ [INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, data);
    }
  }

  error(message: string, error?: Error, context?: any) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`🔥 [ERROR] ${message}`, error, context);
      
      // Enviar para sistema de monitoramento (futuro)
      this.reportError(message, error, context);
    }
  }

  private reportError(message: string, error?: Error, context?: any) {
    // Implementar integração com Sentry, LogRocket, etc.
    const errorReport = {
      timestamp: new Date().toISOString(),
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Por enquanto, armazenar localmente
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    logs.push(errorReport);
    localStorage.setItem('app_logs', JSON.stringify(logs.slice(-50)));
  }
}

export const logger = new Logger();
```

## 🎯 Checklist de Implementação

### Para aplicar o sistema:

1. **Adicionar ErrorBoundary no App.tsx**
```typescript
// Envolver componentes principais
<ErrorBoundary>
  <Header />
  <div className="flex">
    <Sidebar />
    <ReactFlowCanvas />
  </div>
</ErrorBoundary>
```

2. **Integrar hook de erro nos componentes críticos**
```typescript
// Em C4Node.tsx, Sidebar.tsx, etc.
const { handleError } = useErrorHandler();

// Usar em operações que podem falhar
handleError(error, { action: 'add_node', component: 'C4Node' });
```

3. **Adicionar dashboard de erros**
```typescript
// No App.tsx
import { ErrorDashboard } from './components/ErrorDashboard';

// Renderizar no final
<ErrorDashboard />
```

---
**Sistema ativo desde:** 4 de Setembro de 2025
**Próxima revisão:** Quando implementar monitoramento externo
