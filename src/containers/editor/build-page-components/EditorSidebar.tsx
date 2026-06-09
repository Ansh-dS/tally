'use client'

import { Sidebar } from '@primitives/Sidebar/Sidebar'
import { Text } from '@primitives/Text/Text'
import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import {  Plus } from 'lucide-react'
import { DraggablePaletteItem } from '../DraggablePalletItem'
import { BlockType } from '@utils/store'
import { useState } from 'react'

// 1. Define your palette categories
const CATEGORIES: { title: string; items: BlockType[] }[] = [
  {
    title: 'Basic Inputs',
    items: ['input', 'email', 'textarea'],
  },
  {
    title: 'Selection',
    items: ['radio', 'checkbox', 'select', 'switch'],
  },
  {
    title: 'Actions & Display',
    items: ['Button', 'Alert'],
  },
]

export function EditorSidebar() {
  const [isCollapsed, setCollapsed] = useState(false)
  return (
    <Sidebar
      variant="glass" // Using your defined variant
      className="border-0 sticky bg-surface-sunken/80 "
      position="left"
      size={'wide'}
      showToggle={true}
      onToggle={() => {
        setCollapsed(!isCollapsed)
      }}
      collapseMode="hide"
      collapsed={isCollapsed}
      header={
        <Text
          variant={"subheader"}
          weight={'bold'}
          color={'primary'}
          className="py-s pr-s"
        >
          Elements
        </Text>
      }
     
      children={
        /* 2. Main Children Zone: The Scrollable Palette */
        <Stack className="h-full p-s " gap="md">
          {CATEGORIES.map((category) => (
            <Box
              key={category.title}
              className="w-full rounded-medium p-m border-0"
            >
              <Text
                variant="caption"
                color="secondary"
                weight="semibold"
                className="mb-m select-none uppercase tracking-wide"
              >
                {category.title}
              </Text>

              {/* 3. The Draggable Grid */}
              <Box className="grid grid-cols-2 gap-m border-0">
                {category.items.map((type) => (
                  <DraggablePaletteItem key={type} type={type} />
                ))}
              </Box>
            </Box>
          ))}

          {/* Visual Cue for adding more */}
          <Box className="mt-s p-m w-full border-dashed rounded-md flex flex-col items-center justify-center opacity-40">
            <Plus size={20} className="mb-xs" />
            <Text variant="caption">Coming Soon</Text>
          </Box>
        </Stack>
      }
    />
  )
}
