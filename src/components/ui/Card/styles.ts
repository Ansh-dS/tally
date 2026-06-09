import { cva, type VariantProps } from 'class-variance-authority'

// when we can able to create more space:
// by increasing padding b/w boders and internal element.
// if you want more height in x axix then you need more ratio of x over y in padding and vice a versa.
/**
 * THE 3 LAWS OF CARD GEOMETRY:
 * 1. Law of Depth: Elevation should follow the stacking order (sm = flat, lg = floating modal).
 * 2. Law of Breath: Padding must follow the Geometric Scale (1x, 2x, 4x) to maintain rhythm.
 * 3. Law of Interaction: Interactive cards must provide physical feedback (Scale + Shadow Shift).
 */

export const cardVariants = cva(
  // Base: Using will-change-transform for smooth 'Interactive' scaling performance
  'rounded-medium bg-surface-base transition-all duration-normal ease-out overflow-hidden',
  {
    variants: {
      variant: {
        // TALLY GOAL: The "Classic Dashboard"
        elevated: 'border border-transparent shadow-raised',

        // RIVERSIDE GOAL: The "Settings Panel"
        outlined: 'border border-border-default bg-transparent',

        // NEW: The "Riverside Glass" (High-end Translucency)
        // Uses backdrop-blur and a semi-transparent border to blend with backgrounds
        glass:
          'bg-surface-base/40 backdrop-blur-md border border-white/10 shadow-modal',

        // NEW: The "Editor Sunken" (Internal Wells)
        // Perfect for the background behind a form preview to give it "nesting" depth
        sunken: 'bg-surface-sunken border border-border-default shadow-inner',

        // NEW: The "Action Card" (Hover-heavy)
        // Lifts toward the user on hover
        interactive: [
          'cursor-pointer border-border-default shadow-sm',
          'hover:shadow-overlay hover:border-border-strong hover:-translate-y-1',
          'active:scale-[0.98] active:shadow-raised',
        ],
      },

      padding: {
        /* GEOMETRIC PADDING SCALE (1:2:4 Ratio) */
        none: 'p-0',
        sm: 'p-s', // 8px (Tight - for compact widgets)
        md: 'p-l', // 16px (Standard - for dashboard content)
        lg: 'p-2xl', // 32px (Premium - for Hero/Landing sections)
      },

      elevation: {
        none: 'shadow-none',
        sm: 'shadow-raised',
        md: 'shadow-overlay',
        lg: 'shadow-modal',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      padding: 'md',
      elevation: 'sm',
    },
  }
)

export type CardVariantsType = VariantProps<typeof cardVariants>
