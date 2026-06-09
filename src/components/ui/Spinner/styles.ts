import { cva, type VariantProps } from 'class-variance-authority'

export const spinnerVariants = cva(
  /*
    a spinner is a square whose boder have two colors and no backgroud color: 
      top: foreground color
      border: so it relates with the surface color but bit of different. 
    then we use animate to run that 'top'.
  */
  'inline-block shrink-0 rounded-full',
  {
    variants: {
      variant: {
        /*
          THE TALLY TREND: 
            1. uses surface colors for the track.
            2. foreground color: for the moving head.
            3. border-t-*: border-top
          
          how we can form a glare: 
            1. provide shadows only in z axis.
          */

        tally:
          'border-2 border-surface-raised border-t-fg-primary animate-spin',

        /* THE RIVERSIDE TREND:glowing.
              1.Transparent track
              2. primary color head.
              3. a custom drop-shadow for that 'LED/glow' look.

          why do we use drop-shadow: 
            applies the shadow to the visible part:
              a. which came after rendering/painting the screen. 
              b. in this case all the boundary of div gets gets disguise because background color and boundary color is same. 
                  i. so only visible part top boundary. 
        */
        riverside:
          'border-2 border-transparent border-t-action-primary animate-spin drop-shadow-[0_0_8px_var(--colors-primary-500)]',

        /* RIVERSIDE: The "Recording" Pulse. 
            Great for the top-right corner of our header when a session is active.
        */
        recording:
          'bg-status-danger animate-pulse shadow-[0_0_12px_var(--colors-state-error)]',
      },
      /*
        a. for smaller elements we define the width and height. 
        b. but for larger element we mostly use flex. 
      */
      size: {
        xs: 'w-s h-s border-[1px]',
        sm: 'w-l h-l border-[1.5px]', // 1rem (16px) - Standard button size
        md: 'w-xl h-xl border-2', // 1.5rem (24px) - Standalone inline
        lg: 'w-2xl h-2xl border-3', // 2rem (32px) - Section loading
      },
    },
    defaultVariants: {
      variant: 'tally',
      size: 'sm',
    },
  }
)

export type SpinnerVariantsType = VariantProps<typeof spinnerVariants>
