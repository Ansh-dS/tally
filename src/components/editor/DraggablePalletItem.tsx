'use client'

import { useDraggable } from '@dnd-kit/react'
import { Box, Text, Stack } from 'components'
import { BlockType } from '@utils/store'
import { BLOCK_REGISTRY } from './blockRegistry'

interface DraggablePaletteItemProps {
  type: BlockType
}

// Returns a dragable sidebar item which is wrapped around a card.
export function DraggablePaletteItem({ type }: DraggablePaletteItemProps) {
  const config = BLOCK_REGISTRY[type]

  const { ref, isDragging } = useDraggable({
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
      className={`p-s cursor-grab active:cursor-grabbing hover:bg-action-ghost-hover transition-colors border-none   ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <Stack direction="horizontal" align="center" gap="sm">
        <Stack direction={'vertical'}>
          <Icon size={16} className="text-fg-secondary" />
          <Text variant="body" weight="medium" className="select-none">
            {config.label}
          </Text>
        </Stack>
      </Stack>
    </Box>
  )
}
