import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  [
    /* 1. Layout & Alignment */
    // select-none: prevents text selection UI from appearing on clicks.
    // flex items-center: vertical and horizontal centering for text/icons/spinners.
    // shrink-0: prevents the button from squishing in tight flex headers.
    'inline-flex items-center justify-center whitespace-nowrap select-none',
    'rounded-medium border shrink-0',

    /* 2. Professional Transitions */
    // We moved font-weight and tracking to the <Text> component.
    // transition-all: ensures background and transform (active:scale) feel smooth.
    'transition-all duration-fast ease-out border-transparent',

    /* 3. Interaction State Rules */
    // opacity-50: standard "disabled" look across Tally/Riverside.
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-action-primary text-fg-inverted shadow-raised',
          'hover:bg-action-primary-hover',
          'active:bg-action-primary-pressed active:shadow-md',
        ],

        secondary: [
          'bg-action-secondary text-fg-brand border-border-default shadow-sm',
          'hover:bg-action-secondary-hover hover:border-border-strong hover:shadow-sm',
          'active:bg-action-secondary-pressed active:shadow-none',
        ],

        outline: [
          'bg-transparent border-border-default text-fg-primary shadow-none',
          'hover:bg-surface-sunken hover:border-border-strong hover:shadow-sm',
          'active:bg-surface-raised',
        ],

        destructive: [
          'bg-status-danger text-fg-inverted shadow-raised',
          'hover:opacity-90',
          'active:bg-status-danger shadow-none',
        ],

        ghost: [
          'bg-transparent border-transparent text-fg-primary shadow-none',
          'hover:bg-surface-sunken',
          'active:bg-surface-raised',
        ],

        // GLASS VARIANT
        glass: [
          // BASE: The "Frosted" Foundation
          // Uses surface-base with opacity for the glass effect
          'bg-surface-base/30 backdrop-blur-md border-white/20 text-fg-primary shadow-modal',

          // HOVER: The "Brand Hint"
          // Instead of just more white, we use your re-added primaryHover token!
          'hover:bg-action-primary-hover-subtle hover:border-action-primary/30',

          // ACTIVE: The "Brand Selection"
          // We use your primarySubtle here to give it a solid "Selected" feel
          'active:bg-action-primary-subtle active:scale-[0.98] active:border-action-primary/40',
        ],
      },
      /* 4. Geometric Scaling (2:1 Ratio)
          We removed 'text-*' classes because the <Text> component now 
          dynamically injects the correct font size based on the button's size prop.
      */
      size: {
        // SM: py-4px, px-12px (Ratio maintained)
        sm: 'py-xs px-m',

        // MD: py-8px, px-24px (The standard sweet spot)
        md: 'py-s px-l',

        // LG: py-12px, px-32px (High impact for modals)
        lg: 'py-m px-2xl',

        // XL: py-24px, px-48px (Maintains 2:1 ratio)
        xl: 'py-l px-3xl',

        // ICON: Maintains square geometry.
        icon: 'h-10 w-10 aspect-square',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export type ButtonVariantsType = VariantProps<typeof buttonVariants>