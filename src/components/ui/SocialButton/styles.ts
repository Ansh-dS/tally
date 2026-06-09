import { cva, type VariantProps } from 'class-variance-authority'

export const socialButtonVariants = cva(
  [
    // Core Layout
    'inline-flex items-center justify-center shrink-0 w-full',
    'rounded-medium font-weight-medium transition-all duration-fast',
    'border outline-none cursor-pointer',

    // focus-visible: when we are using tabs over the components
    // ring-2: these are shadows which looks like border where '2' is the thickness.
    'focus-visible:ring-2 focus-visible:ring-border-focused active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
  ],
  {
    variants: {
      provider: {
        google:
          'bg-surface-base text-fg-primary border-border-default hover:bg-surface-sunken',

        // GitHub adapts to the theme naturally
        github:
          'bg-neutral-900 text-fg-inverted border-transparent hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200',

        apple:
          'bg-fg-primary text-fg-inverted border-transparent hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900',

        generic:
          'bg-surface-base text-fg-primary border-border-default hover:border-border-focused',

        /* Magic Link: 
          1. we are making thg bg transparent and providing the brannd colors to text and icon.
          2. we are providing brand and hover states border where we reduce the reduces the opacity:
              not for bg color but for border too.
        */
        'magic-link': [
          'bg-action-primary-transparent text-action-primary',
          'border border-action-primary/20 hover:bg-action-primary/10 hover:border-action-primary/40',
        ],
      },
      /* [&>span>svg]:w-4 => this is the way we can increase the size of SVG.
       */
      size: {
        sm: 'py-xs px-m gap-xs [&>span>svg]:w-4 [&>span>svg]:h-4',
        md: 'py-s px-l gap-s [&>span>svg]:w-5 [&>span>svg]:h-5',
        lg: 'py-m px-2xl gap-m [&>span>svg]:w-6 [&>span>svg]:h-6',
      },
    },
    defaultVariants: {
      provider: 'generic',
      size: 'md',
    },
  }
)

export type SocialButtonVariantsType = VariantProps<typeof socialButtonVariants>
