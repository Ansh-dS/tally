import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  [
    /* 1. Layout & Alignment */
    'inline-flex items-center justify-center',
    'rounded-pill border',
    'whitespace-nowrap select-none shrink-0',

    /* 2. Transitions */
    'transition-colors duration-fast ease-out',
  ],
  {
    variants: {
      size: {
        sm: 'px-s py-xs',
        md: 'px-m py-s',
      },
      color: {
        /* 3. SEMANTIC COLOR MAPPING 
           We use the -subtle backgrounds and a 20% border for that 
           premium "Alpine" hairline finish. */

        default: 'bg-surface-sunken border-border-default',

        success: 'bg-status-success-subtle border-status-success/20',

        warning: 'bg-status-warning-subtle border-status-warning/20',

        error: 'bg-status-danger-subtle border-status-danger/20',

        info: 'bg-status-info-subtle border-status-info/20',

        /*  Perfect for "New" or "Pro" tags in Tally */
        brand: 'bg-action-primary-subtle border-action-primary/20',
      },
    },
    defaultVariants: { size: 'sm', color: 'default' },
  }
)

export type BadgeVariantsType = VariantProps<typeof badgeVariants>
