import React from 'react'
import { alertVariants, AlertVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type AlertCustomProps = {
  severity?: 'info' | 'success' | 'warning' | 'error'
  onClose?: () => void
  dismissible?: boolean
  icon?: React.ReactNode
}

type CleanProps = Prettify<AlertCustomProps & AlertVariantsType>

export type AlertProps = CleanProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>

export function Alert(props: AlertProps): React.ReactElement {
  const { severity, onClose, dismissible, icon, className, children, ...rest } =
    props
  return (
    <div
      className={cn(alertVariants({ severity }), className)}
      role="alert"
      {...rest}
    >
      {icon && <span className="shrink-0 mt-xs">{icon}</span>}
      <div className="flex-1 text-body leading-body">{children}</div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  )
}
