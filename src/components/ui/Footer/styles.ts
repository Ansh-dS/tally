import { cva, type VariantProps } from 'class-variance-authority'
// if on smaller screen then left and right come vertically.
export const footerVariants = cva(
  [
    /* 
    why we didn't do 'flex-col sm:flex-row'?
      as after bundle flex col is coming afterwards after doing bundling:
        which leads flex-col more priority. 
        and flex-row didn't apply.
    */

    /* 1. Layout: Row by default, stack ONLY on mobile (< 640px) */
    'flex flex-row max-sm:flex-col items-center w-full shrink-0',

    /* 2. Spacing: 0 gap on desktop, gap ONLY on mobile */
    'sm:gap-0 max-sm:gap-m',

    /* 3. Geometry */
    'px-xl py-l transition-all duration-normal',
  ],
  {
    variants: {
      variant: {
        // We moved background and border colors into the variants
        // so you can add 'transparent' or 'ghost' footers later.
        default: 'bg-surface-base border-t border-border-default',
        transparent: 'bg-transparent border-t border-transparent',
        glass:
          'bg-surface-base/80 backdrop-blur-md border-t border-border-default/50',
      },
      // Staff Addition: Sticky footers are standard in SaaS dashboards
      sticky: {
        true: 'sticky bottom-0 z-nav',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      sticky: false,
    },
  }
)

export type FooterVariantsType = VariantProps<typeof footerVariants>
