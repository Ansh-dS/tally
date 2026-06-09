import { cva, type VariantProps } from 'class-variance-authority'

/**
 * 1. Law 1 (The Measure): Scannable text widths. (no too wide widths)
 * 2. Law 2 (Vertical Rhythm): Proportional Gap/Padding pairs.
 * 3. Law 3 (Proportion): Fluid internal element scaling.
 * 4. law 4 (icon): the icon's job is to act as a "hero image"
 */

export const emptyStateVariants = cva(
  [
    // LAW 1 APPLIED: Establishes the vertical 'Anchor' line.
    'flex flex-col items-center justify-center',
    'text-center transition-all duration-normal',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-surface-base border border-border-default rounded-large shadow-sm',
        minimal: 'bg-transparent border-transparent p-0',
        dashed:
          'bg-surface-sunken border-2 border-dashed border-border-default rounded-large',
        // LAW 3 APPLIED: Glassmorphism (15/12/20 Physics)
        glass: [
          'bg-surface-base/15',
          'backdrop-blur-md',
          'border border-border-default/20',
          'rounded-large shadow-overlay',
        ],
      },
      spacing: {
        // LAW 3 & 4 APPLIED: Synchronized container volume.
        compact: 'gap-xs p-m',
        default: 'gap-m p-2xl',
        spacious: 'gap-xl p-3xl',
      },
      fullWidth: {
        //Law 2
        true: 'w-full',
        false: 'w-fit mx-auto', // STAFF FIX: 'w-fit' hugs the exact width of the single-line content.
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'default',
      fullWidth: true,
    },
  }
)

export type EmptyStateVariantsType = VariantProps<typeof emptyStateVariants>
