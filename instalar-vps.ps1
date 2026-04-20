# ============================================================
#  Amigao Pet Shop — Instalacao completa na VPS Windows
#  Execute este script como Administrador no PowerShell
# ============================================================

Write-Host "🐾 Iniciando instalacao do Amigao Pet Shop WhatsApp Bot..." -ForegroundColor Green

# --- Instalar Chocolatey (gerenciador de pacotes) -----------
Write-Host "`n[1/6] Instalando Chocolatey..." -ForegroundColor Cyan
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# --- Instalar Node.js 20 e Git ------------------------------
Write-Host "`n[2/6] Instalando Node.js 20 e Git..." -ForegroundColor Cyan
choco install nodejs-lts git -y
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# --- Instalar PM2 (mantém o bot rodando) --------------------
Write-Host "`n[3/6] Instalando PM2..." -ForegroundColor Cyan
npm install -g pm2 pm2-windows-startup

# --- Clonar repositório -------------------------------------
Write-Host "`n[4/6] Baixando o projeto..." -ForegroundColor Cyan
Set-Location C:\
if (Test-Path "C:\amigao-bot") { Remove-Item "C:\amigao-bot" -Recurse -Force }
git clone -b claude/whatsapp-customer-service-zYNWo https://github.com/lssgoiano-anagi/amigao-petshop-imagens.git amigao-bot
Set-Location C:\amigao-bot

# --- Instalar dependencias Node.js --------------------------
Write-Host "`n[5/6] Instalando dependencias..." -ForegroundColor Cyan
npm install

# --- Criar arquivo .env -------------------------------------
Write-Host "`n[6/6] Criando configuracao .env..." -ForegroundColor Cyan
$envContent = @"
PORT=3000

# Evolution API (WhatsApp gateway)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=minha-chave-evolution
EVOLUTION_INSTANCE=amigao

# Anthropic (Claude IA) — obtenha em https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-COLOQUE-SUA-CHAVE-AQUI

# Dados do Pet Shop
PETSHOP_NOME=Amigao Pet Shop
PETSHOP_ENDERECO=Rua dos Pets, 123 - Centro
PETSHOP_HORARIO=Seg-Sex 8h-18h | Sab 8h-17h
PETSHOP_INSTAGRAM=@amigaopetshop
PETSHOP_WHATSAPP=(11) 9 9999-9999

# Dashboard admin
DASHBOARD_PASSWORD=amigao2025

# Banco de dados
DB_PATH=C:\amigao-bot\amigao.db
"@
$envContent | Out-File -FilePath "C:\amigao-bot\.env" -Encoding UTF8

Write-Host "`n✅ Instalacao concluida!" -ForegroundColor Green
Write-Host "📝 Agora edite o arquivo: C:\amigao-bot\.env" -ForegroundColor Yellow
Write-Host "   Preencha sua ANTHROPIC_API_KEY antes de iniciar o bot." -ForegroundColor Yellow
Write-Host "`nPara iniciar o bot depois de configurar o .env:" -ForegroundColor Cyan
Write-Host "   cd C:\amigao-bot" -ForegroundColor White
Write-Host "   pm2 start src/index.js --name amigao-bot" -ForegroundColor White
Write-Host "   pm2 save" -ForegroundColor White
