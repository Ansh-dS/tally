import { cva, type VariantProps } from 'class-variance-authority'
export const textareaVariants = cva(
  [
    'w-full',
    'rounded-medium',
    'font-base',
    'text-body',
    'transition-all',
    'animate-duration-fast',
    'focus:outline-none',
    'border',
  ],
  {
    variants: {
      variant: {
        outline: [
          'border-border-default',
          'bg-surface-base',
          'text-fg-primary placeholder:text-fg-secondary',
          'focus:border-border-focused',
        ],
        filled: [
          'border-transparent',
          'bg-surface-sunken',
          'text-fg-primary placeholder:text-fg-secondary',
          'focus:bg-surface-base',
          'focus:border-border-focused',
        ],
      },
      size: {
        sm: ['px-s', 'py-xs', 'text-label'],
        md: ['px-m', 'py-s', 'text-body'],
        lg: ['px-xl', 'py-m', 'text-subheader'],
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  }
)
export type TextAreaVariantsType = VariantProps<typeof textareaVariants>
