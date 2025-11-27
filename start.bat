@echo off
echo.
echo ==========================================
echo   INICIANDO FRONTEND - TelecomTools Suite
echo ==========================================
echo.

echo Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js: OK
node --version
echo npm: 
npm --version
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
) else (
    echo Dependencias: OK
)
echo.

echo Configurando ambiente...
if not exist ".env.local" (
    echo Criando .env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
)
echo.

echo ==========================================
echo   INICIANDO SERVIDOR DE DESENVOLVIMENTO
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Pressione Ctrl+C para parar
echo.

npm run dev

