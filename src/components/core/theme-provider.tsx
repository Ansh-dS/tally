'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

// state variable made using useState have the same names.
interface ThemeContextType {
  theme: string
  mode: string
  setTheme: (theme: string) => void
  setMode: (mode: string) => void
}

// createContext is to avoid the prop drilling.
// here useContext is to use the value of the things defined.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// changes the themeName and mode in localStorage.
// takes a children and return it after executing the above code and broadcasting happens
export const ThemeProvider = ({
  children,
  defaultTheme = 'tally',
  defaultMode = 'light',
}: {
  children: React.ReactNode
  defaultTheme?: string
  defaultMode?: string
}) => {
  // 1. MUST match the server exactly to pass hydration. No localStorage here!
  const [theme, setThemeState] = useState(defaultTheme)
  const [mode, setModeState] = useState(defaultMode)

  // run only at mount
  // when user refreshes the page, sync with the browser safely AFTER hydration finishes.
  useEffect(() => {
    const savedTheme = localStorage.getItem('data-theme-name')
    const savedMode = localStorage.getItem('data-mode')

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme-name', savedTheme)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme-name', defaultTheme)
    }

    if (savedMode) {
      document.documentElement.setAttribute('data-mode', savedMode)

      setModeState(savedMode)
    } else {
      document.documentElement.setAttribute('data-mode', defaultMode)
    }
  }, [defaultTheme, defaultMode])

  /**
   * INTERNAL HELPER: applyWithTransition
   * This handles the buttery-smooth crossfade.
   * It fulfills the goal of high-performance interactions with zero dependencies.
   */
  const applyWithTransition = (cb: () => void) => {
    if (!document.startViewTransition) {
      cb()
      return
    }
    document.startViewTransition(cb)
  }

  // specialized setter functions.
  // so we make changes in the html variable name, state variable values, and localStorage.
  const setTheme = useCallback((newTheme: string) => {
    applyWithTransition(() => {
      setThemeState(newTheme)
      document.documentElement.setAttribute('data-theme-name', newTheme)
      localStorage.setItem('data-theme-name', newTheme)
    })
  }, [])

  const setMode = useCallback((newMode: string) => {
    applyWithTransition(() => {
      setModeState(newMode)
      document.documentElement.setAttribute('data-mode', newMode)
      localStorage.setItem('data-mode', newMode)
    })
  }, [])

  // themeContext.Provider broadcast the values to all the other components.
  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom Hook: so developer can able to fetch the broadcasted value.
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
