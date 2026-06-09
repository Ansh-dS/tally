import React from 'react'
import { switchVariants, SwitchVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SwitchCustomProps = {
  checked?: boolean
  label?: string
}

type CleanProps = Prettify<SwitchCustomProps & SwitchVariantsType>

export type SwitchProps = CleanProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'color'>
export function Switch(props: SwitchProps): React.ReactElement {
  const { size, className, checked, label, ...rest } = props
  return (
    <label className="flex items-center gap-m cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        className={cn(
          switchVariants({ size }),
          checked ? 'bg-action-primary' : 'bg-surface-sunken',
          className
        )}
        {...rest}
      >
        <span
          className={cn(
            'bg-white rounded-full transition-transform',
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
            checked ? 'translate-x-full' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-body text-fg-primary">{label}</span>}
    </label>
  )
}
