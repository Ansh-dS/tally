import React, { forwardRef, createContext, useContext, useState } from 'react'
import {
  tabsListVariants,
  tabsTriggerVariants,
  TabsListVariantsType,
} from './styles'
import { cn } from '../Utils/utils'
// STAFF FIX: Importing your foundation primitives!
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Button } from '../Button/Button'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                    */
/* -------------------------------------------------------------------------- */
type TabsContextValue = {
  activeValue: string
  onValueChange: (value: string) => void
  variant?: TabsListVariantsType['variant']
  orientation?: TabsListVariantsType['orientation']
  size?: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context)
    throw new Error('Tabs components must be used within a <Tabs> provider.')
  return context
}

/* -------------------------------------------------------------------------- */
/* ROOT CONTAINER (<Tabs>)                                                    */
/* -------------------------------------------------------------------------- */
type TabsVariantProps = {
  variant?: TabsListVariantsType['variant']
  orientation?: TabsListVariantsType['orientation']
  size?: 'sm' | 'md' | 'lg'
}

export type TabsProps = Prettify<
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
  } & TabsVariantProps
>

export const Tabs = forwardRef<HTMLDivElement, TabsProps>((props, ref) => {
  const {
    defaultValue,
    value,
    onValueChange,
    variant = 'underline',
    orientation = 'horizontal',
    size = 'md',
    className,
    children,
    ...rest
  } = props

  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const activeValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        onValueChange: handleValueChange,
        variant,
        orientation,
        size,
      }}
    >
      {/* STAFF FIX: Using Box for the root container */}
      <Box
        as="div"
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          orientation === 'vertical' ? 'flex gap-l' : 'block',
          className
        )}
        {...rest}
      >
        {children}
      </Box>
    </TabsContext.Provider>
  )
})
Tabs.displayName = 'Tabs'

/* -------------------------------------------------------------------------- */
/* TABS LIST (<TabsList>) - The Track                                         */
/* -------------------------------------------------------------------------- */
export const TabsList = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  // STAFF FIX: Explicitly destructure 'children' from props
  const { className, children, ...rest } = props
  const { variant, orientation } = useTabsContext()
  const resolvedOrientation = orientation ?? 'horizontal'

  return (
    // We use Stack as the layout engine for the tab triggers
    <Stack
      as="div"
      ref={ref}
      role="tablist"
      aria-orientation={resolvedOrientation}
      direction={resolvedOrientation}
      /** * Gap Logic:
       * 'underline' needs 'none' so the active borders create a continuous line.
       * 'pill' and 'glass' need 'sm' (8px) so the 3D buttons don't touch each other.
       */
      gap={variant === 'underline' ? 'none' : 'sm'}
      className={cn(
        tabsListVariants({ variant, orientation: resolvedOrientation }),
        className
      )}
      {...rest}
    >
      {/* CRITICAL FIX: 
          This is where your <TabsTrigger /> components will live. 
      */}
      {children}
    </Stack>
  )
})
TabsList.displayName = 'TabsList'

/* -------------------------------------------------------------------------- */
/* TABS TRIGGER (<TabsTrigger>) - The Button                                  */
/* -------------------------------------------------------------------------- */
export type TabsTriggerProps = Prettify<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
    value: string
    startIcon?: React.ReactNode // We can now pass icons directly because Button supports it!
  }
>

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (props, ref) => {
    const { className, value, disabled, children, startIcon, ...rest } = props
    const { activeValue, onValueChange, variant, orientation, size } =
      useTabsContext()

    const isActive = activeValue === value
    const triggerColor: 'primary' | 'secondary' = isActive
      ? 'primary'
      : 'secondary'

    return (
      // STAFF FIX: Using your polymorphic Button!
      <Button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => onValueChange(value)}
        // 1. Base variant is ghost so it inherits your standard hover rules
        variant="ghost"
        // 2. Inherits the size frongm the parent Tabs context
        size={size}
        // 3. Dynamic color mapping! No CSS text colors needed.
        color={triggerColor}
        startIcon={startIcon}
        className={cn(
          // We override the default ghost button rounded corners if we are using the underline variant
          variant === 'underline' && 'rounded-none',
          // Apply the specific tab modifiers (like the 3D Pop)
          tabsTriggerVariants({ variant, orientation, isActive }),
          className
        )}
        {...rest}
      >
        {children}
      </Button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

/* -------------------------------------------------------------------------- */
/* TABS CONTENT (<TabsContent>) - The Panel                                   */
/* -------------------------------------------------------------------------- */
export type TabsContentProps = Prettify<
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  (props, ref) => {
    const { className, value, children, ...rest } = props
    const { activeValue } = useTabsContext()

    if (activeValue !== value) return null

    return (
      // STAFF FIX: Using Box for the panel container
      <Box
        as="div"
        ref={ref as React.Ref<HTMLElement>}
        role="tabpanel"
        tabIndex={0}
        className={cn(
          'mt-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused',
          className
        )}
        {...rest}
      >
        {children}
      </Box>
    )
  }
)
TabsContent.displayName = 'TabsContent'
