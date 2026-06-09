import React, { forwardRef } from 'react'
import { cn } from '../Utils/utils'

interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  className?: string
  as?: React.ElementType
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean /** If true, adds hover lift and pointer cursor */
}

/* 
forwardRef: make available the DOM Api to the child where the ref is pointing to. 
    the elemnets which it can make avaialbe to. 
BoxProps: input types.
*/
export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Component = 'div',
      className,
      children,
      elevation = 'none',
      interactive = false,
      ...rest
    },
    ref
  ) => {
    return (
      <Component
        {...rest}
        ref={ref}
        className={cn(
          // 1. BASE RULES
          // box-border ensures padding doesn't affect width
          // min-w-0 prevents flex items from overflowing
          'box-border min-w-0 transition-all duration-normal ease-out',
          'bg-surface-base border border-border-default rounded-medium',

          // 2. ELEVATION RULES
          // We map our props to the theme tokens we defined in global.css
          // These tokens now use our "Layered" or "Heavy Anchor" logic
          {
            'shadow-none': elevation === 'none',
            'shadow-raised': elevation === 'sm', // Maps to sm
            'shadow-overlay': elevation === 'md', // Maps to md
            'shadow-modal': elevation === 'lg', // Maps to lg
            'shadow-popout': elevation === 'xl', // Maps to xl
          },

          // 3. INTERACTIVE RULES
          // We use -translate-y to give the "Lift" effect.
          // We also bump the shadow on hover to simulate physical distance from the surface.
          interactive && [
            'cursor-pointer',
            'hover:-translate-y-1',
            'active:translate-y-0 active:scale-[0.98]', // Add this for "tactile" feedback
            // if initial elevation state is not 'none' then show the biggest shadow on hover.
            // this helps in showing that box is moving.
            elevation === 'none'
              ? 'hover:shadow-raised'
              : 'hover:shadow-popout',
          ],

          // 4. CUSTOM OVERRIDES
          className
        )}
      >
        {children}
      </Component>
    )
  }
)

Box.displayName = 'Box'
