import { cva, type VariantProps } from 'class-variance-authority'

/* how are we getting dashes:
   using border-dashed
*/
/**
 * THE LAW OF FROSTED OPTICS (15/12/20 Rule):
 * 1. THE BLUR (12px): Constant across themes. Scatters background for readability.
 * 2. THE TINT (15%): Background opacity. Low enough to see through, high enough to tint.
 * 3. THE EDGE (20%): Border opacity. Higher than tint to define the pane's boundary.
 */

export const fallbackVariants = cva(
  [
    'flex flex-col items-center justify-center text-center',
    'p-2xl rounded-large gap-m transition-all duration-normal',
  ],
  {
    variants: {
      variant: {
        // THE DEV ORIGINAL: Loud, clear, dashed red box.
        default:
          'bg-surface-sunken border-2 border-status-danger border-dashed m-l',

        // MINIMAL: For a quiet, integrated look.
        // Great for dashboards where you don't want to alarm the user.
        minimal: 'bg-surface-sunken border border-border-default shadow-inset',

        // GLASS: Premium translucent error state.
        // Best used over colorful backgrounds or video feeds.
        glass: [
          'bg-status-danger/15',
          'backdrop-blur-md',
          'border border-status-danger/20',
          'shadow-sm',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type FallbackVariantsType = VariantProps<typeof fallbackVariants>
