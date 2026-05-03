import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { LocaleProvider } from '@/context/LocaleContext'
import { NotificationProvider } from '@/context/NotificationContext'

interface AllProvidersProps {
  children: ReactNode
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <LocaleProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </LocaleProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
