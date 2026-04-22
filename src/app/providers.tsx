'use client'

// Build this file so we can add client component(UI) in server component(layout.tsx).
import { ThemeProvider } from 'components'
import React from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="tally" defaultMode="light">
      {children}
    </ThemeProvider>
  )
}
