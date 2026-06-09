import React from 'react'
import { badgeVariants, BadgeVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type BadgeCustomProps = { startIcon?: React.ReactNode }

export function Badge(props: BadgeProps): React.ReactElement {
  // FIX : Added default values here so the JS logic doesn't break if props are omitted
  const {
    color = 'default',
    className,
    size = 'sm',
    startIcon,
    children,
    ...rest
  } = props

  // Map Badge size to Text variant
  const textVariant = size === 'sm' ? 'caption' : 'label'

  // FIX : Map the Badge color to the exact string the <Text> component expects
  const textColorMap: Record<
    string,
    'secondary' | 'success' | 'warning' | 'danger'
  > = {
    default: 'secondary',
    success: 'success',
    warning: 'warning',
    /** Translates 'error' to 'danger' */
    error: 'danger',
  }

  return (
    <span className={cn(badgeVariants({ color, size }), className)} {...rest}>
      {startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
      <Text
        as="span"
        variant={textVariant}
        weight="medium"
        color={color ? textColorMap[color] : 'secondary'}
        className="truncate " // Ensures long badge text doesn't break layout
      >
        {children}
      </Text>
    </span>
  )
}

type CleanProps = Prettify<BadgeCustomProps & BadgeVariantsType>

export type BadgeProps = CleanProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>
