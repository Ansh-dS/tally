'use client'

import { useState } from 'react'

import { Button } from '@primitives/Button/Button'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Sheet } from '@primitives/Sheet/Sheet'

import { Sidebar, SidebarItem } from '../../components/ui/Sidebar/Sidebar'

import { MessagesSquare, Plus, Sparkles, TrendingDown } from 'lucide-react'

import { AiChat } from './components/AiChat'
import AnalyticsCanvas from '@/containers/analytics/AnalyticsCanvas'
import type { FormAggregationResult } from '@/lib/analytics/types'
const sidebarItems = [{ icon: Sparkles, label: 'AI Insights', active: true }]

export default function EditorResultPage({
  data,
  isDemo,
}: {
  data: FormAggregationResult
  isDemo?: boolean
}) {
  const [assistantOpen, setAssistantOpen] = useState(false)

  return (
    <Box className=" flex h-full min-h-0 w-full border-0">
      {/*Sidebar*/}
      <Sidebar
        position="left"
        size={'wide'}
        footer={
          <Stack
            gap={'md'}
            className="mx-4 mt-auto mb-4 border border-fg-brand/20 bg-fg-brand/10 p-4"
          >
            <Stack gap="none">
              <Text variant="label" weight="semibold" className="flex-wrap">
                Pro Limits Active
              </Text>
              <Text variant="caption" color="secondary" className="text-wrap">
                Upgrade to unlock deeper tagging, unlimited exports, and team
                seats.
              </Text>
            </Stack>
            <Button variant="outline" size="sm" startIcon={<Plus />} fullWidth>
              Upgrade Workspace
            </Button>
          </Stack>
        }
      >
        <Stack gap="sm" className="p-2 w-full">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <SidebarItem
              fullWidth
              key={label}
              icon={<Icon />}
              label={label}
              active={active}
            />
          ))}
        </Stack>
      </Sidebar>

      <Stack align="stretch" className=" flex-1 p-2xl overflow-y-auto">
        <AnalyticsCanvas data={data} isDemo={isDemo} />
      </Stack>

      <Button
        className=" fixed bottom-2xl right-2xl shadow-action-accent shadow-popout bg-fg-accent/15  rounded-full hover:bg-fg-accent/30 hover:border-action-accent/30 active:bg-action-accent/40 active:border-action-accent/40"
        color={'accent'}
        variant={'glass'}
        startIcon={<Sparkles />}
        onClick={() => setAssistantOpen(true)}
      >
        Ask AI
      </Button>

      <Sheet
        side="right"
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        bgClassName="bg-surface-overlay/40"
      >
        <AiChat setAssistantOpen={setAssistantOpen} />
      </Sheet>
    </Box>
  )
}
