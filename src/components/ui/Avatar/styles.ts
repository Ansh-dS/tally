import { cva, type VariantProps } from 'class-variance-authority'
export const avatarVariants = cva(
  [
    'rounded-pill',
    'overflow-hidden',
    'bg-surface-sunken',
    'text-fg-secondary',
    'border',
    'border-border-default',
    // we need them, as a fallback contians text not image.
    'inline-grid', // inline makes it make as a span, gird converts it down to the cols
    'place-items-center', // combinartion of  1.align-items: center 2. justify-items: center, to be perfectly centered both horizontally and vertically.
    'flex-none', // tells browser don't expands this element. perfect when we add a big name there.
    /* Added base typography rules here for absolute consistency */
    'font-medium',
    'uppercase',
  ],
  {
    variants: {
      // since our global.css variables are defined using 'rem' so it's 'ok' to use 'rem' and not using defined variables in global.css.
      size: {
        /* SM: 32px container (2rem). 12px text (0.75rem). Area: 1x */
        sm: 'w-[2rem] h-[2rem] text-[0.75rem] tracking-widest',
        /* MD: 48px container (3rem). 18px text (1.125rem). Area: 2.25x */
        md: 'w-[3rem] h-[3rem] text-[1.125rem] tracking-wider',
        /* LG: 64px container (4rem). 24px text (1.5rem). Area: 4x */
        lg: 'w-[4rem] h-[4rem] text-[1.5rem] tracking-wide',
      },
    },
    defaultVariants: { size: 'md' },
  }
)
export type AvatarVariantsType = VariantProps<typeof avatarVariants>
