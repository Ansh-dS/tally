'use client'

import {
  Sidebar,
  SidebarItem,
  Text,
  Stack,
  Box,
  Footer,
  Input,
} from 'components' // From your UI library [cite: 1388-1414]
import { LogOut, Search, Plus } from 'lucide-react'
import { DraggablePaletteItem } from './DraggablePalletItem'
import { BlockType } from '@utils/store'

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
  return (
    <Sidebar
      variant="glass" // Using your defined variant
      className="w-72"
      header={
        <Box className="p-m border-0">
          <Text variant="h3" weight="bold" className="mb-l select-none">
            Elements
          </Text>
          {/* Search bar inside the sidebar header */}
          <Input
            startIcon={<Search size={16} className="mr-s" />}
            placeholder={' Search blocks...'}
          />
        </Box>
      }
      footer={
        <Footer className="p-0 border-none">
          <SidebarItem
            icon={<LogOut size={18} />}
            label="Exit Editor"
            onClick={() => window.history.back()}
            color="accent"
          />
        </Footer>
      }
    >
      {/* 2. Main Children Zone: The Scrollable Palette */}
      <Stack className="p-m overflow-y-auto h-screen " gap="lg">
        {CATEGORIES.map((category) => (
          <Box key={category.title} className="border-none m-m">
            <Text
              variant="caption"
              color="secondary"
              weight="semibold"
              className="uppercase  mb-s select-none"
            >
              {category.title}
            </Text>

            {/* 3. The Draggable Grid */}
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((type) => (
                <DraggablePaletteItem key={type} type={type} />
              ))}
            </div>
          </Box>
        ))}

        {/* Visual Cue for adding more */}
        <Box className="mt-m p-m w-full border-dashed rounded-md flex flex-col items-center justify-center opacity-40">
          <Plus size={20} className="mb-xs" />
          <Text variant="caption">Coming Soon</Text>
        </Box>
      </Stack>
    </Sidebar>
  )
}
