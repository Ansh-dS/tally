import { Type } from 'lucide-react'
import { Input } from '@primitives/Input/Input'
import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@/containers/editor/common-functions'
import { InputSettings } from './InputSettings'

export const InputBlock = {
  label: 'Short Text',
  icon: Type,
  component: Input,
  preview: (
    block?: FormBlock,
    isOverlay?: boolean,
    updateBlock?: UpdateBlockFn
  ) => (
    <Box className={`w-full border-0 ${isOverlay ? 'opacity-80' : ''}`}>
      <Stack gap="sm">
        <Stack direction={'horizontal'}>
          <EditableTitle
            block={block}
            isOverlay={isOverlay}
            updateBlock={updateBlock}
            defaultText="Short Text Question"
          />
          {block?.required && (
            <Text color={'accent'} variant={'caption'} className="ml-s">
              *
            </Text>
          )}
        </Stack>
        <Input
          placeholder={block?.data?.placeholder || 'Short text answer'}
          readOnly
          className="pointer-events-none opacity-60"
        />
      </Stack>
    </Box>
  ),
  settings: InputSettings,
}
