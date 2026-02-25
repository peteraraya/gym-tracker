#!/bin/bash

# Script para instalar y configurar el fix de persistencia de entrenamientos en background
# Autor: Kiro AI Assistant
# Fecha: Febrero 2026

echo "================================================"
echo "  Fix: Entrenamiento se Cierra en Background"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_success "Directorio del proyecto encontrado"
echo ""

# Paso 1: Instalar dependencias
print_info "Paso 1/3: Instalando dependencias de Capacitor..."
npm install @capacitor/app @capacitor/core

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

echo ""

# Paso 2: Verificar instalación
print_info "Paso 2/2: Verificando instalación..."

# Verificar que @capacitor/app está instalado
if npm list @capacitor/app &> /dev/null; then
    print_success "@capacitor/app instalado"
else
    print_error "@capacitor/app NO instalado"
    exit 1
fi

# Verificar que los archivos existen
if [ -f "hooks/useAppLifecycle.ts" ]; then
    print_success "Hook useAppLifecycle encontrado"
else
    print_error "Hook useAppLifecycle NO encontrado"
    exit 1
fi

if [ -f "context/WorkoutContext.tsx" ]; then
    print_success "WorkoutContext encontrado"
else
    print_error "WorkoutContext NO encontrado"
    exit 1
fi

echo ""
echo "================================================"
print_success "Instalación completada exitosamente!"
echo "================================================"
echo ""

print_info "Próximos pasos:"
echo ""
echo "  1. Para desarrollo web:"
echo "     npm run dev"
echo ""
echo "  2. Para probar en móvil:"
echo "     npm run mobile:build"
echo "     npm run mobile:open"
echo ""
echo "  3. Prueba el fix:"
echo "     - Inicia un entrenamiento"
echo "     - Sal de la app (botón Home)"
echo "     - Espera 30 segundos"
echo "     - Vuelve a la app"
echo "     - El entrenamiento debe continuar"
echo ""

print_info "Documentación:"
echo "  - docs/SOLUCION_ENTRENAMIENTO_BACKGROUND.md (Español)"
echo "  - docs/WORKOUT_BACKGROUND_PERSISTENCE_FIX.md (Técnico)"
echo ""

print_success "¡Listo para usar!"
