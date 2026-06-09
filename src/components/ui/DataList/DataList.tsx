'use client'

import React, { forwardRef, createContext, useContext } from 'react'
import { dataListVariants, DataListVariantsType } from './styles'
import { cn } from '../Utils/utils'

/* ------------------------------------------------------------------------- */
/* CONTEXT (New: Architecture for Internal Rhythm)                           */
/* ------------------------------------------------------------------------- */

type DataListContextProps = {
  spacing: DataListVariantsType['spacing']
  variant: DataListVariantsType['variant']
}

const DataListContext = createContext<DataListContextProps>({
  spacing: 'default',
  variant: 'default',
})

/* ------------------------------------------------------------------------- */
/* COMPONENTS                                                                */
/* ------------------------------------------------------------------------- */

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type CleanDataListProps = Prettify<DataListVariantsType>
export type DataListProps = CleanDataListProps &
  React.HTMLAttributes<HTMLDivElement>

export const DataList = forwardRef<HTMLDivElement, DataListProps>(
  (props, ref) => {
    const {
      className,
      spacing = 'default',
      variant = 'default',
      children,
      ...rest
    } = props

    return (
      <DataListContext.Provider value={{ spacing, variant }}>
        <div
          ref={ref}
          role="list"
          className={cn(dataListVariants({ spacing, variant }), className)}
          {...rest}
        >
          {children}
        </div>
      </DataListContext.Provider>
    )
  }
)

DataList.displayName = 'DataList'

/* ------------------------------------------------------------------------- */
/* ITEM COMPONENT                                                            */
/* ------------------------------------------------------------------------- */

type DataListItemCustomProps = {
  interactive?: boolean
  /** New: Allows highlighting a specific row (e.g., a newly created form) */
  selected?: boolean
}

export type DataListItemProps = Prettify<DataListItemCustomProps> &
  React.HTMLAttributes<HTMLDivElement>

export const DataListItem = forwardRef<HTMLDivElement, DataListItemProps>(
  (props, ref) => {
    const {
      className,
      interactive = false,
      selected = false,
      children,
      ...rest
    } = props

    // New: Consume parent styles to adjust internal padding
    const { spacing, variant } = useContext(DataListContext)

    return (
      <div
        ref={ref}
        role="listitem"
        className={cn(
          // BASE STYLES
          'flex items-center justify-between transition-all animate-duration-normal outline-none',

          // NEW: SPACING LOGIC (Dynamic Padding based on parent)
          spacing === 'compact' && 'p-s min-h-12',
          spacing === 'default' && 'p-m min-h-16',
          spacing === 'relaxed' && 'p-l min-h-20',

          // NEW: VARIANT ADAPTATION
          variant === 'inset' && 'rounded-medium border border-transparent',
          variant === 'inset' &&
            interactive &&
            'hover:border-border-default hover:shadow-sm',

          // INTERACTIVE STATES
          interactive &&
            'cursor-pointer hover:bg-surface-sunken active:scale-[0.995]',
          selected &&
            'bg-action-primary-subtle border-l-4 border-l-action-primary',

          className
        )}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

DataListItem.displayName = 'DataListItem'
