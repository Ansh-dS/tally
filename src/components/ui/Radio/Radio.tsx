import React from 'react'
import { radioVariants, RadioVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type RadioCustomProps = {
  label?: string
}

type CleanProps = Prettify<RadioCustomProps & RadioVariantsType>

export type RadioProps = CleanProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'color'>

export function Radio(props: RadioProps): React.ReactElement {
  const { color, className, label, size, ...rest } = props
  return (
    <label className="flex items-center gap-s cursor-pointer">
      <input
        type="radio"
        className={cn(radioVariants({ color, size }), className)}
        {...rest}
      />
      {label && <span className="text-body text-fg-primary">{label}</span>}
    </label>
  )
}
