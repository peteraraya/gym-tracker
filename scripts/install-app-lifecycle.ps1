# Script para instalar y configurar el fix de persistencia de entrenamientos en background
# Autor: Kiro AI Assistant
# Fecha: Febrero 2026

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Fix: Entrenamiento se Cierra en Background" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Funciones para imprimir con color
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Print-Error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
}

Print-Success "Directorio del proyecto encontrado"
Write-Host ""

# Paso 1: Instalar dependencias
Print-Info "Paso 1/3: Instalando dependencias de Capacitor..."
npm install @capacitor/app @capacitor/core

if ($LASTEXITCODE -eq 0) {
    Print-Success "Dependencias instaladas correctamente"
} else {
    Print-Error "Error al instalar dependencias"
    exit 1
}

Write-Host ""

# Paso 2: Verificar instalación
Print-Info "Paso 2/2: Verificando instalación..."

# Verificar que @capacitor/app está instalado
$appInstalled = npm list @capacitor/app 2>&1
if ($LASTEXITCODE -eq 0) {
    Print-Success "@capacitor/app instalado"
} else {
    Print-Error "@capacitor/app NO instalado"
    exit 1
}

# Verificar que los archivos existen
if (Test-Path "hooks/useAppLifecycle.ts") {
    Print-Success "Hook useAppLifecycle encontrado"
} else {
    Print-Error "Hook useAppLifecycle NO encontrado"
    exit 1
}

if (Test-Path "context/WorkoutContext.tsx") {
    Print-Success "WorkoutContext encontrado"
} else {
    Print-Error "WorkoutContext NO encontrado"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Print-Success "Instalación completada exitosamente!"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Print-Info "Próximos pasos:"
Write-Host ""
Write-Host "  1. Para desarrollo web:"
Write-Host "     npm run dev"
Write-Host ""
Write-Host "  2. Para probar en móvil:"
Write-Host "     npm run mobile:build"
Write-Host "     npm run mobile:open"
Write-Host ""
Write-Host "  3. Prueba el fix:"
Write-Host "     - Inicia un entrenamiento"
Write-Host "     - Sal de la app (botón Home)"
Write-Host "     - Espera 30 segundos"
Write-Host "     - Vuelve a la app"
Write-Host "     - El entrenamiento debe continuar"
Write-Host ""

Print-Info "Documentación:"
Write-Host "  - docs/SOLUCION_ENTRENAMIENTO_BACKGROUND.md (Español)"
Write-Host "  - docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md (Técnico)"
Write-Host ""

Print-Success "¡Listo para usar!"
