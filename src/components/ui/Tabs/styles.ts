import { cva, type VariantProps } from 'class-variance-authority'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export const tabsListVariants = cva(
  /* Base: Hide scrollbars if they overflow on mobile */
  'scrollbar-hide',
  {
    variants: {
      variant: {
        /* Underline: Just a structural width, no background. */
        underline: 'w-full',

        /* Pill: Uses action-secondary-subtle for a muted track. */
        pill: 'bg-action-secondary-subtle rounded-large border border-border-default p-1',

        /* Glass: Frosted overlay track for media rich environments. */
        glass:
          'bg-surface-base/30 backdrop-blur-md rounded-large border border-white/20 shadow-sm p-1',
      },
      orientation: {
        horizontal: '',
        vertical: '',
      },
    },
    compoundVariants: [
      {
        variant: 'underline',
        orientation: 'horizontal',
        className: 'border-b border-border-default',
      },
      {
        variant: 'underline',
        orientation: 'vertical',
        className: 'border-r border-border-default',
      },
    ],
    defaultVariants: {
      variant: 'underline',
      orientation: 'horizontal',
    },
  }
)

export const tabsTriggerVariants = cva(
  /* Base: 3D preservation for the 'Pop' effect and fast transitions */
  '[transform-style:preserve-3d] transition-all duration-fast',
  {
    variants: {
      variant: {
        /* Underline: Transparent border until active */
        underline: 'border-transparent rounded-none',
        pill: 'rounded-medium',
        glass: 'rounded-medium',
      },
      orientation: {
        horizontal: '',
        vertical: '',
      },
      isActive: {
        true: '',
        /* Inactive hover states for Pill & Glass to match your global rules */
        false:
          'hover:bg-action-ghost-hover text-fg-secondary hover:text-fg-primary',
      },
    },
    compoundVariants: [
      /* --- UNDERLINE ACTIVE --- */
      {
        variant: 'underline',
        orientation: 'horizontal',
        isActive: true,
        className: 'border-b-2 border-action-primary text-fg-primary font-bold',
      },
      {
        variant: 'underline',
        orientation: 'vertical',
        isActive: true,
        className:
          'border-r-2 border-action-primary -mr-px text-fg-primary font-bold',
      },

      /* --- PILL ACTIVE (The 8%/12% Token Pop) --- */
      {
        variant: 'pill',
        isActive: true,
        className:
          'bg-action-primary-subtle text-fg-brand font-bold shadow-raised scale-[1.02] [transform:translateZ(4px)]',
      },

      /* --- GLASS ACTIVE (The Frosted Pop) --- */
      {
        variant: 'glass',
        isActive: true,
        className:
          'bg-surface-base/50 shadow-md scale-[1.02] [transform:translateZ(4px)] border border-white/20 text-fg-primary font-bold',
      },
    ],
  }
)

export type TabsListVariantsType = Prettify<
  VariantProps<typeof tabsListVariants>
>
export type TabsTriggerVariantsType = Prettify<
  VariantProps<typeof tabsTriggerVariants>
>
