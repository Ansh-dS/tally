import React from 'react'
import { checkboxVariants, CheckboxVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type CheckboxCustomProps = {
  label?: string
}

type CleanProps = Prettify<CheckboxCustomProps & CheckboxVariantsType>

export type CheckboxProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color' | 'size'>

export function Checkbox(props: CheckboxProps): React.ReactElement {
  const { color, size, className, label, ...rest } = props
  return (
    <label className="flex items-center gap-s cursor-pointer">
      <input
        type="checkbox"
        className={cn(checkboxVariants({ color, size }), className)}
        {...rest}
      />
      {label && <span className="text-body text-fg-primary">{label}</span>}
    </label>
  )
}
