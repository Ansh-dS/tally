import { cva, type VariantProps } from 'class-variance-authority'

export const toastVariants = cva(
  /* BASE: Structural integrity, alignment, and modern transition physics */
  'relative w-full rounded-medium p-m flex items-start gap-m transition-all duration-200 ease-out border',
  {
    variants: {
      intent: {
        default: '',
        info: '',
        success: '',
        warning: '',
        error: '',
      },
      variant: {
        // The "Button-style" solid look (High contrast)
        solid: 'shadow-md items-center',
        // The "Dashboard" inline look (Subtle background, left border)
        subtle: 'shadow-sm',
        // The "Riverside" floating look (Glassmorphism)
        glass: 'shadow-popout backdrop-blur-md bg-surface-overlay/95',
      },
    },
    compoundVariants: [
      /* --- 1. SOLID VARIANTS (Highly Visible, High Contrast) --- */
      {
        variant: 'solid',
        intent: 'default',
        className: 'bg-surface-raised border-border-default',
      },
      {
        variant: 'solid',
        intent: 'info',
        className: 'bg-status-info border-transparent',
      },
      {
        variant: 'solid',
        intent: 'success',
        className: 'bg-status-success/90 border-transparent',
      },
      {
        variant: 'solid',
        intent: 'warning',
        className: 'bg-status-warning border-transparent',
      },
      {
        variant: 'solid',
        intent: 'error',
        className: 'bg-status-danger border-transparent',
      },

      /* --- 2. SUBTLE VARIANTS (Standard Dashboard Alerts) --- */
      {
        variant: 'subtle',
        intent: 'default',
        className: 'bg-surface-sunken border-border-default',
      },
      {
        variant: 'subtle',
        intent: 'info',
        className:
          'bg-status-info-subtle border-transparent border-l-4 border-l-status-info',
      },
      {
        variant: 'subtle',
        intent: 'success',
        className:
          'bg-status-success-subtle border-transparent border-l-4 border-l-status-success',
      },
      {
        variant: 'subtle',
        intent: 'warning',
        className:
          'bg-status-warning-subtle border-transparent border-l-4 border-l-status-warning',
      },
      {
        variant: 'subtle',
        intent: 'error',
        className:
          'bg-status-danger-subtle border-transparent border-l-4 border-l-status-danger',
      },

      /* --- 3. GLASS VARIANTS (Floating Toasts) --- */
      { variant: 'glass', intent: 'default', className: 'border-white/10' },
      {
        variant: 'glass',
        intent: 'info',
        className: 'border-transparent border-l-4 border-l-status-info',
      },
      {
        variant: 'glass',
        intent: 'success',
        className: 'border-transparent border-l-4 border-l-status-success',
      },
      {
        variant: 'glass',
        intent: 'warning',
        className: 'border-transparent border-l-4 border-l-status-warning',
      },
      {
        variant: 'glass',
        intent: 'error',
        className: 'border-transparent border-l-4 border-l-status-danger',
      },
    ],
    defaultVariants: {
      intent: 'default',
      variant: 'subtle',
    },
  }
)

export type ToastVariantsType = VariantProps<typeof toastVariants>
