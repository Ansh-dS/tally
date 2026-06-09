import React from 'react'
import { selectVariants, SelectVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type SelectCustomProps = {
  options: { label: string; value: string | number }[]
}

type CleanProps = Prettify<SelectCustomProps & SelectVariantsType>

export type SelectProps = CleanProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>

export function Select(props: SelectProps): React.ReactElement {
  const { size, className, options, ...rest } = props
  return (
    <select className={cn(selectVariants({ size }), className)} {...rest}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
