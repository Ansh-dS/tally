import React, { forwardRef } from 'react'
import { spinnerVariants, type SpinnerVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SpinnerCustomProps = {
  /** Optional text for screen readers. Defaults to 'Loading...' */
  ariaLabel?: string
}

type CleanProps = Prettify<SpinnerCustomProps & SpinnerVariantsType>

export type SpinnerProps = CleanProps & React.HTMLAttributes<HTMLDivElement>

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (props, ref) => {
    const {
      className,
      variant,
      size,
      ariaLabel = 'Loading...',
      ...rest
    } = props

    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(spinnerVariants({ variant, size }), className)}
        {...rest}
      >
        {/*sr-only: This span is visually hidden but read by screen readers to announce the loading state.
         */}
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'
