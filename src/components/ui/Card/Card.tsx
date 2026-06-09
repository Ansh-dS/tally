import React, { forwardRef, createContext, useContext } from 'react'
import { cardVariants, CardVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'
import { Box } from '../Box/Box'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// CONTEXT: Syncs padding across all sub-components so they align perfectly
const CardContext = createContext<{
  padding?: 'none' | 'sm' | 'md' | 'lg' | null
}>({ padding: 'md' })

const getSharedPadding = (
  padding: 'none' | 'sm' | 'md' | 'lg' | undefined | null
) => {
  const p = padding ?? 'md'
  switch (p) {
    case 'sm':
      return 'px-m py-s gap-xs' // Dense (e.g., sidebars, tight widgets)
    case 'md':
      return 'px-xl py-l gap-s' // The Tally Sweet-spot (Dashboard standard)
    case 'lg':
      return 'px-3xl py-2xl gap-m' // The "Stripe" Premium look (Modals, Hero cards)
    case 'none':
      return 'p-0'
    default:
      return 'px-xl py-l gap-s'
  }
}

type CleanProps = Prettify<CardVariantsType>

type CardTextProps<T extends HTMLElement> = Prettify<
  Omit<React.HTMLAttributes<T>, 'color'>
>

export type CardProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

/*
 * Main Card Wrapper
 * Uses forwardRef so the parent can measure the card's height/width
 * for animations or intersection observers (useful for 'Riverside' scroll-fade effects).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    variant,
    elevation,
    padding = 'md', // Renamed from 'size' to match styles.ts
    className,
    children,
    ...rest
  } = props

  return (
    <CardContext.Provider value={{ padding }}>
      <Box
        ref={ref}
        // FIX: We force padding='none' on the shell so the inner components
        // (Header/Footer) can touch the absolute edges with their full-width borders.
        className={cn(
          cardVariants({ variant, elevation, padding: 'none' }),
          'flex flex-col',
          className
        )}
        {...rest}
      >
        {children}
      </Box>
    </CardContext.Provider>
  )
})
Card.displayName = 'Card'

/* =================================================================
     SUB-COMPONENTS: Ensuring Structural Integrity
   ================================================================= */

/* CardHeader: For titles and descriptions.
 * Adds a bottom border and subtle background to create visual separation.
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { padding } = useContext(CardContext)

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col border-b border-border-default bg-surface-sunken/5',
        getSharedPadding(padding),
        className
      )}
      {...props}
    />
  )
})
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle: Uses the Foundation Text component.
 * Dynamically scales the text variant based on the card's padding density.
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  CardTextProps<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { padding } = useContext(CardContext)

  const titleVariant =
    padding === 'lg' ? 'subheader' : padding === 'sm' ? 'label' : 'body'

  return (
    <Text
      as="h3"
      ref={ref as React.Ref<HTMLElement>}
      variant={titleVariant}
      weight="bold"
      className={cn('leading-heading', className)}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription: Uses the Foundation Text component.
 * Forces 'secondary' color for clear visual hierarchy.
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardTextProps<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { padding } = useContext(CardContext)

  const descVariant = padding === 'lg' ? 'body' : 'caption'

  return (
    <Text
      ref={ref as React.Ref<HTMLElement>}
      variant={descVariant}
      // FIX: Changed from "primary" to "secondary" to match the intended hierarchy
      color="secondary"
      className={className}
      {...props}
    />
  )
})
CardDescription.displayName = 'CardDescription'

/* CardContent: The main body of the card.
 * Uses 'flex-1' so it expands to fill the space if the card has a fixed height.
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => {
  const { padding } = useContext(CardContext)

  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 flex flex-col',
        getSharedPadding(padding),
        className
      )}
      {...rest}
    />
  )
})
CardContent.displayName = 'CardContent'

/**
 * CardLabel: Perfect for form fields or static key-value pairs inside CardContent.
 */
export const CardLabel = forwardRef<
  HTMLParagraphElement,
  CardTextProps<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { padding } = useContext(CardContext)

  const labelVariant = padding === 'lg' ? 'body' : 'label'

  return (
    <Text
      ref={ref as React.Ref<HTMLElement>}
      variant={labelVariant}
      weight="semibold"
      className={className}
      {...props}
    />
  )
})
CardLabel.displayName = 'CardLabel'

/* CardFooter: For buttons and actions.
 * Puts items at the bottom with a top border to seal the component.
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => {
  const { padding } = useContext(CardContext)

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end border-t border-border-default bg-surface-sunken/5',
        getSharedPadding(padding),
        className
      )}
      {...rest}
    />
  )
})
CardFooter.displayName = 'CardFooter'
