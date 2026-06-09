import React, { forwardRef } from 'react'
import { statVariants, StatVariantsType } from './styles'
import { cn } from '../Utils/utils'
import { Text } from '../Text/Text'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type StatCustomProps = {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  helpText?: string
}

type CleanProps = Prettify<StatCustomProps & StatVariantsType>

export type StatProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

export const Stat = forwardRef<HTMLDivElement, StatProps>((props, ref) => {
  const {
    className,
    variant = 'default',
    align = 'left', // Defaulting to left-aligned for dashboard grids
    label,
    value,
    trend,
    trendValue,
    helpText,
    ...rest
  } = props

  // Mapping trend states to semantic color tokens
  const trendMapping = {
    up: { color: 'success' as const, icon: '↑' },
    down: { color: 'danger' as const, icon: '↓' },
    neutral: { color: 'secondary' as const, icon: '—' },
  }

  const currentTrend = trend ? trendMapping[trend] : null

  return (
    <div
      ref={ref}
      className={cn(
        statVariants({ align, variant }),
        'flex flex-col gap-xs',
        className
      )}
      {...rest}
    >
      {/*
       1. LABEL: The context provider. 
          High-contrast labels are distracting, so we use secondary color. 
      */}
      <Text
        variant="caption"
        color="secondary"
        className="font-medium tracking-widest uppercase"
      >
        {label}
      </Text>

      {/* 
      2. VALUE GROUP: We use items-baseline so the trend 'sits' after number.
         baseline: this align text better then items-align. 
      */}
      <div className="flex items-baseline gap-s">
        <Text variant="h2" className="font-bold leading-none">
          {value}
        </Text>

        {trendValue && currentTrend && (
          <Text
            variant="caption"
            color={currentTrend.color}
            className="flex items-center font-medium"
          >
            <span className="mr-0.5">{currentTrend.icon}</span>
            {trendValue}
          </Text>
        )}
      </div>

      {/* 3. HELP TEXT: We use 'disabled' color to make it very subtle so it doens't take place of main text wrt of visibility. */}
      {helpText && (
        <Text variant="caption" color="disabled" className="leading-tight mt-1">
          {helpText}
        </Text>
      )}
    </div>
  )
})

Stat.displayName = 'Stat'
