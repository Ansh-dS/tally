import { cva, type VariantProps } from 'class-variance-authority'
export const stackVariants = cva('flex min-h-0 min-w-0', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-s',
      md: 'gap-m',
      lg: 'gap-l',
    },
    // Mapped to actual tokens
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: 'md',
    align: 'start',
    justify: 'start',
  },
})
export type StackVariantsType = VariantProps<typeof stackVariants>
