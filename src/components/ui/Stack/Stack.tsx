/*
1. Use: to arrange elements horzontally or vertically in a line with eaqual gap. 
*/
import React, { forwardRef } from 'react'
import { stackVariants, type StackVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

//  Extend React.HTMLAttributes to allow standard props (id, onClick, aria-*, etc.)
type StackCustomProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

type CleanProps = Prettify<StackCustomProps & StackVariantsType>

export type StackProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

// Wrap the component in forwardRef
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      as: Component = 'div',
      direction,
      gap,
      align,
      justify,
      className,
      ...rest // Collect the rest of the standard HTML props
    },
    ref // Receive the forwarded ref
  ) => {
    return (
      <Component
        ref={ref} // Attach the ref to the DOM element
        className={cn(
          stackVariants({ direction, gap, align, justify }),
          className
        )}
        {...rest} // Spread the remaining standard props
      >
        {children}
      </Component>
    )
  }
)

// Add a displayName for better React DevTools debugging
Stack.displayName = 'Stack'
