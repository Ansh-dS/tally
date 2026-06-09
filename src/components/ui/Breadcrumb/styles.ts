import { cva, type VariantProps } from 'class-variance-authority'

export const breadcrumbContainerVariants = cva(
  /* STAFF FIX: Removed perspective. We are keeping it flat and professional. */
  'flex items-center flex-wrap',
  {
    variants: {
      size: {
        sm: 'gap-xs',
        md: 'gap-sm',
        lg: 'gap-m',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export const breadcrumbLinkVariants = cva(
  /* STAFF FIX: Removed 3D transforms. 
     Kept duration-fast for crisp color changes. */
  'inline-flex items-center gap-2 justify-center transition-colors duration-fast rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focused',
  {
    variants: {
      variant: {
        /* Default: Clean text. Starts transparent. */
        default:
          'text-fg-secondary hover:text-fg-brand hover:bg-action-ghost-hover',

        /* Solid: Pill shape. */
        solid:
          'bg-surface-sunken text-fg-secondary hover:text-fg-primary hover:bg-surface-raised shadow-inset',

        /* Glass: Transparent blur. */
        glass:
          'bg-surface-base/30 backdrop-blur-md border border-white/20 text-fg-secondary hover:text-fg-primary hover:bg-surface-base/40 shadow-sm',
      },
      size: {
        /* INACTIVE SCALING: The standard sizes for unselected items */
        sm: 'px-xs py-[2px] text-caption leading-ui [&_svg]:w-[14px] [&_svg]:h-[14px] [&_svg]:shrink-0',
        md: 'px-s py-xs text-label leading-ui [&_svg]:w-[16px] [&_svg]:h-[16px] [&_svg]:shrink-0',
        lg: 'px-m py-s text-body leading-body [&_svg]:w-[20px] [&_svg]:h-[20px] [&_svg]:shrink-0',
      },
      isCurrentPage: {
        /* STAFF FIX: Removed all hover/active scaling */
        true: 'pointer-events-none',
        false: '',
      },
    },
    compoundVariants: [
      /* THE ACTIVE STATE OVERRIDES: 
         We artificially increase the font-weight and the SVG size by exactly 1 step (e.g., from 16px to 18px)
         to make it look permanently "selected" without needing CSS transforms.
      */
      {
        variant: 'default',
        isCurrentPage: true,
        // The SVG is bumped up by 2px (e.g., from w-[16px] to w-[18px] assuming 'md' size)
        className:
          'text-fg-primary font-bold bg-transparent [&_svg]:w-[1.125em] [&_svg]:h-[1.125em] [&_svg]:stroke-[2.5px]',
      },
      {
        variant: 'solid',
        isCurrentPage: true,
        className:
          'bg-action-primary-subtle text-fg-brand font-bold shadow-none [&_svg]:w-[1.125em] [&_svg]:h-[1.125em] [&_svg]:stroke-[2.5px]',
      },
      {
        variant: 'glass',
        isCurrentPage: true,
        className:
          'bg-surface-base/50 text-fg-primary font-bold border-white/40 [&_svg]:w-[1.125em] [&_svg]:h-[1.125em] [&_svg]:stroke-[2.5px]',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isCurrentPage: false,
    },
  }
)

export type BreadcrumbLinkVariantsType = VariantProps<
  typeof breadcrumbLinkVariants
>
