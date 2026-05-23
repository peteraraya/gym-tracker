/**
 * Utilidades para optimización de bundle size
 * Tree shaking y imports optimizados
 */

// 1. Lazy imports para librerías pesadas
export const loadFramerMotion = () => import('framer-motion');
export const loadChartLibrary = () => import('recharts');
export const loadDateLibrary = () => import('date-fns');

// 2. Selective imports para Lucide React
// En lugar de: import { Icon1, Icon2, Icon3 } from 'lucide-react'
// Usar imports específicos para mejor tree shaking

// Importar iconos desde la exportación principal para aprovechar las declaraciones
export { Activity, ArrowRight, BarChart3, Calendar, ClipboardList, Dumbbell, Loader2, Plus, Settings, TrendingUp, User } from 'lucide-react';

// 3. Dynamic imports para rutas
export const loadDashboardPage = () => import('@/app/dashboard/page');
export const loadRoutinesPage = () => import('@/app/routines/page');
export const loadWorkoutPage = () => import('@/app/workout/[id]/page');
export const loadProgressPage = () => import('@/app/progress/page');
export const loadProfilePage = () => import('@/app/profile/page');

// 4. Conditional loading basado en features
export const loadAIFeatures = () => {
  if (process.env.NEXT_PUBLIC_AI_ENABLED === 'true') {
    return import('@/components/features/ai/AIAssistant');
  }
  return Promise.resolve({ default: () => null });
};

export const loadAdvancedCharts = () => {
  // Solo cargar si el usuario tiene datos suficientes
  const hasEnoughData = localStorage.getItem('gym_sessions_count');
  if (hasEnoughData && parseInt(hasEnoughData) > 5) {
    return import('@/components/features/progress/AdvancedCharts');
  }
  return Promise.resolve({ default: () => null });
};

// 5. Preload crítico para mejor UX
export const preloadCriticalComponents = () => {
  // Precargar componentes que se usan frecuentemente
  if (typeof window !== 'undefined') {
    // Preload después de que la página inicial cargue
    setTimeout(() => {
      loadFramerMotion();
      loadDashboardPage();
      loadWorkoutPage();
    }, 2000);
  }
};

// 6. Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Bundle Analysis:');
    console.log('- Run `npm run analyze` to see bundle composition');
    console.log('- Check for duplicate dependencies');
    console.log('- Look for opportunities to lazy load');
  }
};

// 7. Webpack bundle splitting configuration
export const bundleSplittingConfig = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Vendor libraries
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      // UI components
      ui: {
        test: /[\\/]components[\\/]ui[\\/]/,
        name: 'ui-components',
        chunks: 'all',
        priority: 20,
      },
      // Charts and visualization
      charts: {
        test: /[\\/](recharts|d3|chart\.js)[\\/]/,
        name: 'charts',
        chunks: 'async',
        priority: 30,
      },
      // Icons
      icons: {
        test: /[\\/](lucide-react|phosphor-react)[\\/]/,
        name: 'icons',
        chunks: 'all',
        priority: 25,
      },
    },
  },
};