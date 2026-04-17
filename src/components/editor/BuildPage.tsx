'use client'
import { useState } from 'react'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useFormStore } from '@utils/store'
import { BLOCK_REGISTRY } from './blockRegistry'
import { BlockType } from '@utils/store'
import EditorCanvas from './EditorCanvas'
import { EditorSidebar } from './EditorSidebar'
import {
    Box,
    Stack,
    Text,
    Sidebar,
    EmptyState, // Imported EmptyState for the empty sidebar
} from 'components'

export default function BuildPage() {
    // we set some value to start overlay and adds null to end overlay
    const [activeType, setActiveType] = useState<BlockType | null>(null)

    // zustand store.
    const blocks = useFormStore((state) => state.blocks)
    const addBlock = useFormStore((state) => state.addBlock)
    const reorderBlocks = useFormStore((state) => state.reorderBlocks)
    const updateBlock = useFormStore((state) => state.updateBlock) // New: Needed for the settings to save changes
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null); // New:

    // New: Find the actual block object from the store
    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    // New:Get the correct Settings component from the Registry
    const SettingsComponent = selectedBlock
        ? BLOCK_REGISTRY[selectedBlock.type].settings
        : null;

    // Fires when the drag operation starts
    /*
      if component name exist then change state to draggable.
      so we can see an overlay.
    */
    const handleDragStart = (event: any) => {
        // FIXED: event.source instead of event.operation.source
        const sourceType = event.operation.source?.data?.type
        if (sourceType) {
            setActiveType(sourceType as BlockType)
        }
    }

    // Fires when the item is dropped.
    // we are storing the new component in zustand.
    const handleDragEnd = (event: any) => {
        // FIXED: event.source and event.target instead of event.operation
        const source = event.operation.source
        const target = event.operation.target
        setActiveType(null)

        if (!target) return

        /* 1.isBlueprint:
              a. this we only get when we are drag a new element 
              b. not when we are sorting.
          2.can add the new block/component in dropzone area or over another block.
        */
        if (source?.data?.isBlueprint) {
            const isCanvasTarget =
                target.id === 'canvas-dropzone' ||
                blocks.some((block) => block.id === target.id)

            if (!isCanvasTarget) return

            addBlock(
                source.data.type,
                BLOCK_REGISTRY[source.data.type as BlockType].label
            )
            return
        }

        /* when we are sorting no new elment/component*/
        if (!source?.id || !target?.id) return

        const sourceIndex = blocks.findIndex((block) => block.id === source.id)
        const targetIndex = blocks.findIndex((block) => block.id === target.id)

        if (sourceIndex >= 0 && targetIndex >= 0) {
            // Reordering existing items on the canvas
            reorderBlocks(sourceIndex, targetIndex)
        }
    }

    // fetching out the correct component for overlay.
    const ActiveComponent = activeType
        ? BLOCK_REGISTRY[activeType].component
        : null

    return (

        /* Second element*/
        <Stack direction="horizontal" className=" w-full overflow-x-hidden">
            {/*
                    1.first element under header:
                        w-70: 17.5rem=> the default unit is rem in tailwind.
                    2.DragDropProvider: enables drag and drop interactions for its children.
                    3. imside this we use event function which responds to the interactions. 
                    4. can customize behaviour with below: 
                        plugins, sensors, and modifiers:
                            accepts function or array.
                */}

            {/* sensor takes an input an convert it into drag and drop 
                    inputs?:
                        1. using mouse. 
                        2. using keyboard.
                */}

            {/* Need the below for pointerSensor
                    DragDropManger:
                        manages all thie interaction b/w  drag and drop
                        we fist cratee a manager instance:
                            while creating we can do three configuration:
                                1. sensor 
                                2. modifier
                                3. plugin

                    manager.monitor.EventName
                */}
            <DragDropProvider
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <EditorSidebar />
                {/* Passed the setter to Canvas so clicking a block updates the ID */}

                <EditorCanvas onSelectBlock={setSelectedBlockId} selectedBlockId={selectedBlockId} />
                <DragOverlay>
                    {activeType ? (
                        <div className="opacity-80 shadow-2xl scale-105 cursor-grabbing pointer-events-none bg-surface-base rounded-md">
                            {/* FIXED: We pass `undefined` for the block data, and `true` for isOverlay so the registry renders a static ghost */}
                            {BLOCK_REGISTRY[activeType].preview(undefined, true)}
                        </div>
                    ) : null}
                </DragOverlay>
            </DragDropProvider>


            {/* THE NEW RIGHT SIDEBAR (SETTINGS SHEET) */}
            <Sidebar
                variant="default"
                layout="docked"
                className="w-80 min-w-80 border-l border-border-default"
                header={
                    <Box className="p-m border-b border-border-default w-full">
                        <Text variant="caption" weight="bold">Block Settings</Text>
                    </Box>
                }
            >
                {selectedBlock && SettingsComponent ? (
                    <Stack gap="sm" className="p-m h-full overflow-y-auto">
                        {/* Render the specific settings component for the clicked block */}
                        <SettingsComponent block={selectedBlock} updateBlock={updateBlock} />
                    </Stack>
                ) : (
                    <Box className="h-full flex items-center justify-center p-m opacity-70">
                        <EmptyState
                            title="No Block Selected"
                            description="Click on any block in the canvas to configure its settings."
                            variant="glass"
                        />
                    </Box>
                )}
            </Sidebar>

        </Stack>
    )
}