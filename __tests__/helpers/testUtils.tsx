import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
// Providers will be required dynamically at render time so tests can mock modules
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface AllProvidersProps {
  children: ReactNode
}

const AllProviders = ({ children, queryClient }: AllProvidersProps & { queryClient: QueryClient }) => {
  const Safe = ({ Component, children }: { Component: any; children: ReactNode }) => {
    if (!Component) return <>{children}</>
    // Debug: log component type during tests to catch invalid objects
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('[TestWrapper] Rendering Component:', Component && (Component.name || typeof Component), typeof Component, Component)
    }
    return <Component>{children}</Component>
  }

  return (
    <QueryClientProvider client={queryClient}>
      {
        // Require providers at render time so per-test jest.mock calls take effect
      }
      <Safe Component={require('@/context/LocaleContext').LocaleProvider}>
        <Safe Component={require('@/context/NotificationContext').NotificationProvider}>
          <Safe Component={require('@/context/AuthContext').AuthProvider}>
            <Safe Component={require('@/context/GymContext').GymProvider}>
              <Safe Component={require('@/context/EquipmentContext').EquipmentProvider}>
                <Safe Component={require('@/context/WorkoutContext').WorkoutProvider}>{children}</Safe>
              </Safe>
            </Safe>
          </Safe>
        </Safe>
      </Safe>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrapper = ({ children }: { children?: ReactNode }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>
  return render(ui, { wrapper: Wrapper, ...options })
}

// Enhanced debug: wrap render to log module exports when render throws
const originalCustomRender = customRender
function debugRender(ui: any, options?: any) {
  // Scan the React element tree to detect invalid element types early
  try {
    const seen = new WeakSet()
    const VALID_SYMBOLS = [Symbol.for('react.lazy'), Symbol.for('react.forward_ref'), Symbol.for('react.memo')]
    function scan(element: any, path = 'root') {
      if (!element || typeof element !== 'object') return
      if (seen.has(element)) return
      seen.add(element)
      const type = element.type
      const tType = typeof type
      if (tType === 'undefined') {
        // eslint-disable-next-line no-console
        console.error('[customRender Debug] element.type is undefined at', path, { element })
      }
      if (tType === 'object') {
        const $$ = type && type.$$typeof
        const ok = $$ && VALID_SYMBOLS.includes($$) // lazy/forwardRef/memo are valid object types
        if (!ok) {
          // eslint-disable-next-line no-console
          console.error('[customRender Debug] Invalid element type detected at', path, {
            type,
            typeofType: tType,
            keys: type ? Object.keys(type) : null,
            $$typeof: $$,
          })
        }
      }
      const children = element.props && element.props.children
      if (Array.isArray(children)) {
        children.forEach((c, i) => scan(c, `${path}/${i}`))
      } else {
        scan(children, `${path}/child`)
      }
    }

    try {
      scan(ui)
    } catch (e) {
      // ignore scan errors
    }

    return originalCustomRender(ui, options)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[customRender Debug] render threw:', err && err.message)
    const modulesToInspect = [
      '@/context/LocaleContext',
      '@/context/NotificationContext',
      '@/context/AuthContext',
      '@/context/GymContext',
      '@/context/EquipmentContext',
      '@/context/WorkoutContext',
      // UI / page components to inspect when render fails
      '@/app/workout/[id]/components/CompactWorkoutHeader',
      '@/app/workout/[id]/components/QuickEditMode',
      '@/app/workout/[id]/components/ExerciseCard',
      '@/app/workout/[id]/components/SeriesTable',
      '@/app/workout/[id]/components/WorkoutModals',
      '@/app/workout/[id]/components/ExerciseList',
      '@/components/features/workout/SetExecutionModal',
      '@/components/features/exercises/ExerciseInfoPanel',
    ]
    modulesToInspect.forEach((m) => {
      try {
        const mod = require(m)
        // eslint-disable-next-line no-console
        console.error('[customRender Debug]', m, 'exports:', Object.keys(mod), 'types:', Object.keys(mod).map(k => typeof mod[k]))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[customRender Debug] require failed for', m, e && e.message)
      }
    })
    throw err
  }
}

// Re-export everything from RTL and expose the debug render implementation
export * from '@testing-library/react'
export { debugRender as render }

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
