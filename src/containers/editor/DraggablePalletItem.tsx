'use client'

import { useDraggable } from '@dnd-kit/react'
import { Box } from '@primitives/Box/Box' // Removed Stack, we will use Tailwind Flex
import { Text } from '@primitives/Text/Text'
import { BlockType } from '@utils/store'
import { BLOCK_REGISTRY } from './blocks/blockRegistry'

interface DraggablePaletteItemProps {
  type: BlockType
}

// Returns a dragable sidebar item which is wrapped around a card.
export function DraggablePaletteItem({ type }: DraggablePaletteItemProps) {
  const config = BLOCK_REGISTRY[type]

  // NEW API: 'isDragging' is now 'isDragSource'
  const { ref, isDragSource } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: type, // only dropable which having this type (button.....) will be the tragets.
      isBlueprint: true, // we are using this because of the sortable.
    },
  })

  const Icon = config.icon

  return (
    <Box
      ref={ref} // ref: callback funciton which we provide to our dragable.
      className={`
        group flex flex-col items-center justify-center gap-2 
        rounded-lg border border-transparent p-3 
        cursor-grab active:cursor-grabbing 
        hover:bg-action-ghost-hover hover:border-border/50 
        transition-all duration-200 select-none
        ${isDragSource ? 'opacity-40 scale-95 shadow-sm' : 'opacity-100'}
      `}
    >
      {/* Icon color transitions on hover for better affordance */}
      <Icon
        size={20}
        className="text-fg-secondary transition-colors duration-200 group-hover:text-fg-primary"
      />
      <Text
        variant="caption"
        weight="medium" // Changed from normal to medium
        className="text-fg-secondary/90 tracking-wide select-none" // Increased opacity/brightness
      >
        {config.label}
      </Text>
    </Box>
  )
}
