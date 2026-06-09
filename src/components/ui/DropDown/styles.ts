import { cva, type VariantProps } from 'class-variance-authority'

export const dropdownMenuVariants = cva(
  [
    /* 1. The Floating Context (Law 1) */
    // New: Removed 'w-full'. In a Portal, w-full takes the entire browser width. Changed to 'w-max'.
    'absolute left-0 mt-2 z-popover flex flex-col w-max min-w-50',
    // New: Added shadow-modal and background tokens from our surface foundation.
    'rounded-medium border border-border-default bg-surface-base shadow-modal',

    /* 2. The Animation Engine (Law 3) */
    // New: Changed 'transition-all' to 'transition' to prevent top/left/width from animating.
    // New: Reduced duration to 150ms and removed hardcoded 'origin-top' (handled dynamically now).
    'transition duration-150 ease-out',
  ],
  {
    variants: {
      state: {
        // The Shutter Opens: Scales down slightly and fades in.
        open: 'scale-100 opacity-100 visible translate-y-0',
        // The Shutter Closes: Shrinks upward and vanishes.
        // New: Reduced translate-y-2 to translate-y-1 for less bouncy movement.
        closed:
          'scale-95 opacity-0 invisible -translate-y-1 pointer-events-none',
      },
    },
    defaultVariants: { state: 'closed' },
  }
)

export type DropdownMenuVariantsType = VariantProps<typeof dropdownMenuVariants>
