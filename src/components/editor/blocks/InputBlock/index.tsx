import { Type } from 'lucide-react'
import { Input, Stack, Box, Text } from 'components'
import { type FormBlock, type UpdateBlockFn } from '@utils/store'
import { EditableTitle } from '@components/editor/common-functions'
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
    <Box className={`w-full ${isOverlay ? 'opacity-80' : ''}`}>
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
        </Stack>{' '}
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
