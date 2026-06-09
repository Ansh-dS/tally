'use client' // Required because useTheme uses Context/State
// Contains the UI of editor where we drag and drop/refine the order of questions/components
import { useEffect, useState } from 'react'
import { type FormBlock, useStore } from '@utils/store'
import { BLOCK_REGISTRY } from '../blocks/blockRegistry'
import { useDroppable } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { Box } from '@primitives/Box/Box'
import { Input } from '@primitives/Input/Input'
import { TextArea } from '@primitives/TextArea/TextArea'
import { Stack } from '@primitives/Stack/Stack'
import { EmptyState } from '@primitives/EmptyState/EmptyState'
import { Sortable, SortableItem, SortableDragHandle, SortableActions, SortableAction } from '@primitives/Sortable/Sortable'
import { Trash } from 'lucide-react'

function CanvasBlock({
  block,
  index,
  onSelect,
  isSelected,
}: {
  block: FormBlock
  index: number
  onSelect: () => void
  isSelected: boolean
}) {
  // Pull updateBlock from store so it can be passed to the preview
  const updateBlock = useStore((state) => state.updateBlock)
  const deleteBlock = useStore((state) => state.removeBlock)

  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: block.id,
    index,
  })

  // FIXED: Passed block data, false for isOverlay, and the updateBlock function
  const preview = BLOCK_REGISTRY[block.type].preview(block, false, updateBlock)

  return (
    <SortableItem
      ref={ref}
      onClick={onSelect}
      isSelected={isSelected}
      isDragging={isDragging}
      isDropTarget={isDropTarget}
      className="w-full"
    >
      <SortableActions>
        <SortableDragHandle ref={handleRef} />
        <SortableAction
          onClick={() => {
            deleteBlock(block.id)
          }}
          color="danger"
          className="hover:bg-status-danger-subtle active:bg-status-danger/30 active:scale-[0.90] transition-all animate-duration-slow"
        >
          <Trash size={16} />
        </SortableAction>
      </SortableActions>
      <div className="flex-1 p-m pl-0">{preview}</div>
    </SortableItem>
  )
}

// FIXED: Correctly defined the props interface for the React component
interface EditorCanvasProps {
  onSelectBlock: (id: string | null) => void
  selectedBlockId: string | null
  formId: string
}

export default function EditorCanvas({
  onSelectBlock,
  selectedBlockId,
  formId,
}: EditorCanvasProps) {
  /// zustand store.
  const setTitle = useStore((state) => state.setTitle)
  const setDescription = useStore((state) => state.setDescrition)
  const header = useStore((state) => state.header)
  const blocks = useStore((state) => state.blocks)
  const [currentId, setCurrentId] = useState(formId) // so we can update the formId from "new" to something else, once we store the data.
  const setLoading = useStore((state) => state.saveButton.setLoading)
  // NEW API: 'isOver' is now 'isDropTarget'
  const { ref, isDropTarget } = useDroppable({ id: 'canvas-dropzone' })

  /*
    1.How are we cleaning up the old timeout.
      a. whenever we try to return something in useEffect it stores that until the new clean up. 
      b. if we are returing a funciton it will first run it. 
    2. Header: we are using the below so stringify data gets converts down to json as we are tell the server that the body inside is a json
    
    NOTE:
      we just need the path not the whole URL. 
  */

  useEffect(() => {
    setLoading(true)
    // building timerId
    const timerId = setTimeout(async () => {
      try {
        // 2. Use currentId instead of the prop formId
        const res = await fetch(`/api/forms/${currentId}/autosave/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ header, blocks }),
        })

        // If response is not OK (including redirects), bail out gracefully
        if (!res.ok) {
          console.warn(
            `Autosave returned ${res.status}. Auth redirect or error occurred.`
          )
          return
        }

        const responseData = await res.json()

        // If formId is "new" and the server gave us a real ID
        if (currentId === 'new' && responseData.data?.newFormId) {
          const realId = responseData.data.newFormId

          setCurrentId(realId) // Update state so the next autosave uses the real ID

          // Silently update the browser URL without unmounting/reloading the page!
          window.history.replaceState(null, '', `/forms/${realId}/edit`)
        }

        console.log('Autosave successful')
      } catch (err) {
        console.error('Autosave failed', err)
      } finally {
        setLoading(false)
      }
    }, 5000)

    // removing timerId in the next iteration.
    return () => clearTimeout(timerId)
  }, [blocks, header, currentId, setLoading]) // 4. Depend on currentId!


  useEffect(() => {
    // creating a channel.
    const channel = new BroadcastChannel("tally-form-data")

    // whenever we make change we post form_data which gets recived by other browser tab. 
    const broadcastForm = () => {
      channel.postMessage({
        id: 'State_Updated',
        formData: { header, blocks }
      })
    }

    // Listen for the Preview tab's "Shout": sending data for the first time. 
    // using "onMessage"
    channel.onmessage = (e) => {
      if (e.data?.id === 'REQUEST_INITIAL_STATE') {
        broadcastForm()
      }
    }

    // 2. Broadcast on every change
    broadcastForm();

    // Close this connection only when we unmount canvas component uisng return of useEffect.
    return ()=> channel.close()
  }, [blocks, header])

  return (
    <Box
      className="flex-1 min-w-0 m-s h-full p-2xl border-0 text-fg-primary"
      onClick={(e) => {
        // If the user clicks the empty canvas background, deselect the active block
        if (e.target === e.currentTarget) {
          onSelectBlock(null)
        }
      }}
    >
      {/* Header */}
      <Stack className=" pb-xl" gap="sm">
        <Input
          value={header.title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-h1 font-bold border-none p-0 focus-visible:ring-0 shadow-none"
          placeholder="Untitled Form"
        />
        <TextArea
          placeholder={'Add description'}
          className="border-none p-0 focus-visible:ring-0 resize-none min-h-10 shadow-none text-body font-semibold"
          onChange={(e) => {
            setDescription(e.target.value)
          }}
          value={header.description}
        />
      </Stack>

      {/* 2. DYNAMIC SORTABLE AREA */}
      <Stack className="mt-xl h-full" gap="md">
        {/* Here is where your SortableContext maps through blocks. 
           If empty, show the EmptyState component.

           using map we are sending the id and index to each inside component respectively. 
        */}
        {blocks.length !== 0 ? (
          <Sortable
            ref={ref}
            isDraggingOver={isDropTarget}
            className="w-full transition-all animate-duration-fast"
          >
            {blocks.map((block, index) => (
              <CanvasBlock
                key={block.id}
                block={block}
                index={index}
                onSelect={() => onSelectBlock(block.id)}
                isSelected={selectedBlockId === block.id}
              />
            ))}
          </Sortable>
        ) : (
          <Box
            ref={ref}
            className="mx-auto flex w-full border-0 items-center justify-center p-xl"
          >
            <EmptyState
              title="Canvas"
              description="Drag a block here and Sort them"
              variant={'dashed'}
              fullWidth={true}
              className="transition-all animate-duration-normal"
            />
          </Box>
        )}
      </Stack>
    </Box>
  )
}
