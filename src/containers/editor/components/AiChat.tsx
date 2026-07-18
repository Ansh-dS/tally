import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import { Input } from '@primitives/Input/Input'
import { Send, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@primitives/EmptyState/EmptyState'

interface SheetContentInput {
  setAssistantOpen: (open: boolean) => void
}

export function AiChat({ setAssistantOpen }: SheetContentInput): ReactNode {
  return (
    <Stack gap="none" className="h-full">
      <Box className=" w-full flex justify-end border-0 shadow-raised ">
        <Button
          variant="ghost"
          size="sm"
          collapsed
          aria-label="Close assistant"
          onClick={() => setAssistantOpen(false)}
          startIcon={<X />}
          className="rounded-full"
        />
      </Box>

      <Stack
        gap="md"
        align={'center'}
        justify={'center'}
        className="flex-1  overflow-y-auto "
      >
        <EmptyState
          variant={'minimal'}
          spacing={'spacious'}
          fullWidth
          title="Start With a Question"
          description="Ask me anything about your responses, and I'll surface the insights for you."
          className="p-2xl"
        />
      </Stack>

      <Stack className="shadow-raised flex pt-4 w-full">
        <Stack direction="horizontal" gap="md" className="w-full">
          <Input placeholder="Ask Question?" className="w-full border-0" />
          <Button
            variant="ghost"
            color={'primary'}
            className="rounded-full"
            size={'icon'}
            startIcon={<Send />}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
