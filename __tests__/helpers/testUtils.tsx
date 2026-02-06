import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

/**
 * Custom render function para incluir providers necesarios
 */

interface AllProvidersProps {
  children: ReactNode
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

/**
 * Helper para esperar a que desaparezca el loading
 */
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Helper para simular delay en async operations
 */
export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
