'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'
import {ToastProvider} from '@primitives/ToastProvider/ToastProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="tally" defaultMode="light">
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}