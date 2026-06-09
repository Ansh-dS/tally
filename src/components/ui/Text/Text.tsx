import React, { forwardRef } from 'react'
import { textVariants, TextVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type TextCustomProps = {
  /** Allows you to change the underlying HTML element (e.g., 'span', 'h1', 'label') */
  as?: React.ElementType
  required?: boolean
}

type CleanProps = Prettify<TextCustomProps & TextVariantsType>

export type TextProps = CleanProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'color'>

export const Text = forwardRef<HTMLElement, TextProps>((props, ref) => {
  const {
    as: Component = 'p', // Defaults to a paragraph tag
    variant,
    color,
    weight,
    align,
    className,
    required = false,
    children,
    ...rest
  } = props

  return (
    <Component
      ref={ref}
      className={cn(textVariants({ variant, color, weight, align }), className)}
      {...rest}
    >
      {children}
      {required && <span className="text-status-danger ml-xs">*</span>}
    </Component>
  )
})
Text.displayName = 'Text'
