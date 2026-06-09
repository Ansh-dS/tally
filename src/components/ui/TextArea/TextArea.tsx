import React from 'react'
import { textareaVariants, TextAreaVariantsType } from './styles'
import { cn } from '../Utils/utils'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type TextAreaCustomProps = {
  error?: string | boolean
}

type CleanProps = Prettify<TextAreaCustomProps & TextAreaVariantsType>

export type TextAreaProps = CleanProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>

export function TextArea(props: TextAreaProps): React.ReactElement {
  const { variant, size, className, error, ...rest } = props
  return (
    <textarea
      className={cn(
        textareaVariants({ variant, size }),
        error && 'border-status-danger',
        className
      )}
      {...rest}
    />
  )
}
