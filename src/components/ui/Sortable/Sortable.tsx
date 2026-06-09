// packages/ui/src/components/Sortable/Sortable.tsx
import React, { forwardRef } from 'react'
import {
  sortableZoneVariants,
  sortableItemVariants,
  SortableVariantsType,
  SortableItemVariantsType,
} from './styles'
import { cn } from '../Utils/utils'
import { GripVertical } from 'lucide-react'
import { Box } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Button, ButtonProps } from '../Button/Button'

/**
 * STEP 1: INFRASTRUCTURE DEFINITION
 * We use Prettify to ensure TypeScript tooltips show the combined props clearly.
 * We extend HTMLAttributes to ensure these components behave like standard <div> elements.
 */
type SortableProps = SortableVariantsType &
  React.HTMLAttributes<HTMLDivElement> & {
    placeholder?: string
  }

/* -------------------------------------------------------------------------- */
/* 2. SORTABLE ZONE (The Container)                                           */
/* -------------------------------------------------------------------------- */
/**
 * STEP 2: THE FLUID CONTAINER
 * FIX: We added 'h-fit' and 'overflow-visible'.
 * If a container has 'overflow-hidden', dnd-kit shadows and active-item rings
 * get "clipped." Using overflow-visible allows the canvas to expand naturally.
 */
export const Sortable = forwardRef<HTMLDivElement, SortableProps>(
  (
    {
      className,
      isDraggingOver,
      placeholder = 'Drag and drop blocks here',
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Stack
        direction={'vertical'}
        gap={'md'}
        align={'center'}
        ref={ref}
        // We use h-fit so the container grows downward indefinitely as the user adds blocks
        className={cn(sortableZoneVariants({ isDraggingOver }), className)}
        {...rest}
      >
        {/* STEP 2.1: NON-COLLAPSING PLACEHOLDER
          Removed 'absolute inset-0'. Making this a standard flex-item ensures 
          the empty canvas has an intrinsic height and doesn't break the layout.
        */}
        {!children && (
          <Box className="flex w-full items-center justify-center py-xl text-body text-fg-tertiary italic border-2 border-dashed border-border-default rounded-base">
            {placeholder}
          </Box>
        )}
        {children}
      </Stack>
    )
  }
)
Sortable.displayName = 'Sortable'

/* -------------------------------------------------------------------------- */
/* 3. SORTABLE ITEM (The Block/Card)                                          */
/* -------------------------------------------------------------------------- */

type SortableItemProps = SortableItemVariantsType &
  React.HTMLAttributes<HTMLDivElement>
/**
 * STEP 3: THE COMPLEMENTARY BLOCK
 * We destructure 'variant' here. This allows the user to choose between
 * 'card' (bordered) or 'canvas' (Tally-style seamless) looks.
 */

export const SortableItem = forwardRef<HTMLDivElement, SortableItemProps>(
  (
    {
      className,
      variant,
      isSelected,
      isDragging,
      isDropTarget,
      children,
      ...rest
    },
    ref
  ) => (
    <Stack
      ref={ref}
      direction={'horizontal'}
      gap={'md'}
      /* STEP 3.1: PREVENTING VERTICAL COLLAPSE
         FIX: We added 'shrink-0' alongside 'w-full'.
         Without shrink-0, Flexbox will squish the items vertically when the list 
         gets taller than the screen. shrink-0 forces the container to scroll instead, 
         maintaining perfect spacing between blocks.
      */
      className={cn(
        'w-full shrink-0',
        sortableItemVariants({ variant, isSelected, isDragging, isDropTarget }),'p-s', 
        className
      )}
      {...rest}
    >
      {children}
    </Stack>
  )
)
SortableItem.displayName = 'SortableItem'

/* -------------------------------------------------------------------------- */
/* 4. SORTABLE ACTIONS (The Sidebar Container)                                */
/* -------------------------------------------------------------------------- */
/**
 * STEP 4: PROTECTING THE ACTION BAR
 * FIX: The sidebar needs a fixed width (w-12) and 'shrink-0'.
 * 'shrink-0' prevents the sidebar from getting squashed out of existence
 * when the form field content is extremely wide.
 */
export const SortableActions = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <Stack
    direction={'vertical'}
    align={'center'}
    className={cn('w-12 shrink-0 border-r border-transparent py-2', className)}
  >
    {children}
  </Stack>
)

/* -------------------------------------------------------------------------- */
/* 5. SORTABLE DRAG HANDLE (The Grip)                                         */
/* -------------------------------------------------------------------------- */
/**
 * STEP 5: THE PRECISION HANDLE
 * We apply 'cursor-grab' specifically here so the drag only starts
 * when the user grabs the icon, protecting internal inputs from accidental drags.
 */
export const SortableDragHandle = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...rest }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'p-2 text-fg-disabled opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-fg-primary focus:opacity-100 outline-none shrink-0 transition-colors duration-200',
        className
      )}
      {...rest}
    >
      <GripVertical size={16} />
    </Button>
  )
)
SortableDragHandle.displayName = 'SortableDragHandle'

/* -------------------------------------------------------------------------- */
/* 6. SORTABLE ACTION (Generic Button e.g. Trash)                             */
/* -------------------------------------------------------------------------- */
/**
 * STEP 6: THE FLEXIBLE ACTION
 * This follows the exact same visual styling as the Grip (fades in on hover),
 * but uses standard 'cursor-pointer' for clickable actions like delete/duplicate.
 */
export const SortableAction = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...rest }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'p-2 text-fg-disabled opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer hover:text-error-primary focus:opacity-100 outline-none shrink-0 transition-colors duration-200',
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  )
)
SortableAction.displayName = 'SortableAction'
