'use client'

/* 1. we need mouse event to capture mouse movements. 
2. capture the distance form the starting point(where the event starts):
        a. for both(width/ height) differently.

*/

/*
layer 2 and 3 here:
    layer 2: flexible screen
    layer 3: rendering the form components here.

why we need this even if "Preview" button exists:
  to check the scalability at different screens.
*/

import { useStore } from '@/lib/utils/store'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Stack } from '@primitives/Stack/Stack'
import { useState } from 'react'
import { LiveFieldRenderer } from '@/containers/editor/sharePage/LiveFieldRender'
import { useRef, useCallback } from 'react'

export default function FlexibleScreen() {
  // 1. STATE & REFS
  // We set a realistic default (Mobile view)
  const [dimensions, setDimensions] = useState({ width: 25, height: 43.75 })
  const [isResizing, setIsResizing] = useState(false)
  // FIX: Initialize scale to 1 so the transform doesn't break on first load
  const [scaleValue, setScaleValue] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const blocks = useStore((state) => state.blocks)
  const header = useStore((state) => state.header)

  // 2. callback: so we don't recreate the function again when our dimentions are changing as re-rendering happens. 
  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true) // True means: we are ready ot update the dimentions. 

      const startX = (e.clientX) / 16
      const startY = (e.clientY) / 16
      const startW = dimensions.width // already in rem
      const startH = dimensions.height

      // FUNCTION 1:
      const onMouseMove = (moveEvent: MouseEvent) => {
        // Calculate distance from start
        // moveEveent.clientX: new position.
        const deltaX = (moveEvent.clientX) / 16 - startX
        const deltaY = (moveEvent.clientY) / 16 - startY

        // FIX: Calculate new dimensions first so we can use them for the scale math
        const newWidth = Math.max(20, startW + deltaX)
        const newHeight = Math.max(25, startH + deltaY)

        setDimensions({
          width: newWidth, // Min width constraint
          height: newHeight, // Min height constraint
        })


        // Calculate available width accounting for:
        // 1. Right panel is flex-[1.5] out of total flex-[2.5] (1 + 1.5)
        // 2. Padding on right panel is p-10 (2.5rem on each side = 5rem total)
        const rightPanelFlexRatio = 1.5 / 2.5 // this is: 1/3 or 1/4 or the whole apple or screen width. 
        const rightPanelWidthRem = (window.innerWidth / 16) * rightPanelFlexRatio
        const availableWidthRem = rightPanelWidthRem - 5 // subtract padding


        /* 
        Scale to fit within the available space:
          - scale = 1 means no scaling (full size)
          - scale < 1 means shrink to fit
        */
        setScaleValue(Math.min(1, availableWidthRem / newWidth))
      }

      // FUNCITON 2:  
      const onMouseUp = () => {
        setIsResizing(false)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      /*
        a. just adding funcitons to event listeners to start
        b. event listners: pre-defined events of browser which needs funcitons to activate
            1. mousemove
            2. mouseup: when you stop grabing the mouse. 
      */
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [dimensions]
  )

  return (
    /*This relative: 
        a. helps the resize handles to stay over the border of the box.
        b. even if we are resizing.
    */
    <Box
      ref={containerRef}
      className={`
                 relative shadow-modal overflow-hidden
                transition-shadow animate-duration-normal ease-in-out border-0 rounded-medium
                ${isResizing ? 'opacity-80 ring-2 ring-action-primary/30 shadow-raised' : 'opacity-100'}
            `}
      style={{
        width: `${dimensions.width}rem`,
        height: `${dimensions.height}rem`,
        borderWidth: '0.5rem', // Mimics a device frame. over these border we try to place box. 
        borderColor: isResizing
          ? 'var(--colors-background-tertiary)'
          : 'var(--colors-background-primary)',

        // 3. APPLY THE SCALE
        transform: `scale(${scaleValue})`,

        // CRITICAL: Scale from the top-center so it stays pinned to the header
        transformOrigin: 'top center',

        // Add a small transition for when the user snaps to presets
        transition: isResizing ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* LAYER 3: THE CONTENT (Scrollable) */}
      <Box className="w-full h-full p-10 border-0 overflow-y-auto rounded-medium">
        {/* THE HEADER */}
        <Stack gap="sm" className="mb-5 pb-4 border-b-2 border-border-strong ">
          <Text color="primary" variant="h1" weight="bold">
            {header.title || 'Untitled Form'}
          </Text>
          <Text color="secondary" variant="body" weight="semibold">
            {header.description || 'Add a description...'}
          </Text>
        </Stack>

        {/* THE FORM BLOCKS */}
        <Stack className="gap-10 p-l">
          {blocks.map((block) => (
            <LiveFieldRenderer key={block.id} block={block} />
          ))}
        </Stack>
      </Box>

      {/* --- RESIZE HANDLES (LAYER 2 INTERACTORS) --- */}

      {/* RIGHT HANDLE (Width) 
                onMousedown:  it's a parameter which triggers a funcition if mouse pressed. 
                used "group" as style all the compoenents at once. 
            */}
      <Box
        onMouseDown={startResizing}
        className="group absolute top-0 -right-2 border-0 h-full w-4 cursor-col-resize z-10 flex items-center justify-center"
      >
        <Box
          className={`
                    w-1 h-12 rounded-full transition-colors animate-duration-normal
                    ${isResizing ? 'bg-action-primary' : 'bg-transparent group-hover:bg-border-strong'}
                `}
        />
      </Box>

      {/* BOTTOM HANDLE (Height) 
          these are the div over the borders of parent.
      */}
      <Box
        onMouseDown={startResizing}
        className="group absolute -bottom-2 border-0 left-0 w-full h-4 cursor-row-resize z-popover flex items-center justify-center"
      >
        <Box
          className={`
                    h-1 w-12 rounded-full transition-colors animate-duration-normal
                    ${isResizing ? 'bg-action-primary' : 'bg-transparent group-hover:bg-border-strong'}
                `}
        />
      </Box>

      {/* CORNER HANDLE (Both) */}
      <Box
        onMouseDown={startResizing}
        className="absolute -bottom-2 -right-2 border-0  w-6 h-6 cursor-nwse-resize z-popover flex items-center justify-center"
      >
        <Box className={`w-2 h-2 rounded-full bg-action-primary  opacity-0 hover:opacity-100 transition-opacity
        ` } />
      </Box>
    </Box>
  )
}