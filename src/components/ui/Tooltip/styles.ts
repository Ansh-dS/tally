import { cva, type VariantProps } from 'class-variance-authority'

/*tooltip: it is nothing but a component over the other where it is first visible.*/
export const tooltipVariants = cva(
  [
    // Core Layout
    'absolute',
    'z-50',
    'rounded-small',
    'whitespace-nowrap',
    'animate-duration-fast',
  ],
  {
    variants: {
      position: {
        // Horizontal Centering for Top/Bottom
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-s',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-s',
        // Vertical Centering for Left/Right
        left: 'right-full top-1/2 -translate-y-1/2 mr-s',
        right: 'left-full top-1/2 -translate-y-1/2 ml-s',
      },
      // Visual Styles
      variant: {
        dark: 'bg-fg-primary', // original design
        light: 'bg-surface-base border border-border-default shadow-sm',
        brand: 'bg-action-primary shadow-md', // Great for onboarding/tours
        // Perfect for Riverside's sleek media UI or Tally's clean aesthetic
        glass:
          'bg-surface-base/70 backdrop-blur-md border border-white/20 shadow-lg',
      },
      // Sizing Scale
      size: {
        sm: 'px-xs py-2xs',
        md: 'px-s py-xs',
        lg: 'px-m py-s',
      },
    },
    defaultVariants: {
      position: 'top',
      variant: 'dark',
      size: 'md',
    },
  }
)

export type TooltipVariantsType = VariantProps<typeof tooltipVariants>
