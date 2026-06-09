import { cva, type VariantProps } from 'class-variance-authority'
export const radioVariants = cva(
  [
    'rounded-pill',
    'border border-border-default',
    'bg-surface-base',
    'checked:bg-action-primary',
    'checked:border-action-primary',
    'cursor-pointer',
    'transition-all',
    'animate-duration-fast',
    'focus:ring-2 focus:ring-border-focused focus:outline-none',
  ],
  {
    variants: {
      size: { sm: 'w-4 h-4', md: 'w-5 h-5' },
      color: {
        primary: 'text-action-primary',
        secondary: 'text-action-secondary',
      },
    },
    defaultVariants: { size: 'md', color: 'primary' },
  }
)
export type RadioVariantsType = VariantProps<typeof radioVariants>
