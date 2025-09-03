# Copilot Performance Optimizer Setup
# Execute este script em qualquer projeto para criar a base de otimizacao

param(
    [string]$ProjectName = (Split-Path -Leaf (Get-Location))
)

Write-Host "Configurando Copilot Optimizer para projeto: $ProjectName" -ForegroundColor Green

# Criar diretorio docs se nao existir
if (!(Test-Path -Path "docs")) {
    New-Item -ItemType Directory -Path "docs"
    Write-Host "Diretorio 'docs' criado" -ForegroundColor Yellow
}

Set-Location "docs"

# Template 1: ERROR_HANDLING_GUIDE.md
$errorGuideContent = @"
# Guia de Tratamento de Erros - $ProjectName

## Configuracao do Projeto

### Stack Tecnologico
- **[AGUARDANDO_ANALISE]**

### Configuracoes Criticas
[Serao identificadas durante analise...]

## Erros Comuns e Solucoes

### 1. [CATEGORIA_SERA_PREENCHIDA]

#### Erro: "[MENSAGEM_SERA_ADICIONADA]"
**Causa:** [Explicacao sera adicionada]
**Solucao:**
[codigo sera adicionado - incorreto]
[codigo sera adicionado - correto]

## Padroes de Desenvolvimento Seguros

### 1. [PADRAO_SERA_IDENTIFICADO]
[Padrao testado e funcional - codigo sera adicionado]

## Debugging Workflow

### Checklist de Erro
- [ ] Build sem erros
- [ ] Dependencias atualizadas
- [ ] Configuracao correta
- [ ] [Mais itens serao adicionados]

### Comandos de Diagnostico
# Serao identificados durante analise
[comandos serao adicionados]

---

**Ultima atualizacao:** $(Get-Date -Format "dd/MM/yyyy")
**Instrucoes:** Este arquivo sera preenchido automaticamente pelo Copilot conforme problemas forem encontrados e resolvidos.
"@

# Criar prompt de setup
$setupPromptContent = @"
# PROMPT UNIVERSAL PARA SETUP AUTOMATICO

Copie e cole este prompt no Copilot para configurar automaticamente:

---

Ola! Acabei de executar o Copilot Optimizer Setup no projeto '$ProjectName'. 

Por favor, analise este projeto e:

1. **ANALISE AUTOMATICA:**
   - Identifique o stack tecnologico (package.json, dependencias, configuracoes)
   - Mapeie arquitetura de arquivos (src/, componentes principais, etc.)
   - Identifique padroes de codigo existentes
   - Detecte configuracoes criticas (build tools, linters, etc.)

2. **PREENCHA OS TEMPLATES:**
   - docs/ERROR_HANDLING_GUIDE.md - Com erros comuns da stack identificada
   - docs/PROJECT_CONTEXT.md - Com contexto tecnico completo
   - docs/QUICK_CHECKS.md - Com comandos e validacoes especificas
   - docs/TEMPLATES.md - Com templates de codigo padrao

3. **OTIMIZACOES ESPECIFICAS:**
   - Crie padroes de leitura eficiente para este tipo de projeto
   - Identifique comandos de build/test/dev mais utilizados
   - Documente troubleshooting especifico da stack
   - Crie templates baseados na arquitetura atual

**OBJETIVO:** Acelerar desenvolvimento futuro com contexto inteligente e solucoes pre-documentadas.

Pode comecar a analise e preenchimento automatico dos templates?

---

**Data de setup:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Projeto:** $ProjectName
"@

# Criar os arquivos basicos
$errorGuideContent | Out-File -FilePath "ERROR_HANDLING_GUIDE.md" -Encoding UTF8
$setupPromptContent | Out-File -FilePath "SETUP_PROMPT.md" -Encoding UTF8

# Voltar ao diretorio raiz
Set-Location ".."

Write-Host ""
Write-Host "Setup do Copilot Optimizer concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Abra docs/SETUP_PROMPT.md" -ForegroundColor White
Write-Host "2. Copie o prompt e cole no Copilot" -ForegroundColor White
Write-Host "3. Deixe ele analisar e preencher automaticamente" -ForegroundColor White
Write-Host "4. Comece a desenvolver com performance otimizada!" -ForegroundColor White
Write-Host ""
