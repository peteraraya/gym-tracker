/**
 * Script de migración de imports: actualiza @/components/X al nuevo path de dominio.
 * Uso: node scripts/fix-imports.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Mapa: NombreArchivo → nuevo path relativo dentro de components/
const COMPONENT_MAP = {
  // achievements
  AchievementBadge:       'features/achievements/AchievementBadge',
  AchievementCard:        'features/achievements/AchievementCard',
  AchievementDebugPanel:  'features/achievements/AchievementDebugPanel',
  AchievementNotification:'features/achievements/AchievementNotification',
  AchievementsGrid:       'features/achievements/AchievementsGrid',

  // workout
  ActiveWorkoutBanner:    'features/workout/ActiveWorkoutBanner',
  MinimizedTimer:         'features/workout/MinimizedTimer',
  PreparationCountdown:   'features/workout/PreparationCountdown',
  RestNotification:       'features/workout/RestNotification',
  RestSettings:           'features/workout/RestSettings',
  RestTimeSelector:       'features/workout/RestTimeSelector',
  SetExecutionModal:      'features/workout/SetExecutionModal',
  SetsReference:          'features/workout/SetsReference',
  SetTimer:               'features/workout/SetTimer',
  SetTypeCycleButton:     'features/workout/SetTypeCycleButton',
  SetTypeSelector:        'features/workout/SetTypeSelector',
  Timer:                  'features/workout/Timer',
  WorkoutComparison:      'features/workout/WorkoutComparison',
  WorkoutGlobalTimer:     'features/workout/WorkoutGlobalTimer',
  WorkoutProgressIndicator:'features/workout/WorkoutProgressIndicator',
  WorkoutSuggestions:     'features/workout/WorkoutSuggestions',
  WeightSelector:         'features/workout/WeightSelector',
  WeightSuggestionBanner: 'features/workout/WeightSuggestionBanner',
  WarmupRecommendation:   'features/workout/WarmupRecommendation',

  // exercises
  ExerciseDetails:        'features/exercises/ExerciseDetails',
  ExerciseGuide:          'features/exercises/ExerciseGuide',
  ExerciseIcon:           'features/exercises/ExerciseIcon',
  ExerciseInfoPanel:      'features/exercises/ExerciseInfoPanel',
  ExerciseListItem:       'features/exercises/ExerciseListItem',
  ExerciseListWithDetails:'features/exercises/ExerciseListWithDetails',
  ExerciseSelector:       'features/exercises/ExerciseSelector',
  AddCustomExerciseModal: 'features/exercises/AddCustomExerciseModal',

  // routines
  RoutineCard:            'features/routines/RoutineCard',
  RoutineForm:            'features/routines/RoutineForm',
  RoutineWizard:          'features/routines/RoutineWizard',
  FloatingCreateRoutine:  'features/routines/FloatingCreateRoutine',

  // sessions
  SessionCard:            'features/sessions/SessionCard',
  EditSessionModal:       'features/sessions/EditSessionModal',
  SessionFilters:         'features/sessions/SessionFilters',
  SessionComparison:      'features/sessions/SessionComparison',

  // progress
  AdvancedCharts:         'features/progress/AdvancedCharts',
  ActivityHeatmap:        'features/progress/ActivityHeatmap',
  ProgressCharts:         'features/progress/ProgressCharts',
  ProgressDashboard:      'features/progress/ProgressDashboard',
  ProgressionAnalysis:    'features/progress/ProgressionAnalysis',
  ProgressionCalculator:  'features/progress/ProgressionCalculator',
  ProgressionSettings:    'features/progress/ProgressionSettings',
  StrengthProgression:    'features/progress/StrengthProgression',
  TrainingFrequency:      'features/progress/TrainingFrequency',
  VolumeChart:            'features/progress/VolumeChart',
  PersonalRecords:        'features/progress/PersonalRecords',
  MuscleGroupStats:       'features/progress/MuscleGroupStats',

  // calculators
  BMICalculator:          'features/calculators/BMICalculator',
  CaloriesBurnedCalculator:'features/calculators/CaloriesBurnedCalculator',
  OneRMCalculator:        'features/calculators/OneRMCalculator',
  PercentageRMCalculator: 'features/calculators/PercentageRMCalculator',
  PlateCalculator:        'features/calculators/PlateCalculator',
  RestTimeCalculator:     'features/calculators/RestTimeCalculator',
  TdeeCalculator:         'features/calculators/TdeeCalculator',
  TempoCalculator:        'features/calculators/TempoCalculator',
  UnitConverter:          'features/calculators/UnitConverter',
  VolumeCalculator:       'features/calculators/VolumeCalculator',
  WilksCalculator:        'features/calculators/WilksCalculator',

  // planning
  WeeklyPlanner:          'features/planning/WeeklyPlanner',
  MonthlyCalendar:        'features/planning/MonthlyCalendar',
  DayPlanModal:           'features/planning/DayPlanModal',

  // body-map
  BodyMap:                'features/body-map/BodyMap',
  AnatomicalBodyMap:      'features/body-map/AnatomicalBodyMap',

  // ai
  AIAssistant:            'features/ai/AIAssistant',
  FloatingAIAssistant:    'features/ai/FloatingAIAssistant',

  // equipment
  EquipmentDropdown:      'features/equipment/EquipmentDropdown',

  // data
  ExportData:             'features/data/ExportData',
  ImportData:             'features/data/ImportData',

  // onboarding
  Onboarding:             'features/onboarding/Onboarding',
  RestartOnboardingButton:'features/onboarding/RestartOnboardingButton',

  // settings
  SoundSettings:          'features/settings/SoundSettings',
  ThemeSettings:          'features/settings/ThemeSettings',
  LanguageSwitcher:       'features/settings/LanguageSwitcher',

  // layout
  Navbar:                 'layout/Navbar',
  PageLayout:             'layout/PageLayout',
  ProtectedRoute:         'layout/ProtectedRoute',
  GlobalUI:               'layout/GlobalUI',
  Providers:              'layout/Providers',
  ReactQueryProvider:     'layout/ReactQueryProvider',
  AppLogo:                'layout/AppLogo',
  PWAInstaller:           'layout/PWAInstaller',
  ServiceWorkerRegistration: 'layout/ServiceWorkerRegistration',
  DisableZoom:            'layout/DisableZoom',

  // shared
  FilterBar:              'shared/FilterBar',
  FilterPanel:            'shared/FilterPanel',
  SearchInput:            'shared/SearchInput',
  EmptyState:             'shared/EmptyState',
  EmptyStateCard:         'shared/EmptyStateCard',
  ErrorBoundary:          'shared/ErrorBoundary',
  LazyErrorBoundary:      'shared/LazyErrorBoundary',
  LoadingSpinner:         'shared/LoadingSpinner',
  LoadingState:           'shared/LoadingState',
  VirtualList:            'shared/VirtualList',
  Pagination:             'shared/Pagination',
  GridLayout:             'shared/GridLayout',
  PageSection:            'shared/PageSection',
  ActionButton:           'shared/ActionButton',
  StatBadge:              'shared/StatBadge',
  StatsCard:              'shared/StatsCard',
  StatsGrid:              'shared/StatsGrid',
  ClientOnly:             'shared/ClientOnly',
  ConnectionIndicator:    'shared/ConnectionIndicator',
  SyncSessionsButton:     'shared/SyncSessionsButton',
  LazyComponents:         'shared/LazyComponents',
  DevTools:               'shared/DevTools',
  PushNotificationTester: 'shared/PushNotificationTester',
  EditValueModal:         'shared/EditValueModal',
};

const ROOT = process.cwd();

// Directorios donde buscar archivos a actualizar
const SCAN_DIRS = ['app', 'components', 'context', 'hooks', 'lib', 'stores', 'types', '__tests__'];

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'coverage', 'out', 'android'].includes(entry.name)) {
          results.push(...getAllFiles(fullPath, exts));
        }
      } else if (exts.includes(extname(entry.name))) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

for (const dir of SCAN_DIRS) {
  const files = getAllFiles(join(ROOT, dir));
  
  for (const filePath of files) {
    totalFiles++;
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;

    for (const [componentName, newPath] of Object.entries(COMPONENT_MAP)) {
      // Patrón: from '@/components/ComponentName' (con comillas simples o dobles)
      const patterns = [
        // @/components/ComponentName (exact match - no slash after)
        { regex: new RegExp(`(@/components/)${componentName}(['"/])`, 'g'), replacement: `$1${newPath}$2` },
      ];

      for (const { regex, replacement } of patterns) {
        const newContent = content.replace(regex, replacement);
        if (newContent !== content) {
          fileReplacements++;
          content = newContent;
          modified = true;
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      totalReplacements += fileReplacements;
      // console.log(`  ✏️  ${filePath.replace(ROOT, '').replace(/\\/g, '/')} (${fileReplacements} reemplazos)`);
    }
  }
}

console.log(`\n✅ Listo: ${modifiedFiles} archivos modificados, ${totalReplacements} reemplazos en ${totalFiles} archivos escaneados.`);
