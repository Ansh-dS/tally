import { cva, type VariantProps } from 'class-variance-authority'
export const alertVariants = cva(
  [
    'flex items-start w-full',
    'p-m gap-m',
    'rounded-medium',
    'border font-base',
    'animate-duration-normal',
  ],
  {
    variants: {
      severity: {
        info: [
          'bg-surface-sunken',
          'text-status-info',
          'border-status-info/20',
        ],
        success: [
          'bg-status-success/10',
          'text-status-success',
          'border-status-success/20',
        ],
        warning: [
          'bg-status-warning/10',
          'text-status-warning',
          'border-status-warning/20',
        ],
        error: [
          'bg-status-danger/10',
          'text-status-danger',
          'border-status-danger/20',
        ],
      },
    },
    defaultVariants: { severity: 'info' },
  }
)
export type AlertVariantsType = VariantProps<typeof alertVariants>
