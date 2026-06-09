import { cva, type VariantProps } from 'class-variance-authority'
export const inputVariants = cva(
  [
    'w-full',
    'rounded-medium',
    'font-base',
    'text-body',
    'transition-all',
    'animate-duration-fast',
    'focus:outline-none',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
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
        sm: ['px-s', 'py-xs', 'text-label'], // 2:1 Ratio
        md: ['px-m', 'py-s', 'text-body'], // 2:1 Ratio
        lg: ['px-xl', 'py-m', 'text-subheader'],
      },
    },
    defaultVariants: { variant: 'outline', size: 'md' },
  }
)
export type InputVariantsType = VariantProps<typeof inputVariants>
