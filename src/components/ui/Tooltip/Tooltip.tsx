import React from 'react'
import { tooltipVariants, TooltipVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'
import { TextVariantsType } from '../Text/styles'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type TooltipCustomProps = {
  content: React.ReactNode
  children: React.ReactNode
  /** Added so developers can pass custom utility classes */
  className?: string
  /** Allows the tooltip to stay open for validation errors */
  forceVisible?: boolean
}

type CleanProps = Prettify<TooltipCustomProps & TooltipVariantsType>

export type TooltipProps = CleanProps

/*
invinsible: make the element invincible by default. 
group: enables state based styling of the child element when the parent is interacted with.
group-hover:visitble: these things applied to the child so it get visible when then state of parent changes.
*/
export function Tooltip(props: TooltipProps): React.ReactElement {
  const {
    position,
    variant = 'dark',
    size = 'md',
    className,
    content,
    children,
    forceVisible = false,
  } = props

  // Map tooltip size to the exact Text component variant
  const textVariant: TextVariantsType['variant'] =
    size === 'lg' ? 'label' : 'caption'

  // Map tooltip visual theme to the exact Text component color
  let textColor: TextVariantsType['color'] = 'primary'
  if (variant === 'dark' || variant === 'brand') {
    textColor = 'inverted'
  }

  // If there is no content, don't render the tooltip wrapper at all
  if (!content) return <>{children}</>

  return (
    /*parent*/
    <div className="relative inline-block group w-full">
      {children}
      {/* child */}
      <div
        className={cn(
          tooltipVariants({ position, variant, size }),

          /* 
          forceVisible: 
            if this is true then tooltip shows up.
            if not then tooltip only shows up on hover.
          */
          forceVisible
            ? 'visible opacity-100'
            : 'invisible opacity-0 group-hover:visible group-hover:opacity-100',
          className
        )}
      >
        {/* Delegating all font logic to the Foundation Text component */}
        <Text as="div" variant={textVariant} color={textColor} weight="medium">
          {content}
        </Text>
      </div>
    </div>
  )
}
