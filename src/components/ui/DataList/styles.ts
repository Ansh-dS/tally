import { cva, type VariantProps } from 'class-variance-authority'

export const dataListVariants = cva(
  'flex flex-col w-full transition-all duration-300',
  {
    variants: {
      variant: {
        // LAW: The "Tally" Classic - Clean, bordered, and organized
        default:
          'divide-y divide-border-default border border-border-default rounded-large bg-surface-base overflow-hidden shadow-sm',

        // LAW: The "Riverside" Modern - Borderless, floating items with subtle depth
        ghost: 'divide-y divide-border-default/50 bg-transparent',

        // LAW: The "Glass" Editor - High-end translucent look
        glass:
          'divide-y divide-white/10 border border-white/10 rounded-large bg-surface-base/40 backdrop-blur-md shadow-modal',

        // NEW: Inset style for dashboard cards
        inset:
          'p-s bg-surface-sunken rounded-large gap-s border border-border-default',
      },
      spacing: {
        compact: '',
        default: '',
        relaxed: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'default',
    },
  }
)

export type DataListVariantsType = VariantProps<typeof dataListVariants>
