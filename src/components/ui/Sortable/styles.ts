// packages/ui/src/components/Sortable/styles.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const sortableZoneVariants = cva(
  /* STEP 1: ZONE ARCHITECTURE
    'h-fit' allows the container to grow infinitely with its children.
    'overflow-visible' ensures drop-shadows and drag-rings aren't cut off.
  */
  'relative flex flex-col gap-m p-m rounded-large transition-all duration-300 w-full min-h-32 h-fit overflow-visible',
  {
    variants: {
      isDraggingOver: {
        true: 'bg-action-primary/5 ring-2 ring-inset ring-action-primary/20',
        false: 'bg-transparent',
      },
    },
    defaultVariants: {
      isDraggingOver: false,
    },
  }
)

export const sortableItemVariants = cva(
  /* STEP 2: ITEM LAYOUT
    'flex-row' and 'w-full' ensure the block spans the canvas and supports the sidebar.
    'shrink-0' is critical here: it prevents blocks from compressing when the list grows.
  */
  'group relative flex flex-row w-full shrink-0 items-stretch transition-all duration-200 outline-none',
  {
    variants: {
      variant: {
        canvas:
          'bg-transparent border-transparent border-y first:border-t-transparent last:border-b-transparent hover:bg-surface-elevated/50',
        card: 'bg-surface-base border border-border-default rounded-base shadow-sm hover:border-border-focused',
      },
      isSelected: { true: '', false: '' },
      isDragging: {
        true: 'opacity-40 scale-[0.98] z-50 pointer-events-none',
        false: 'opacity-100 scale-100 z-0',
      },
      isDropTarget: {
        true: 'ring-2 ring-inset ring-action-primary/40 bg-action-primary/5',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'canvas',
        isSelected: true,
        className:
          'bg-surface-elevated border-y-border-default ring-1 ring-inset ring-action-primary shadow-[inset_4px_0_0_0_var(--color-action-primary)]',
      },
      {
        variant: 'card',
        isSelected: true,
        className:
          'border-action-primary ring-1 ring-action-primary shadow-raised',
      },
    ],
    defaultVariants: {
      variant: 'canvas',
      isSelected: false,
      isDragging: false,
      isDropTarget: false,
    },
  }
)

export type SortableVariantsType = VariantProps<typeof sortableZoneVariants>
export type SortableItemVariantsType = VariantProps<typeof sortableItemVariants>
