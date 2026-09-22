@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js LTS desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)
call npm ci
if errorlevel 1 goto error
call npm test
if errorlevel 1 goto error
call npm run dist:win
if errorlevel 1 goto error
echo Instalador creado en la carpeta dist.
pause
exit /b 0
:error
echo No se ha podido terminar. Revisa el error mostrado arriba.
pause
exit /b 1
