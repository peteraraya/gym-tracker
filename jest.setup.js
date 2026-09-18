import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Polyfill para window.scrollTo usado por algunos componentes en tests (jsdom)
if (typeof window !== 'undefined' && typeof window.scrollTo === 'undefined') {
  window.scrollTo = jest.fn()
}

// Enable database for integration tests by default
process.env.NEXT_PUBLIC_ENABLE_DATABASE = 'true'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Global mock for lucide-react icons to avoid forwardRef/object incompatibilities in tests
jest.mock('lucide-react', () => {
  const React = require('react')
  const make = (label) => (props) => React.createElement('span', props, label)
  return {
    __esModule: true,
    Timer: make('T'),
    ArrowRight: make('→'),
    Plus: make('+'),
    Check: make('✓'),
    X: make('X'),
    CheckCircle: make('O'),
    AlertCircle: make('!'),
    Info: make('i'),
    AlertTriangle: make('Δ'),
    PlusCircle: make('+'),
  }
})

// Mock framer-motion to simple passthroughs for testing
jest.mock('framer-motion', () => {
  const React = require('react')
  const Fragment = React.Fragment
  const motion = new Proxy({}, {
    get: (_target, prop) => {
      return (props) => React.createElement('div', props, props.children)
    }
  })
  return {
    AnimatePresence: ({ children }) => React.createElement(Fragment, null, children),
    motion,
  }
})

// Mock local re-export module of lucide icons to ensure all named imports
// used across the app resolve to simple functional components in tests.
jest.mock('@/components/icons/lucide', () => {
  const React = require('react')
  const make = (label) => (props) => React.createElement('span', props, label)
  return {
    __esModule: true,
    Clock: make('Clock'),
    Weight: make('Weight'),
    ListChecks: make('ListChecks'),
    Repeat: make('Repeat'),
    Settings: make('Settings'),
    Timer: make('Timer'),
    ArrowRight: make('ArrowRight'),
    Plus: make('Plus'),
    Check: make('Check'),
    X: make('X'),
    CheckCircle: make('CheckCircle'),
    AlertCircle: make('AlertCircle'),
    Info: make('Info'),
    AlertTriangle: make('AlertTriangle'),
    PlusCircle: make('PlusCircle'),
  }
})

jest.mock('@/lib/supabase/client', () => {
  // Helper to create a chainable query builder that resolves to `{ data, error }`
  function createQueryChain(defaultData = []) {
    const chain = {};
    const terminalResult = { data: defaultData, error: null };

    const noopChain = () => chain;

    chain.select = jest.fn(noopChain);
    chain.insert = jest.fn(noopChain);
    chain.upsert = jest.fn(noopChain);
    chain.update = jest.fn(noopChain);
    chain.delete = jest.fn(noopChain);
    chain.eq = jest.fn(noopChain);
    chain.order = jest.fn(noopChain);
    chain.limit = jest.fn(noopChain);
    chain.range = jest.fn(noopChain);

    // Methods that explicitly return a promise for single/maybeSingle
    chain.single = jest.fn(() => Promise.resolve({ data: null, error: null }));
    chain.maybeSingle = jest.fn(() => Promise.resolve({ data: null, error: null }));

    // Allow `await supabase.from(...).select(...)` to work by providing a `then`
    chain.then = function (onFulfilled) {
      return Promise.resolve(terminalResult).then(onFulfilled);
    };

    return chain;
  }

  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user', email: 'test@example.com' } }, error: null })),
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user', email: 'test@example.com' }, access_token: 'test-token' } }, error: null })),
        signInWithPassword: jest.fn(() => Promise.resolve({ data: null, error: null })),
        signOut: jest.fn(() => Promise.resolve({ data: null, error: null })),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => createQueryChain()),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
          remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      },
    })),
  };
})

// Mock NotificationContext for tests to avoid needing full provider UI
jest.mock('@/context/NotificationContext', () => {
  const showToast = jest.fn()
  const success = jest.fn()
  const error = jest.fn()
  const info = jest.fn()
  const warning = jest.fn()
  const confirm = jest.fn()
  return {
    NotificationProvider: ({ children }) => children,
    useToast: () => ({ showToast, success, error, info, warning }),
    useConfirm: () => ({ confirm }),
  }
})

// Provide safe defaults for GymContext and WorkoutContext so tests
// that require providers at render time won't receive unexpected objects.
jest.mock('@/context/GymContext', () => {
  const sessions = []
  return {
    GymProvider: ({ children }) => children,
    useGym: () => ({
      getRoutineById: (id) => undefined,
      addSession: jest.fn().mockResolvedValue({}),
      sessions,
      loading: false,
    }),
    useRoutines: () => ({ routines: [], loading: false, refreshRoutines: jest.fn() }),
    useSessions: () => ({ sessions, loading: false }),
  }
})

jest.mock('@/context/WorkoutContext', () => ({
  WorkoutProvider: ({ children }) => children,
  useWorkout: () => ({
    activeWorkout: null,
    isWorkoutActive: false,
    startWorkout: jest.fn(),
    updateWorkoutProgress: jest.fn(),
    updateModifiedRoutine: jest.fn().mockResolvedValue(undefined),
    clearRestState: jest.fn(),
    finishWorkout: jest.fn().mockResolvedValue(undefined),
    cancelWorkout: jest.fn().mockResolvedValue(undefined),
    skipExercise: jest.fn(),
    unskipExercise: jest.fn(),
  }),
}))

  // Compat: algunos tests usan la API de Vitest (`vi`) — mapear a Jest
  global.vi = {
    mock: jest.mock.bind(jest),
    fn: jest.fn.bind(jest),
    spyOn: jest.spyOn.bind(jest),
    clearAllMocks: jest.clearAllMocks.bind(jest),
    resetAllMocks: jest.resetAllMocks.bind(jest),
    restoreAllMocks: jest.restoreAllMocks ? jest.restoreAllMocks.bind(jest) : () => {},
  }

  // Provide a default render wrapper so components using NotificationContext
  // don't need to wrap themselves in tests. This mirrors app-level providers.
  const rtl = require('@testing-library/react')
  const originalRender = rtl.render
  try {
    const { NotificationProvider } = require('@/context/NotificationContext')

    function AllProviders({ children }) {
      return NotificationProvider ? (<NotificationProvider>{children}</NotificationProvider>) : children
    }

    rtl.render = (ui, options) => originalRender(ui, { wrapper: AllProviders, ...options })
  } catch (err) {
    // If the provider can't be required in setup (e.g., unresolved path), skip wrapper.
  }

  // Add Vitest-like matcher `toHaveBeenCalledOnce` used by some tests
  expect.extend({
    toHaveBeenCalledOnce(received) {
      const calls = received && received.mock ? received.mock.calls.length : 0
      const pass = calls === 1
      if (pass) {
        return { pass: true, message: () => `expected mock not to have been called once` }
      }
      return { pass: false, message: () => `expected mock to have been called once, but it was called ${calls} times` }
    }
  })

// Debug helper: trace React.createElement calls that use an object as the element type
try {
  const React = require('react')
  // Enable the heavy React.createElement debug wrapper only when explicitly requested.
  // This prevents instrumentation from causing excessive memory usage in large integration tests.
  if (process.env.DEBUG_REACT_CREATE_ELEMENT === '1' && React && React.createElement) {
    const _origCreate = React.createElement
    React.createElement = function (type, props, ...children) {
      const tType = typeof type

      // If it's a function component, wrap it to inspect its return value
      if (tType === 'function') {
        const originalFn = type
        const wrappedFn = function wrappedElementFn(...args) {
          try {
            const res = originalFn.apply(this, args)
            if (res !== null && typeof res === 'object' && !React.isValidElement(res)) {
              // eslint-disable-next-line no-console
              console.error('[React Debug] Component returned non-element value:', { name: originalFn.name, value: res })
            }
            return res
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[React Debug] Component threw during render:', originalFn.name, e && e.message)
            throw e
          }
        }
        return _origCreate.call(this, wrappedFn, props, ...children)
      }

      if (tType !== 'string' && tType !== 'function' && tType !== 'symbol') {
        // eslint-disable-next-line no-console
        console.error('[React Debug] createElement received non-standard type:', { type, typeof: tType })
        try {
          if (type && typeof type === 'object') {
            try {
              // eslint-disable-next-line no-console
              console.error('[React Debug] object keys:', Object.keys(type))
            } catch (e) {}
            if (type.render) {
              // eslint-disable-next-line no-console
              console.error('[React Debug] has render function')
            }
          }
          const err = new Error()
          const stack = err.stack || ''
          const lines = stack.split('\n')
          const appLine = lines.find(l => l.includes('/app/') || l.includes('\\app\\'))
          if (appLine) {
            // eslint-disable-next-line no-console
            console.error('[React Debug] first app stack line:', appLine.trim())
          } else {
            // eslint-disable-next-line no-console
            console.error('[React Debug] full stack (no app path found):')
            // eslint-disable-next-line no-console
            console.error(stack)
          }
        } catch (e) {}
        // Don't throw here; allow React to produce its normal error message.
        return _origCreate.call(this, type, props, ...children)
      }
      return _origCreate.call(this, type, props, ...children)
    }
  }
} catch (err) {
  // ignore in non-test envs
}

// Intercept console.error to add stack when React reports invalid element types
{
  const _origErr = console.error.bind(console)
  console.error = (...args) => {
    try {
      const first = args[0]
      if (typeof first === 'string' && first.includes('Element type is invalid')) {
        _origErr('[React Invalid Element] stack:')
        _origErr(new Error().stack)
      }
    } catch (e) {}
    return _origErr(...args)
  }
}
