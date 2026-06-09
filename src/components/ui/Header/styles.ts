import { cva, type VariantProps } from 'class-variance-authority'
/*
Rules to fix header: 
  1. fix the height of header and use stikcy.
  2. left the middle be 'flex-1' and left/right as 'w-auto'. 
  3. use item-center for vertical allignment. 
*/
// flex: makes the children use that much space which is need by it's content.
export const headerVariants = cva(
  [
    /* 
    Changes:
      1. Slimmer header: Swapped py-m for py-s. 
      2. text-fg-base: so any un-styled text inherits the primary foreground color. 
    */
    'flex flex-row items-center px-2xl h-14 w-full shrink-0 sticky top-0 box-border text-fg-base',
    'z-nav transition-all animate-duration-fast ease-out',
  ],
  {
    variants: {
      variant: {
        // The Workhorse: Solid background, subtle border, and shadow to seal the scrolling content beneath.
        default: 'bg-surface-base border-b border-border-default shadow-sm',

        // The Hero: Used at the absolute top of a page before scrolling begins.
        transparent: 'bg-transparent border-transparent shadow-none',

        // Floating Capsule
        // We use 'top-3' to give it breathing room from the ceiling.
        // backdrop-blur: blurs the background of component.
        // mx-auto: provides exactly equal margins to both the left and right sides
        floating: [
          'top-3 mx-auto w-[95%] max-w-6xl rounded-full',
          'bg-surface-base/80 border border-border-default/50 shadow-lg',
          'px-xl', // Slightly tighter horizontal padding for the pill shape
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type HeaderVariantsType = VariantProps<typeof headerVariants>
