# ====================================================
# Script para Export/Import do Banco StartTech
# ====================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("export", "import")]
    [string]$Acao,
    
    [string]$Arquivo = "backup_starttech_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql",
    [string]$Usuario = "root",
    [string]$Banco = "starttech_db"
)

# Caminho do mysqldump e mysql
$MySQLPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$mysqldump = Join-Path $MySQLPath "mysqldump.exe"
$mysql = Join-Path $MySQLPath "mysql.exe"

Write-Host "🚀 StartTech - Gerenciador de Banco de Dados" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ($Acao -eq "export") {
    Write-Host "📤 Exportando banco '$Banco'..." -ForegroundColor Yellow
    
    try {
        & $mysqldump -u $Usuario -p $Banco > $Arquivo
        
        if (Test-Path $Arquivo) {
            $tamanho = (Get-Item $Arquivo).Length
            Write-Host "✅ Export realizado com sucesso!" -ForegroundColor Green
            Write-Host "📁 Arquivo: $Arquivo" -ForegroundColor White
            Write-Host "📊 Tamanho: $($tamanho / 1KB) KB" -ForegroundColor White
            Write-Host ""
            Write-Host "📋 Para transferir para outro computador:" -ForegroundColor Cyan
            Write-Host "   1. Copie o arquivo: $Arquivo" -ForegroundColor White
            Write-Host "   2. No outro PC, execute: .\export_banco.ps1 -Acao import -Arquivo $Arquivo" -ForegroundColor White
        } else {
            Write-Host "❌ Falha ao criar arquivo de backup" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erro durante export: $($_.Exception.Message)" -ForegroundColor Red
    }
}
elseif ($Acao -eq "import") {
    if (-not (Test-Path $Arquivo)) {
        Write-Host "❌ Arquivo não encontrado: $Arquivo" -ForegroundColor Red
        return
    }
    
    Write-Host "📥 Importando de '$Arquivo' para banco '$Banco'..." -ForegroundColor Yellow
    Write-Host "⚠️  ATENÇÃO: Isso substituirá os dados existentes!" -ForegroundColor Red
    
    $confirmacao = Read-Host "Continuar? (s/N)"
    if ($confirmacao -ne "s" -and $confirmacao -ne "S") {
        Write-Host "❌ Operação cancelada" -ForegroundColor Yellow
        return
    }
    
    try {
        Write-Host "🔄 Criando banco se não existir..." -ForegroundColor Blue
        & $mysql -u $Usuario -p -e "CREATE DATABASE IF NOT EXISTS $Banco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        
        Write-Host "🔄 Importando dados..." -ForegroundColor Blue
        & $mysql -u $Usuario -p $Banco < $Arquivo
        
        Write-Host "✅ Import realizado com sucesso!" -ForegroundColor Green
        Write-Host "🎯 Banco '$Banco' restaurado!" -ForegroundColor White
    }
    catch {
        Write-Host "❌ Erro durante import: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 Comandos disponíveis:" -ForegroundColor Cyan
Write-Host "   Export: .\export_banco.ps1 -Acao export" -ForegroundColor White
Write-Host "   Import: .\export_banco.ps1 -Acao import -Arquivo backup.sql" -ForegroundColor White
