# ============================================================
#  Amigao Pet Shop - Instalacao completa na VPS Windows
#  Execute este script como Administrador no PowerShell
# ============================================================

Write-Host "Iniciando instalacao do Amigao Pet Shop WhatsApp Bot..." -ForegroundColor Green

# --- Instalar Chocolatey -----------
Write-Host "[1/6] Instalando Chocolatey..." -ForegroundColor Cyan
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# --- Instalar Node.js e Git -----------
Write-Host "[2/6] Instalando Node.js 20 e Git..." -ForegroundColor Cyan
choco install nodejs-lts git -y
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# --- Instalar PM2 -----------
Write-Host "[3/6] Instalando PM2..." -ForegroundColor Cyan
npm install -g pm2 pm2-windows-startup

# --- Clonar repositorio -----------
Write-Host "[4/6] Baixando o projeto..." -ForegroundColor Cyan
Set-Location C:\
if (Test-Path "C:\amigao-bot") { Remove-Item "C:\amigao-bot" -Recurse -Force }
git clone -b claude/whatsapp-customer-service-zYNWo https://github.com/lssgoiano-anagi/amigao-petshop-imagens.git amigao-bot
Set-Location C:\amigao-bot

# --- Instalar dependencias -----------
Write-Host "[5/6] Instalando dependencias Node.js..." -ForegroundColor Cyan
npm install

# --- Criar arquivo .env -----------
Write-Host "[6/6] Criando configuracao .env..." -ForegroundColor Cyan
$lines = @(
    "PORT=3000",
    "EVOLUTION_API_URL=http://localhost:8080",
    "EVOLUTION_API_KEY=minha-chave-evolution",
    "EVOLUTION_INSTANCE=amigao",
    "ANTHROPIC_API_KEY=sk-ant-COLOQUE-SUA-CHAVE-AQUI",
    "PETSHOP_NOME=Amigao Pet Shop",
    "PETSHOP_ENDERECO=Rua dos Pets 123 - Centro",
    "PETSHOP_HORARIO=Seg-Sex 8h-18h | Sab 8h-17h",
    "PETSHOP_INSTAGRAM=@amigaopetshop",
    "PETSHOP_WHATSAPP=(11) 9 9999-9999",
    "DASHBOARD_PASSWORD=amigao2025",
    "DB_PATH=C:/amigao-bot/amigao.db"
)
$lines | Out-File -FilePath "C:\amigao-bot\.env" -Encoding UTF8

Write-Host ""
Write-Host "INSTALACAO CONCLUIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "  Edite o arquivo C:\amigao-bot\.env" -ForegroundColor White
Write-Host "  Coloque sua ANTHROPIC_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "PARA INICIAR O BOT:" -ForegroundColor Cyan
Write-Host "  cd C:\amigao-bot" -ForegroundColor White
Write-Host "  pm2 start src/index.js --name amigao-bot" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
