import { cva, type VariantProps } from 'class-variance-authority'
export const selectVariants = cva(
  [
    'w-full',
    'rounded-medium',
    'font-base',
    'text-body',
    'border border-border-default',
    'bg-surface-base',
    'focus:outline-none',
    'focus:border-border-focused',
    'transition-all',
    'animate-duration-fast',
  ],
  {
    variants: {
      size: {
        sm: ['px-s', 'py-xs', 'text-label'], // 2:1 Ratio
        md: ['px-m', 'py-s', 'text-body'], // 2:1 Ratio
        lg: ['px-xl', 'py-m', 'text-subheader'],
      },
    },
    defaultVariants: { size: 'md' },
  }
)
export type SelectVariantsType = VariantProps<typeof selectVariants>
