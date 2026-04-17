'use client' // Required because useTheme uses Context/State
// Contains the UI of editor where we drag and drop/refine the order of questions/components
import { useState } from 'react'
import { type FormBlock, useFormStore } from '@utils/store'
import { BLOCK_REGISTRY } from './blockRegistry'
import { useDroppable } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  Box,
  Input,
  TextArea,
  Stack,
  EmptyState,
  Sortable,
  SortableItem
} from 'components'

function CanvasBlock({
  block,
  index,
  onSelect,
  isSelected
}: {
  block: FormBlock
  index: number
  onSelect: () => void
  isSelected: boolean
}) {
  // FIXED: Pull updateBlock from store so it can be passed to the preview
  const updateBlock = useFormStore(state => state.updateBlock)

  const { ref, isDragging, isDropTarget } = useSortable({
    id: block.id,
    index,
  })

  // FIXED: Passed block data, false for isOverlay, and the updateBlock function
  const preview = BLOCK_REGISTRY[block.type].preview(block, false, updateBlock)

  return (
    <Sortable
      ref={
        ref}
      className={`w-full m-m  ${isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'
        } ${isDropTarget ? 'ring-2 ring-brand' : ''}`}
    >
      <SortableItem 
        onClick={onSelect}
        className={`cursor-pointer transition-all ${isSelected ? 'border-brand ring-1 ring-brand' : ''}`}
      >
        {preview}
      </SortableItem>
    </Sortable>
  )
}

// FIXED: Correctly defined the props interface for the React component
interface EditorCanvasProps {
  onSelectBlock: (id: string | null) => void;
  selectedBlockId: string | null;
}

export default function EditorCanvas({ onSelectBlock, selectedBlockId }: EditorCanvasProps) {
  const [formTitle, updateTitle] = useState('Untitled Form')
  const blocks = useFormStore(state => state.blocks)
  const { ref } = useDroppable({ id: 'canvas-dropzone' })

  return (
    <Box 
      ref={ref} 
      className="flex-1 w-full m-s h-full p-2xl border-0 relative"
      onClick={(e) => {
        // If the user clicks the empty canvas background, deselect the active block
        if (e.target === e.currentTarget) {
          onSelectBlock(null);
        }
      }}
    >

      {/* 1. STATIC HEADER: Not part of dnd-kit array */}
      <Stack className=" pb-xl" gap="sm">
        <Input
          value={formTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="text-3xl font-bold border-none p-0 focus-visible:ring-0"
        />
        <TextArea
          placeholder="Add a description (optional)..."
          className="border-none p-0 focus-visible:ring-0 resize-none min-h-10"
        />
      </Stack>

      {/* 2. DYNAMIC SORTABLE AREA */}
      <Stack className="mt-xl h-full" gap="md">
        {/* Here is where your SortableContext maps through blocks. 
         If empty, show the EmptyState component.

         using map we are sending the id and index to each inside component respectively. 
      */}
        {blocks.length !== 0 ? (
          blocks.map((block, index) => (
            <CanvasBlock 
              key={block.id} 
              block={block} 
              index={index} 
              onSelect={() => onSelectBlock(block.id)}
              isSelected={selectedBlockId === block.id}
            />
          ))
        ) : (
          <EmptyState
            title="Canvas"
            description='you can drag a block in b/w other blocks and can sort the Questions'
            variant={'dashed'}
            className=''
          />
        )}
      </Stack>

    </Box>
  )
}


/*
 {blocks.length !== 0 ? blocks.map(block => (
          <Stack direction={"vertical"} gap={'md'} >
            <Sortable key={block.id} children={BLOCK_REGISTRY[block.type].preview()} />
            <Stack direction={"horizontal"} align={'center'} justify={'center'}>
              <Box></Box>
              <Box children={<PlusIcon />} />
              <Box></Box>
            </Stack>
          </Stack>
        )) : <EmptyState title="Canvas" description='you can drag a block in b/w other blocks and can sort the Questions' variant={'dashed'} className='' />
        }

*/