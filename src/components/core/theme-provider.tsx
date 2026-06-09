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
// here useContex is to use the value of the things defined.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// changes the themeName and mode in locaStorage.
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
  const [theme, setThemeState] = useState(defaultTheme)
  const [mode, setModeState] = useState(defaultMode)

  // run only at mount
  // when user refreshes the page.
  useEffect(() => {
    const savedTheme = localStorage.getItem('data-theme-name')
    const savedMode = localStorage.getItem('data-mode')

    if (savedTheme) setThemeState(savedTheme)
    if (savedMode) setModeState(savedMode)
  }, [])

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

  // FIX: We replace the second useEffect with specialized setter functions.
  // This is much safer! It prevents React from accidentally writing the 'default'
  // values to the DOM before it reads the user's saved preferences on mount.

  const setTheme = useCallback((newTheme: string) => {
    applyWithTransition(() => {
      setThemeState(newTheme)
      // so we make changes in the html variable name not in the state variable values.
      document.documentElement.setAttribute('data-theme-name', newTheme)
      localStorage.setItem('data-theme-name', newTheme)
    })
  }, [])

  const setMode = useCallback((newMode: string) => {
    applyWithTransition(() => {
      setModeState(newMode)
      // so we make changes in the html variable name not in the state variable values.
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
