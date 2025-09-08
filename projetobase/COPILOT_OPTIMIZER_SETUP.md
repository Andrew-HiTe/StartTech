# 🚀 COPILOT OPTIMIZER - SISTEMA COMPLETO DE SETUP AUTOMÁTICO

## 📋 INSTRUÇÕES DE USO

### PASSO 1: Salve este arquivo como `COPILOT_OPTIMIZER_SETUP.md` em qualquer projeto

### PASSO 2: Copie e cole este prompt básico no Copilot:

```
Por favor, leia o arquivo COPILOT_OPTIMIZER_SETUP.md e execute todas as instruções automaticamente.
```

**É só isso! O Copilot vai ler este arquivo e fazer tudo automaticamente.**

---

## 🤖 INSTRUÇÕES PARA O COPILOT

### ETAPA 1: ANÁLISE DO PROJETO
1. **Identifique o stack tecnológico:**
   - Leia package.json, requirements.txt, pom.xml, go.mod, Cargo.toml, etc.
   - Identifique linguagem principal, frameworks, build tools
   - Detecte versões e dependências críticas

2. **Mapeie a arquitetura:**
   - Estrutura de pastas (src/, components/, models/, etc.)
   - Arquivos de configuração (tsconfig, webpack, vite, etc.)
   - Pontos de entrada principais (main.js, index.tsx, app.py, etc.)

3. **Detecte padrões existentes:**
   - Convenções de nomenclatura
   - Estruturas de componentes/módulos
   - Padrões arquiteturais (MVC, MVVM, microservices, etc.)

### ETAPA 2: CRIAÇÃO DA ESTRUTURA

Crie a pasta `/docs` se não existir e implemente estes arquivos:

#### 📁 `docs/ERROR_HANDLING_GUIDE.md`
```markdown
# Guia de Tratamento de Erros - [NOME_DO_PROJETO]

## Configuração do Projeto

### Stack Tecnológico
[LISTAR_STACK_IDENTIFICADO]

### Configurações Críticas
[DOCUMENTAR_CONFIGS_IMPORTANTES]

## Erros Comuns e Soluções

### 1. Problemas de Build
#### Erro: [ERRO_BUILD_COMUM_DA_STACK]
**Causa:** [EXPLICAR_CAUSA]
**Solução:**
```bash
[COMANDOS_DE_FIX]
```

#### Erro: [SEGUNDO_ERRO_BUILD_COMUM]
**Causa:** [EXPLICAR_CAUSA]
**Solução:**
```[LINGUAGEM]
// ❌ Incorreto
[CODIGO_INCORRETO]

// ✅ Correto
[CODIGO_CORRETO]
```

### 2. Problemas de Dependências
#### Erro: [ERRO_DEPENDENCIA_COMUM]
**Causa:** [EXPLICAR_CAUSA]
**Solução:**
```bash
[COMANDOS_GERENCIADOR_PACOTES]
```

### 3. Problemas de Configuração
#### Erro: [ERRO_CONFIG_COMUM]
**Causa:** [EXPLICAR_CAUSA]
**Solução:**
```[LINGUAGEM_CONFIG]
[CONFIGURACAO_CORRETA]
```

### 4. Problemas de Runtime
#### Erro: [ERRO_RUNTIME_COMUM]
**Causa:** [EXPLICAR_CAUSA]
**Solução:**
```[LINGUAGEM]
[CODIGO_SOLUCAO]
```

## Padrões de Desenvolvimento Seguros

### 1. [PADRAO_ARQUITETURAL_1]
```[LINGUAGEM]
[TEMPLATE_PADRAO_SEGURO]
```

### 2. [PADRAO_ARQUITETURAL_2]
```[LINGUAGEM]
[TEMPLATE_PADRAO_SEGURO]
```

### 3. [PADRAO_ESPECIFICO_DA_STACK]
```[LINGUAGEM]
[TEMPLATE_ESPECIFICO]
```

## Debugging Workflow

### Checklist de Diagnóstico
- [ ] Build sem erros: `[COMANDO_BUILD]`
- [ ] Testes passando: `[COMANDO_TEST]`
- [ ] Linter limpo: `[COMANDO_LINT]`
- [ ] Dependências atualizadas: `[COMANDO_DEPS]`
- [ ] Configurações corretas: [LISTAR_CONFIGS]

### Comandos de Diagnóstico
```bash
# Verificar build
[COMANDO_BUILD]

# Verificar dependências
[COMANDO_CHECK_DEPS]

# Limpar cache
[COMANDOS_CLEAN_CACHE]

# Reset completo
[COMANDOS_RESET]
```

### Estratégias de Rollback
1. **Git checkout:** Para mudanças de código
2. **Dependency rollback:** `[COMANDO_ROLLBACK_DEPS]`
3. **Config backup:** [ESTRATEGIA_BACKUP_CONFIG]

---
**Última atualização:** [DATA_ATUAL]
**Instruções:** Atualize este arquivo sempre que encontrar novos erros/soluções
```

#### 📁 `docs/PROJECT_CONTEXT.md`
```markdown
# [NOME_PROJETO] - Context Cache

## 🏗️ Stack Tecnológico Atual
- **Linguagem Principal:** [LINGUAGEM]
- **Framework:** [FRAMEWORK] v[VERSAO]
- **Build Tool:** [BUILD_TOOL] v[VERSAO]
- **Package Manager:** [PACKAGE_MANAGER] v[VERSAO]
- **Outras Tools:** [LISTAR_OUTRAS_TOOLS]

## 📁 Arquitetura de Arquivos Críticos

### Estrutura Principal
```
[MAPEAR_ESTRUTURA_PROJETO]
```

### Arquivos de Configuração
- `[CONFIG_FILE_1]` - [PROPOSITO]
- `[CONFIG_FILE_2]` - [PROPOSITO]
- `[CONFIG_FILE_3]` - [PROPOSITO]

### Pontos de Entrada
- **Main:** `[ARQUIVO_PRINCIPAL]`
- **Config:** `[ARQUIVO_CONFIG_PRINCIPAL]`
- **Build:** `[ARQUIVO_BUILD]`

## ⚡ Estado Funcional Atual

### ✅ Implementado e Funcionando
[LISTAR_FUNCIONALIDADES_EXISTENTES]

### 🎯 Componentes/Módulos Core
[LISTAR_COMPONENTES_PRINCIPAIS]

### 📦 Dependencies Chave
```[FORMATO_DEPS]
[LISTAR_DEPENDENCIAS_CRITICAS_COM_VERSOES]
```

## 🔧 Configurações Críticas

### [CATEGORIA_CONFIG_1]
```[FORMATO_CONFIG]
[CONFIGURACAO_IMPORTANTE_1]
```

### [CATEGORIA_CONFIG_2]
```[FORMATO_CONFIG]
[CONFIGURACAO_IMPORTANTE_2]
```

## 🚀 Comandos Frequentes

### Desenvolvimento
```bash
[COMANDO_DEV_SERVER]     # Servidor de desenvolvimento
[COMANDO_WATCH]          # Watch mode
[COMANDO_HOT_RELOAD]     # Hot reload
```

### Build e Deploy
```bash
[COMANDO_BUILD_DEV]      # Build desenvolvimento
[COMANDO_BUILD_PROD]     # Build produção
[COMANDO_DEPLOY]         # Deploy
```

### Testes
```bash
[COMANDO_TEST_UNIT]      # Testes unitários
[COMANDO_TEST_E2E]       # Testes E2E
[COMANDO_TEST_COVERAGE]  # Coverage
```

### Qualidade
```bash
[COMANDO_LINT]           # Linting
[COMANDO_FORMAT]         # Formatação
[COMANDO_TYPE_CHECK]     # Type checking
```

### Manutenção
```bash
[COMANDO_CLEAN]          # Limpeza
[COMANDO_UPDATE_DEPS]    # Atualizar dependências
[COMANDO_AUDIT]          # Auditoria de segurança
```

## 🎨 Convenções do Projeto

### Nomenclatura
- **Arquivos:** [CONVENCAO_ARQUIVOS]
- **Componentes:** [CONVENCAO_COMPONENTES]
- **Variáveis:** [CONVENCAO_VARIAVEIS]
- **Funções:** [CONVENCAO_FUNCOES]

### Estrutura de Código
[DESCREVER_PADROES_ESTRUTURAIS]

---
**Última sync:** [DATA_ATUAL] - [DESCRICAO_ESTADO_ATUAL]
```

#### 📁 `docs/QUICK_CHECKS.md`
```markdown
# Quick Performance Checks

## ⚡ Build Status Checklist
```bash
# Sequência de validação rápida
[COMANDO_BUILD]                    # ✅ Deve passar sem erros
[COMANDO_TEST]                     # ✅ Todos os testes verdes
[COMANDO_LINT]                     # ✅ Sem issues de qualidade
[COMANDO_TYPE_CHECK]               # ✅ Tipos corretos (se aplicável)
```

## 🎯 Pre-commit Quality Gates

### Checklist Obrigatório
- [ ] Build limpo
- [ ] Testes passando
- [ ] Linter sem warnings
- [ ] [CHECKS_ESPECIFICOS_DA_STACK]

### Performance Patterns
```[LINGUAGEM]
// ✅ Padrão eficiente para [STACK]
[CODIGO_PERFORMANCE_PATTERN_1]

// ✅ Padrão de otimização
[CODIGO_PERFORMANCE_PATTERN_2]
```

## 🔧 Quick Fixes Reference

### [ERRO_MAIS_COMUM_1]
```bash
# Problema: [DESCRICAO]
# Fix rápido:
[COMANDO_FIX_RAPIDO]
```

### [ERRO_MAIS_COMUM_2]
```bash
# Problema: [DESCRICAO]
# Fix rápido:
[SEQUENCIA_COMANDOS_FIX]
```

### [ERRO_MAIS_COMUM_3]
```[LINGUAGEM]
// Problema: [DESCRICAO]
// Fix rápido:
[CODIGO_FIX]
```

## 📱 Stack-Specific Validations

### [VALIDACAO_ESPECIFICA_1]
```bash
[COMANDO_VALIDACAO_1]
```

### [VALIDACAO_ESPECIFICA_2]
```bash
[COMANDO_VALIDACAO_2]
```

## 🎪 Workflow de Emergência

### Build Quebrado
1. `[COMANDO_CLEAN]`
2. `[COMANDO_REINSTALL_DEPS]`
3. `[COMANDO_BUILD]`

### Dependências Problemáticas
1. `[COMANDO_CHECK_OUTDATED]`
2. `[COMANDO_UPDATE_SAFE]`
3. `[COMANDO_AUDIT_FIX]`

### Performance Issues
1. `[COMANDO_PROFILE]`
2. `[COMANDO_ANALYZE_BUNDLE]`
3. `[COMANDO_OPTIMIZE]`

---
**Use para:** Validação rápida antes de commits, deploys e code reviews
```

#### 📁 `docs/TEMPLATES.md`
```markdown
# Templates de Código - [NOME_PROJETO]

## 🧩 [TIPO_COMPONENTE_PRINCIPAL]

### Template Base
```[LINGUAGEM]
[TEMPLATE_COMPONENTE_PADRAO_COMPLETO]
```

### Template com Props/Parâmetros
```[LINGUAGEM]
[TEMPLATE_COM_PROPS_TIPADAS]
```

### Template com Estado
```[LINGUAGEM]
[TEMPLATE_COM_GERENCIAMENTO_ESTADO]
```

## 🔧 [TIPO_MODULO_PRINCIPAL]

### Template de Módulo
```[LINGUAGEM]
[TEMPLATE_MODULO_PADRAO]
```

### Template de Service/Helper
```[LINGUAGEM]
[TEMPLATE_SERVICE_HELPER]
```

### Template de Utility
```[LINGUAGEM]
[TEMPLATE_UTILITY_FUNCTION]
```

## 📋 [PADROES_ARQUITETURAIS]

### [PADRAO_1]
```[LINGUAGEM]
[TEMPLATE_PADRAO_ARQUITETURAL_1]
```

### [PADRAO_2]
```[LINGUAGEM]
[TEMPLATE_PADRAO_ARQUITETURAL_2]
```

## 🎨 Patterns de Style

### [PATTERN_ESTILO_1]
```[LINGUAGEM_STYLE]
[TEMPLATE_ESTILO_1]
```

### [PATTERN_ESTILO_2]
```[LINGUAGEM_STYLE]
[TEMPLATE_ESTILO_2]
```

## 🧪 Templates de Teste

### Teste Unitário
```[LINGUAGEM_TEST]
[TEMPLATE_TESTE_UNITARIO]
```

### Teste de Integração
```[LINGUAGEM_TEST]
[TEMPLATE_TESTE_INTEGRACAO]
```

## 📦 Templates de Configuração

### [CONFIG_TYPE_1]
```[FORMATO_CONFIG]
[TEMPLATE_CONFIGURACAO_1]
```

### [CONFIG_TYPE_2]
```[FORMATO_CONFIG]
[TEMPLATE_CONFIGURACAO_2]
```

## 🔄 Templates de CI/CD

### [CI_TEMPLATE]
```yaml
[TEMPLATE_CI_CD]
```

---
**Atualizado:** [DATA_ATUAL]
**Baseado na arquitetura:** [DESCRICAO_ARQUITETURA_ATUAL]
```

### ETAPA 3: OTIMIZAÇÕES ESPECÍFICAS

1. **Identifique comandos mais frequentes** da stack detectada
2. **Documente troubleshooting específico** dos frameworks usados
3. **Crie templates baseados** nos padrões já existentes no projeto
4. **Configure context caching** com informações críticas sempre acessíveis

### ETAPA 4: PERSONALIZAÇÃO

1. **Substitua todos os placeholders** [PLACEHOLDER] com dados reais do projeto
2. **Adapte templates** aos padrões específicos encontrados
3. **Adicione sections específicas** se a stack tiver necessidades únicas
4. **Valide comandos** antes de documentar

### ETAPA 5: FINALIZAÇÃO

1. **Confirme que todos os 4 arquivos foram criados**
2. **Verifique se não há placeholders sem preencher**
3. **Teste pelo menos um comando de cada tipo** documentado
4. **Adicione mensagem de confirmação** indicando stack detectada e arquivos criados

---

## 🎯 RESULTADO ESPERADO

Após executar estas instruções, o projeto terá:
- ✅ Sistema completo de aceleração de desenvolvimento
- ✅ Context caching inteligente
- ✅ Troubleshooting automatizado
- ✅ Templates prontos para uso
- ✅ Comandos organizados e testados

**Este sistema funciona para qualquer stack: React, Vue, Angular, Python, Java, Go, Rust, PHP, etc.**
