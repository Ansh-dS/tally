'use client'
import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useStore } from '@utils/store'
import { BLOCK_REGISTRY } from '../blocks/blockRegistry'
import { BlockType } from '@utils/store'
import EditorCanvas from './EditorCanvas'
import { EditorSidebar } from './EditorSidebar'
import { EditorForm } from '@utils/data-fetchers'
import { AuthorizedUser } from '@actions/dashboard'

import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Sidebar } from '@primitives/Sidebar/Sidebar'
import { EmptyState } from '@primitives/EmptyState/EmptyState'

interface BuildPageInput {
  form: EditorForm | null
  user: AuthorizedUser
}
export default function BuildPage({ form, user }: BuildPageInput) {
  // as we can't use "[]" on "typesof " so we use compoentProps.
  type DragStartHandler = NonNullable<
    ComponentProps<typeof DragDropProvider>['onDragStart']
  >
  type DragEndHandler = NonNullable<
    ComponentProps<typeof DragDropProvider>['onDragEnd']
  >

  // we set some value to start overlay and adds null to end overlay
  const [activeType, setActiveType] = useState<BlockType | null>(null)
  const [isCollapsed, setCollapsed] = useState(false)

  // zustand store.
  const blocks = useStore((state) => state.blocks)
  const setBlocks = useStore((state) => state.setBlocks)
  const setTitle = useStore((state) => state.setTitle)
  const setDescription = useStore((state) => state.setDescrition)
  const addBlock = useStore((state) => state.addBlock)
  const reorderBlocks = useStore((state) => state.reorderBlocks)
  const updateBlock = useStore((state) => state.updateBlock) // New: Needed for the settings to save changes
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null) // New:

  // New: Find the actual block object from the store
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)
  const formId = !form ? 'new' : form.id
  // New:Get the correct Settings component from the Registry
  const SettingsComponent = selectedBlock
    ? BLOCK_REGISTRY[selectedBlock.type].settings
    : null

  useEffect(() => {
    if (form != null) {
      const parsedBlocks =
        typeof form.blocks === 'string'
          ? JSON.parse(form.blocks) // Json.parse: converts string to Json.
          : form.blocks
      setBlocks(parsedBlocks)
      setTitle(form.title)
      if (form.description) setDescription(form.description)
    }
  }, [form, setBlocks, setTitle, setDescription])

  // Fires when the drag operation starts
  /*
      if component name exist then change state to draggable.
      so we can see an overlay.
  */
  const handleDragStart: DragStartHandler = (event) => {
    // FIXED: event.source instead of event.operation.source
    const sourceType = event.operation.source?.data?.type
    if (typeof sourceType === 'string' && sourceType in BLOCK_REGISTRY) {
      setActiveType(sourceType as BlockType)
    }
  }

  // Fires when the item is dropped.
  // we are storing the new component in zustand.
  const handleDragEnd: DragEndHandler = (event) => {
    // FIXED: event.source and event.target instead of event.operation
    const source = event.operation.source
    const target = event.operation.target
    const targetId = target?.id == null ? null : String(target.id)
    setActiveType(null)

    if (!targetId) return

    /* 1.isBlueprint:
              a. this we only get when we are drag a new element 
              b. not when we are sorting.
          2.can add the new block/component in dropzone area or over another block.
        */
    if (source?.data?.isBlueprint) {
      const sourceType = source.data.type
      if (typeof sourceType !== 'string' || !(sourceType in BLOCK_REGISTRY)) {
        return
      }
      const typedSourceType = sourceType as BlockType
      const isCanvasTarget =
        targetId === 'canvas-dropzone' ||
        blocks.some((block) => block.id === targetId)

      if (!isCanvasTarget) return

      addBlock(typedSourceType, BLOCK_REGISTRY[typedSourceType].label)
      return
    }

    /* when we are sorting no new elment/component*/
    if (!source?.id) return
    const sourceId = String(source.id)

    const sourceIndex = blocks.findIndex((block) => block.id === sourceId)
    const targetIndex = blocks.findIndex((block) => block.id === targetId)

    if (sourceIndex >= 0 && targetIndex >= 0) {
      // Reordering existing items on the canvas
      reorderBlocks(sourceIndex, targetIndex)
    }
  }

  return (
    /* Second element*/
    <Stack
      direction="horizontal"
      className="w-full min-w-0 overflow-x-hidden border-0"
    >
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
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/*i. leftmost sidebar*/}
        <EditorSidebar />
        {/* Passed the setter to Canvas so clicking a block updates the ID */}
        {/*ii. canvas component */}
        <EditorCanvas
          onSelectBlock={setSelectedBlockId}
          selectedBlockId={selectedBlockId}
          formId={formId}
        />

        <DragOverlay>
          {activeType ? (
            <Box className="opacity-80 border-0 shadow-2xl scale-105 cursor-grabbing pointer-events-none bg-surface-base rounded-md">
              {/* FIXED: We pass `undefined` for the block data, and `true` for isOverlay so the registry renders a static ghost */}
              {BLOCK_REGISTRY[activeType].preview(undefined, true)}
            </Box>
          ) : null}
        </DragOverlay>
      </DragDropProvider>

      {/*iii. THE NEW RIGHT SIDEBAR (SETTINGS SHEET) */}
      <Sidebar
        variant="glass"
        layout="docked"
        collapsed={isCollapsed}
        size={'narrow'}
        collapseMode="hide"
        className="sticky border-0 bg-surface-sunken/80"
        position="right"
        showToggle={true}
        onToggle={() => {
          setCollapsed(!isCollapsed)
        }}
        header={
          <Text variant="body" weight="bold" className="py-s pr-s">
            Block Settings
          </Text>
        }
        children={
          selectedBlock && SettingsComponent ? (
            <Stack gap="sm" className="p-m">
              {/* Render the specific settings component for the clicked block */}
              <SettingsComponent
                block={selectedBlock}
                updateBlock={updateBlock}
              />
            </Stack>
          ) : (
            <Box className="h-full border-0 flex items-center ">
              <EmptyState
                title="No Block Selected"
                variant="minimal"
                className="select-none"
              />
            </Box>
          )
        }
      />
    </Stack>
  )
}
