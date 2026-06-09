import { cva, type VariantProps } from 'class-variance-authority'

/**
 *  Good way to do glasmorphism:
     LAW OF FROSTED OPTICS (15/12/20 Rule):
        1. THE BLUR (12px): Constant across themes. It scatters background noise for readability.
        2. THE TINT (15%): Background opacity. Needs to be low enough to see through, high enough to tint.
        3. THE EDGE (20%): Border opacity. Must be slightly higher than the tint to define the card's physical boundary.
    THEME ADAPTATION:
        - BLUR: Stays the same (12px) to maintain brand "lens" quality.
        - OPACITY: In Light themes, we usually bump Bg Opacity to 25% for visibility. 
 * In Dark themes, we drop it to 12-15%(hover) so diffusion happens and nobody get to know about it, just feel good. 
 */

// padding: to make inner elemnet better.
// margin: mostly we use to define the position of div.
export const statVariants = cva(
  'flex flex-col p-l rounded-large transition-all duration-normal gap-xs',
  {
    variants: {
      variant: {
        // The Original: Stable, classic dashboard look with a clear shadow.
        default: 'bg-surface-base border border-border-default shadow-raised',

        /* THE RIVERSIDE TREND: 
            Glassmorphism:
              1. bit of traspirancy so we can see through the card. 
              2. blur effect for the background of the card:
                  background: whatever the area it convers.
                  parent: whatever the area does it's have. 
            both the above things make it looks like a glass. 
        */
        glass:
          'bg-surface-base/15 backdrop-blur-md border border-border-default/50 shadow-sm hover:bg-surface-base/20',

        // THE TALLY TREND: Ghost/Minimalist.
        // No borders or shadows. It uses pure white space to define sections.
        ghost: 'bg-transparent border-transparent shadow-none px-0',
      },
      align: {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right',
      },
    },
    defaultVariants: {
      variant: 'default',
      align: 'left',
    },
  }
)

export type StatVariantsType = VariantProps<typeof statVariants>
