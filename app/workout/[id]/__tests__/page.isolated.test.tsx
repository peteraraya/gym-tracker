import React from 'react'
import { render } from '@/__tests__/helpers/testUtils'
import { WorkoutPageImpl } from '../page'

// Mock next/navigation hooks used by the page
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/context/NotificationContext', () => ({
  NotificationProvider: ({ children }) => children,
  useToast: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn() }),
  useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(false) }),
}))

// Minimal mocks for components used directly in the page
jest.mock('../components/ExerciseCard', () => ({ ExerciseCard: () => <div data-testid="exercise-card" /> }))
jest.mock('../components/QuickEditMode', () => ({ QuickEditMode: () => <div data-testid="quick-edit" /> }))
jest.mock('../components/WorkoutModals', () => ({ WorkoutModals: () => <div data-testid="workout-modals" /> }))

describe('WorkoutPage Isolated', () => {
  it('renders without providers', () => {
    render(<WorkoutPageImpl />)
  })
})
