import { cva, type VariantProps } from 'class-variance-authority'

export const textVariants = cva(
  // Base classes: Reset margins, ensure fonts inherit properly
  'm-0 p-0 font-base transition-colors duration-fast',
  {
    variants: {
      /* 1. SIZE & LINE-HEIGHT (The Semantic Role) */
      variant: {
        display: 'text-display leading-heading tracking-tighter',
        // you can use these headings for according to the purpose as don't have defined work like body,label ....
        h1: 'text-h1 leading-heading tracking-tight',
        h2: 'text-h2 leading-heading tracking-tight',
        h3: 'text-h3 leading-heading',
        subheader: 'text-subheader leading-heading',
        body: 'text-body leading-body', // Default for paragraphs
        label: 'text-label leading-ui', // For inputs, checkboxes, buttons
        caption: 'text-caption leading-ui', // For hints, timestamps, badges
      },
      /* 2. COLOR (Foregrounds) */
      color: {
        primary: 'text-fg-primary',
        secondary: 'text-fg-secondary',
        brand: 'text-fg-brand',
        accent: 'text-fg-accent',
        inverted: 'text-fg-inverted', //
        disabled: 'text-fg-disabled',
        // Status colors for Alerts/Toasts
        success: 'text-status-success',
        warning: 'text-status-warning',
        danger: 'text-status-danger',
        info: 'text-status-info',
      },
      /* 3. FONT WEIGHT */
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      /* 4. ALIGNMENT */
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      variant: 'body',
      color: 'primary',
      weight: 'normal',
      align: 'left',
    },
  }
)

export type TextVariantsType = VariantProps<typeof textVariants>
